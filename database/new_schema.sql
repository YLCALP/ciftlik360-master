-- Çiftlik365 Yeni Veritabanı Şeması
-- Users tablosu hariç diğer tabloları temizle ve yeniden oluştur

-- Mevcut tabloları sil (users hariç)
DROP TABLE IF EXISTS crop_records CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS purchase_sales CASCADE;
DROP TABLE IF EXISTS feed_inventory CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS animals CASCADE;

-- Hayvanlar tablosu - alış fiyatı ile birlikte
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_number TEXT NOT NULL,
  name TEXT,
  species TEXT NOT NULL, -- 'cattle', 'sheep', 'goat', 'poultry', 'other'
  breed TEXT,
  gender TEXT NOT NULL, -- 'male', 'female'
  birth_date DATE,
  weight DECIMAL(10,2), -- Ağırlık (kg)
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0, -- Alış fiyatı
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'sold', 'deceased'
  sold_price DECIMAL(10,2), -- Satış fiyatı (satıldığında)
  sold_date DATE, -- Satış tarihi
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag_number)
);

-- Yem envanteri tablosu - alış fiyatı ile birlikte
CREATE TABLE feed_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feed_name TEXT NOT NULL,
  feed_type TEXT NOT NULL, -- 'concentrate', 'roughage', 'supplement', 'other'
  brand TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg', -- 'kg', 'ton', 'bag', 'liter'
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0, -- Toplam alış fiyatı
  price_per_unit DECIMAL(10,2), -- Birim fiyat (otomatik hesaplanacak)
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  supplier TEXT,
  storage_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finansal işlemler tablosu
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL, -- 'animal_purchase', 'animal_sale', 'feed_purchase', 'veterinary', 'fuel', 'equipment', vb.
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Referans alanları
  animal_id UUID REFERENCES animals(id), -- Hayvan işlemleri için
  feed_id UUID REFERENCES feed_inventory(id), -- Yem işlemleri için
  
  -- Otomatik işlem mi manuel mi?
  is_automatic BOOLEAN DEFAULT FALSE, -- Hayvan/yem eklendiğinde otomatik oluşturulan işlemler
  
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_animals_user_id ON animals(user_id);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_tag_number ON animals(tag_number);
CREATE INDEX idx_feed_inventory_user_id ON feed_inventory(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_animal_id ON transactions(animal_id);
CREATE INDEX idx_transactions_feed_id ON transactions(feed_id);

-- Row Level Security
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own animals" ON animals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own feed inventory" ON feed_inventory
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Trigger fonksiyonları

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hayvan eklendiğinde otomatik gider işlemi oluştur
CREATE OR REPLACE FUNCTION create_animal_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Sadece purchase_price > 0 ise transaction oluştur
  IF NEW.purchase_price > 0 THEN
    INSERT INTO transactions (
      user_id, 
      type, 
      category, 
      amount, 
      description, 
      date, 
      animal_id, 
      is_automatic
    ) VALUES (
      NEW.user_id,
      'expense',
      'animal_purchase',
      NEW.purchase_price,
      NEW.tag_number || ' - ' || COALESCE(NEW.name, 'İsimsiz') || ' hayvan alımı',
      NEW.purchase_date,
      NEW.id,
      TRUE
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Yem eklendiğinde otomatik gider işlemi oluştur
CREATE OR REPLACE FUNCTION create_feed_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Sadece purchase_price > 0 ise transaction oluştur
  IF NEW.purchase_price > 0 THEN
    INSERT INTO transactions (
      user_id, 
      type, 
      category, 
      amount, 
      description, 
      date, 
      feed_id, 
      is_automatic
    ) VALUES (
      NEW.user_id,
      'expense',
      'feed_purchase',
      NEW.purchase_price,
      NEW.feed_name || ' yem alımı (' || NEW.quantity || ' ' || NEW.unit || ')',
      NEW.purchase_date,
      NEW.id,
      TRUE
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Birim fiyat hesaplama trigger'ı (BEFORE INSERT)
CREATE OR REPLACE FUNCTION calculate_feed_unit_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Birim fiyatı hesapla
  IF NEW.quantity > 0 AND NEW.purchase_price > 0 THEN
    NEW.price_per_unit = NEW.purchase_price / NEW.quantity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hayvan satışında status güncelle
CREATE OR REPLACE FUNCTION update_animal_sale_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Hayvan satış işlemi ise hayvan statusunu güncelle
  IF NEW.category = 'animal_sale' AND NEW.animal_id IS NOT NULL THEN
    UPDATE animals 
    SET 
      status = 'sold',
      sold_price = NEW.amount,
      sold_date = NEW.date
    WHERE id = NEW.animal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggerlar
CREATE TRIGGER update_feed_inventory_updated_at
  BEFORE UPDATE ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_animal_purchase_transaction
  AFTER INSERT ON animals
  FOR EACH ROW
  EXECUTE FUNCTION create_animal_purchase_transaction();

CREATE TRIGGER trigger_feed_unit_price
  BEFORE INSERT ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION calculate_feed_unit_price();

CREATE TRIGGER trigger_feed_purchase_transaction
  AFTER INSERT ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION create_feed_purchase_transaction();

CREATE TRIGGER trigger_animal_sale_status
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_animal_sale_status();

-- Hayvan güncellenmesi durumunda transaction güncelle
CREATE OR REPLACE FUNCTION update_animal_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer purchase_price değiştiyse ilgili transaction'ı güncelle
  IF NEW.purchase_price != OLD.purchase_price THEN
    UPDATE transactions 
    SET 
      amount = NEW.purchase_price,
      description = NEW.tag_number || ' - ' || COALESCE(NEW.name, 'İsimsiz') || ' hayvan alımı',
      date = NEW.purchase_date
    WHERE animal_id = NEW.id 
      AND category = 'animal_purchase' 
      AND is_automatic = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_animal_purchase_update
  AFTER UPDATE ON animals
  FOR EACH ROW
  EXECUTE FUNCTION update_animal_purchase_transaction();

-- Yem güncellenmesi durumunda transaction güncelle
CREATE OR REPLACE FUNCTION update_feed_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer purchase_price değiştiyse ilgili transaction'ı güncelle
  IF NEW.purchase_price != OLD.purchase_price OR NEW.quantity != OLD.quantity THEN
    UPDATE transactions 
    SET 
      amount = NEW.purchase_price,
      description = NEW.feed_name || ' yem alımı (' || NEW.quantity || ' ' || NEW.unit || ')',
      date = NEW.purchase_date
    WHERE feed_id = NEW.id 
      AND category = 'feed_purchase' 
      AND is_automatic = TRUE;
      
    -- Birim fiyatı güncelle
    IF NEW.quantity > 0 THEN
      NEW.price_per_unit = NEW.purchase_price / NEW.quantity;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feed_unit_price_update
  BEFORE UPDATE ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION calculate_feed_unit_price();

CREATE TRIGGER trigger_feed_purchase_update
  AFTER UPDATE ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_purchase_transaction(); 