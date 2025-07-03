-- Animals tablosuna eksik sütunları ekle

-- Notes sütunu ekle
ALTER TABLE animals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Weight sütunu ekle  
ALTER TABLE animals ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2);

-- Updated_at sütunu ekle
ALTER TABLE animals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Updated_at trigger'ı oluştur
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Animals tablosu için trigger oluştur
DROP TRIGGER IF EXISTS update_animals_updated_at ON animals;
CREATE TRIGGER update_animals_updated_at
    BEFORE UPDATE ON animals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Hayvan ve yem alım-satım işlemleri için finansal sistem genişletmesi

-- Transactions tablosuna yeni kolonlar ekle
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS animal_id UUID REFERENCES animals(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS feed_id UUID REFERENCES feed_inventory(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference_transaction_id UUID REFERENCES transactions(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS profit_loss DECIMAL(10,2);

-- Genel alım-satım işlemleri tablosu (hayvan ve yem için)
CREATE TABLE IF NOT EXISTS purchase_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('animal', 'feed')),
  item_id UUID NOT NULL, -- animal_id veya feed_id
  item_name VARCHAR(255), -- hayvan tag_number veya yem adı
  purchase_transaction_id UUID REFERENCES transactions(id),
  sale_transaction_id UUID REFERENCES transactions(id),
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  purchase_date DATE,
  sale_date DATE,
  purchase_quantity DECIMAL(10,2),
  sale_quantity DECIMAL(10,2),
  unit_type VARCHAR(50), -- adet, kg, ton vs.
  profit_loss DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finansal kategoriler için enum veya constraint ekle
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_category;
ALTER TABLE transactions ADD CONSTRAINT check_category 
  CHECK (category IN (
    'animal_purchase',    -- Hayvan alımı
    'animal_sale',        -- Hayvan satışı
    'feed_purchase',      -- Yem alımı
    'feed_sale',          -- Yem satışı (nadiren)
    'veterinary',         -- Veteriner giderleri
    'medicine',           -- İlaç giderleri
    'vaccination',        -- Aşı giderleri
    'equipment',          -- Ekipman alımı
    'maintenance',        -- Bakım giderleri
    'fuel',              -- Yakıt giderleri
    'electricity',       -- Elektrik giderleri
    'water',             -- Su giderleri
    'insurance',         -- Sigorta giderleri
    'tax',               -- Vergi ödemeleri
    'labor',             -- İşçilik giderleri
    'milk_sale',         -- Süt satışı
    'egg_sale',          -- Yumurta satışı
    'manure_sale',       -- Gübre satışı
    'other_income',      -- Diğer gelirler
    'other_expense'      -- Diğer giderler
  ));

-- Transaction type constraint'i güncelle
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_type;
ALTER TABLE transactions ADD CONSTRAINT check_type 
  CHECK (type IN ('income', 'expense', 'transfer'));

-- Purchase sales tablosu için policies
ALTER TABLE purchase_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own purchase sales" ON purchase_sales
  FOR ALL USING (auth.uid() = user_id);

-- Indexler ekle
CREATE INDEX IF NOT EXISTS idx_transactions_animal_id ON transactions(animal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_feed_id ON transactions(feed_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_purchase_sales_user_id ON purchase_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_sales_item_id ON purchase_sales(item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_sales_type ON purchase_sales(transaction_type);

-- Hayvan ve yem satışı sonrası otomatik kâr/zarar hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_profit_loss()
RETURNS TRIGGER AS $$
BEGIN
  -- Hayvan satışı işlemi ise kâr/zarar hesapla
  IF NEW.category = 'animal_sale' AND NEW.animal_id IS NOT NULL THEN
    DECLARE
      purchase_price DECIMAL(10,2);
    BEGIN
      SELECT amount INTO purchase_price
      FROM transactions
      WHERE animal_id = NEW.animal_id
        AND category = 'animal_purchase'
        AND type = 'expense'
      ORDER BY date ASC
      LIMIT 1;
      
      IF purchase_price IS NOT NULL THEN
        NEW.profit_loss := NEW.amount - purchase_price;
      END IF;
    END;
  END IF;
  
  -- Yem satışı işlemi ise kâr/zarar hesapla
  IF NEW.category = 'feed_sale' AND NEW.feed_id IS NOT NULL THEN
    DECLARE
      purchase_price DECIMAL(10,2);
      purchase_quantity DECIMAL(10,2);
      unit_cost DECIMAL(10,2);
    BEGIN
      SELECT amount, quantity INTO purchase_price, purchase_quantity
      FROM transactions
      WHERE feed_id = NEW.feed_id
        AND category = 'feed_purchase'
        AND type = 'expense'
      ORDER BY date ASC
      LIMIT 1;
      
      IF purchase_price IS NOT NULL AND purchase_quantity IS NOT NULL AND purchase_quantity > 0 THEN
        unit_cost := purchase_price / purchase_quantity;
        NEW.profit_loss := NEW.amount - (unit_cost * NEW.quantity);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ekle
DROP TRIGGER IF EXISTS trigger_calculate_profit_loss ON transactions;
CREATE TRIGGER trigger_calculate_profit_loss
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profit_loss();

-- Hayvan statusu otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_animal_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Hayvan satışı işlemi ise hayvan statusunu 'sold' yap
  IF NEW.category = 'animal_sale' AND NEW.animal_id IS NOT NULL THEN
    UPDATE animals 
    SET status = 'sold' 
    WHERE id = NEW.animal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ekle
DROP TRIGGER IF EXISTS trigger_update_animal_status ON transactions;
CREATE TRIGGER trigger_update_animal_status
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_animal_status_on_sale();

-- Yem stok güncellemesi fonksiyonu
CREATE OR REPLACE FUNCTION update_feed_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Yem alımı ise stok artır
  IF NEW.category = 'feed_purchase' AND NEW.feed_id IS NOT NULL THEN
    UPDATE feed_inventory
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.feed_id;
  END IF;
  
  -- Yem satışı ise stok azalt
  IF NEW.category = 'feed_sale' AND NEW.feed_id IS NOT NULL THEN
    UPDATE feed_inventory
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.feed_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ekle
DROP TRIGGER IF EXISTS trigger_update_feed_stock ON transactions;
CREATE TRIGGER trigger_update_feed_stock
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_stock();

-- Eski animal_sales tablosundan verileri purchase_sales'e aktar (eğer varsa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animal_sales') THEN
    INSERT INTO purchase_sales (
      user_id, transaction_type, item_id, item_name, 
      purchase_price, sale_price, purchase_date, sale_date, 
      profit_loss, notes, created_at
    )
    SELECT 
      user_id, 'animal', animal_id, 
      (SELECT CONCAT(tag_number, ' - ', name) FROM animals WHERE id = animal_sales.animal_id),
      purchase_price, sale_price, purchase_date, sale_date,
      profit_loss, notes, created_at
    FROM animal_sales;
    
    -- Eski tabloyu kaldır
    DROP TABLE animal_sales;
  END IF;
END $$; 