-- Çiftlik365 Tam Veritabanı Şeması
-- PRD'ye göre oluşturulan tablolar + ek kolonlar

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hayvanlar tablosu
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_number TEXT NOT NULL,
  name TEXT,
  species TEXT NOT NULL, -- 'cattle', 'sheep', 'goat', 'poultry', 'other'
  breed TEXT,
  gender TEXT NOT NULL, -- 'male', 'female'
  birth_date DATE,
  mother_id UUID REFERENCES animals(id),
  father_id UUID REFERENCES animals(id),
  photo_url TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'sold', 'deceased', 'sick'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag_number)
);

-- Tarlalar tablosu
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area_size DECIMAL(10,2), -- dönüm/hektar
  location TEXT, -- koordinat veya adres
  soil_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sağlık kayıtları tablosu
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'vaccination', 'treatment', 'checkup', 'birth', 'illness'
  description TEXT NOT NULL,
  treatment TEXT,
  vet_name TEXT,
  date DATE NOT NULL,
  cost DECIMAL(10,2),
  next_checkup DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yem Envanteri Tablosu
CREATE TABLE IF NOT EXISTS feed_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_name VARCHAR(255) NOT NULL,
  feed_type VARCHAR(100) NOT NULL, -- 'concentrate', 'roughage', 'supplement', 'other'
  brand VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg', -- 'kg', 'ton', 'bag', 'liter'
  price_per_unit DECIMAL(10,2),
  purchase_date DATE,
  expiry_date DATE,
  supplier VARCHAR(255),
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  storage_location VARCHAR(255),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finansal işlemler tablosu (güncellenmiş)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income', 'expense'
  category TEXT NOT NULL, -- 'animal_sale', 'milk_sale', 'feed', 'vet', 'fuel', etc.
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  invoice_url TEXT,
  animal_id UUID REFERENCES animals(id), -- Hayvan işlemleri için
  feed_id UUID REFERENCES feed_inventory(id), -- Yem işlemleri için
  reference_transaction_id UUID REFERENCES transactions(id), -- İlişkili işlem (alım-satım)
  unit_price DECIMAL(10,2), -- Birim fiyat
  quantity DECIMAL(10,2), -- Miktar
  profit_loss DECIMAL(10,2), -- Kâr/zarar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alım-satım tablosu (hayvan ve yem)
CREATE TABLE IF NOT EXISTS purchase_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'animal', 'feed'
  item_id UUID NOT NULL, -- animals.id veya feed_inventory.id
  item_name TEXT NOT NULL,
  purchase_transaction_id UUID REFERENCES transactions(id),
  sale_transaction_id UUID REFERENCES transactions(id),
  purchase_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2) DEFAULT 0,
  purchase_date DATE,
  sale_date DATE,
  purchase_quantity DECIMAL(10,2) DEFAULT 1,
  sale_quantity DECIMAL(10,2) DEFAULT 1,
  unit_type TEXT DEFAULT 'adet', -- 'adet', 'kg', 'liter'
  profit_loss DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stok tablosu
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'feed', 'medicine', 'vaccine', 'seed', 'fertilizer', 'equipment'
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL, -- 'kg', 'liter', 'pieces', 'bags'
  min_threshold DECIMAL(10,2), -- minimum stok uyarısı için
  supplier TEXT,
  cost_per_unit DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Görevler tablosu
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  category TEXT, -- 'feeding', 'milking', 'vaccination', 'field_work', 'maintenance'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mahsul kayıtları tablosu
CREATE TABLE IF NOT EXISTS crop_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  planting_date DATE,
  harvest_date DATE,
  yield_amount DECIMAL(10,2), -- kg veya ton
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler (performans için)
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_tag_number ON animals(tag_number);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_sales ENABLE ROW LEVEL SECURITY;

-- Users tablosu policies
CREATE POLICY "Users can only see their own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Animals tablosu policies
CREATE POLICY "Users can only see their own animals" ON animals
  FOR ALL USING (auth.uid() = user_id);

-- Fields tablosu policies
CREATE POLICY "Users can only see their own fields" ON fields
  FOR ALL USING (auth.uid() = user_id);

-- Health records tablosu policies
CREATE POLICY "Users can only see health records of their animals" ON health_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM animals
      WHERE animals.id = health_records.animal_id
      AND animals.user_id = auth.uid()
    )
  );

-- Transactions tablosu policies
CREATE POLICY "Users can only see their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Inventory tablosu policies
CREATE POLICY "Users can only see their own inventory" ON inventory
  FOR ALL USING (auth.uid() = user_id);

-- Tasks tablosu policies
CREATE POLICY "Users can only see their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Crop records tablosu policies
CREATE POLICY "Users can only see crop records of their fields" ON crop_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM fields
      WHERE fields.id = crop_records.field_id
      AND fields.user_id = auth.uid()
    )
  );

-- Feed inventory policies
CREATE POLICY "Users can view their own feed inventory" ON feed_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed inventory" ON feed_inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed inventory" ON feed_inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed inventory" ON feed_inventory
  FOR DELETE USING (auth.uid() = user_id);

-- Purchase sales policies
CREATE POLICY "Users can view their own purchase sales" ON purchase_sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase sales" ON purchase_sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase sales" ON purchase_sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase sales" ON purchase_sales
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

CREATE TRIGGER update_feed_inventory_updated_at
  BEFORE UPDATE ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_sales_updated_at
  BEFORE UPDATE ON purchase_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Kâr/zarar hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_profit_loss()
RETURNS TRIGGER AS $$
BEGIN
  -- Hayvan satışı ise kâr/zarar hesapla
  IF NEW.category = 'animal_sale' AND NEW.animal_id IS NOT NULL THEN
    -- Alış fiyatını bul
    SELECT amount INTO NEW.reference_transaction_id
    FROM transactions
    WHERE animal_id = NEW.animal_id 
      AND category = 'animal_purchase'
      AND type = 'expense'
    ORDER BY date ASC
    LIMIT 1;
    
    -- Kâr/zarar hesapla
    IF NEW.reference_transaction_id IS NOT NULL THEN
      SELECT (NEW.amount - amount) INTO NEW.profit_loss
      FROM transactions
      WHERE id = NEW.reference_transaction_id;
    END IF;
    
    -- Hayvan statusunu 'sold' yap
    UPDATE animals
    SET status = 'sold'
    WHERE id = NEW.animal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Triggers for automatic calculations
CREATE TRIGGER calculate_profit_loss_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profit_loss();

CREATE TRIGGER update_feed_stock_trigger
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_stock();

-- YEM TÜKETİM SİSTEMİ TABLOLARI
-- Hayvan yem tüketim ayarları tablosu
CREATE TABLE IF NOT EXISTS animal_feed_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species TEXT NOT NULL, -- 'cattle', 'sheep', 'goat', 'poultry'
  feed_type TEXT NOT NULL, -- 'concentrate', 'roughage', 'supplement'
  daily_consumption_per_animal DECIMAL(10,2) NOT NULL DEFAULT 0,
  auto_deduct_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, species, feed_type)
);

-- Günlük yem tüketim kayıtları tablosu
CREATE TABLE IF NOT EXISTS daily_feed_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feed_id UUID NOT NULL REFERENCES feed_inventory(id) ON DELETE CASCADE,
  consumption_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_animals_count INTEGER NOT NULL DEFAULT 0,
  consumption_per_animal DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  species TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  is_manual BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feed_id, consumption_date)
);

-- Yem tüketim profilleri tablosu (opsiyonel önceden tanımlı profiler için)
CREATE TABLE IF NOT EXISTS feed_consumption_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL, -- 'Büyükbaş Yetişkin', 'Küçükbaş Genç' vs.
  species TEXT NOT NULL, -- 'cattle', 'sheep', 'goat', 'poultry'
  age_group TEXT, -- 'young', 'adult', 'senior'
  feed_type TEXT NOT NULL, -- 'concentrate', 'roughage'
  daily_consumption_per_animal DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yem tüketim tabloları için RLS policies
ALTER TABLE animal_feed_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption_profiles ENABLE ROW LEVEL SECURITY;

-- Animal feed settings policies
CREATE POLICY "Users can manage their own feed settings" ON animal_feed_settings
  FOR ALL USING (auth.uid() = user_id);

-- Daily feed consumption policies
CREATE POLICY "Users can manage their own feed consumption records" ON daily_feed_consumption
  FOR ALL USING (auth.uid() = user_id);

-- Feed consumption profiles policies
CREATE POLICY "Users can manage their own consumption profiles" ON feed_consumption_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_animal_feed_settings_user_id ON animal_feed_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_animal_feed_settings_species ON animal_feed_settings(species, feed_type);
CREATE INDEX IF NOT EXISTS idx_daily_feed_consumption_user_id ON daily_feed_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_feed_consumption_date ON daily_feed_consumption(consumption_date);
CREATE INDEX IF NOT EXISTS idx_daily_feed_consumption_feed_id ON daily_feed_consumption(feed_id);

-- Updated_at trigger for new tables
CREATE TRIGGER update_animal_feed_settings_updated_at
  BEFORE UPDATE ON animal_feed_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- OTOMATIK YEM TÜKETİM FONKSİYONLARI
-- Günlük yem tüketimini hesapla ve stoktan düş
CREATE OR REPLACE FUNCTION process_daily_feed_consumption()
RETURNS TABLE(
  processed_records INTEGER,
  total_consumption DECIMAL,
  warnings TEXT[]
) AS $$
DECLARE
  user_record RECORD;
  feed_record RECORD;
  animal_count INTEGER;
  consumption_amount DECIMAL(10,2);
  setting_record RECORD;
  processed_count INTEGER := 0;
  total_consumed DECIMAL(10,2) := 0;
  warning_messages TEXT[] := ARRAY[]::TEXT[];
  current_stock DECIMAL(10,2);
BEGIN
  -- Her kullanıcı için işlem yap
  FOR user_record IN SELECT id FROM users LOOP
    
    -- Bu kullanıcının aktif yem tüketim ayarlarını al
    FOR setting_record IN 
      SELECT * FROM animal_feed_settings 
      WHERE user_id = user_record.id AND auto_deduct_enabled = true 
    LOOP
      
      -- Bu tür için aktif hayvan sayısını say
      SELECT COUNT(*) INTO animal_count
      FROM animals 
      WHERE user_id = user_record.id 
        AND species = setting_record.species 
        AND status = 'active';
      
      IF animal_count > 0 THEN
        -- Günlük tüketim miktarını hesapla
        consumption_amount := animal_count * setting_record.daily_consumption_per_animal;
        
        -- Bu türe uygun yemleri bul (stok miktarına göre sırala)
        FOR feed_record IN 
          SELECT * FROM feed_inventory 
          WHERE user_id = user_record.id 
            AND feed_type = setting_record.feed_type
            AND quantity > 0
          ORDER BY purchase_date ASC, quantity DESC
        LOOP
          
          current_stock := feed_record.quantity;
          
          -- Stoktan düş (eğer yeterli varsa)
          IF current_stock >= consumption_amount THEN
            UPDATE feed_inventory 
            SET quantity = quantity - consumption_amount,
                updated_at = NOW()
            WHERE id = feed_record.id;
            
            -- Tüketim kaydı oluştur veya güncelle
            INSERT INTO daily_feed_consumption (
              user_id, feed_id, consumption_date, total_animals_count,
              consumption_per_animal, total_consumption, remaining_stock,
              species, feed_type
            ) VALUES (
              user_record.id, feed_record.id, CURRENT_DATE, animal_count,
              setting_record.daily_consumption_per_animal, consumption_amount,
              current_stock - consumption_amount, setting_record.species, setting_record.feed_type
            ) ON CONFLICT (user_id, feed_id, consumption_date) 
            DO UPDATE SET
              total_animals_count = EXCLUDED.total_animals_count,
              total_consumption = EXCLUDED.total_consumption,
              remaining_stock = EXCLUDED.remaining_stock,
              consumption_per_animal = EXCLUDED.consumption_per_animal;
            
            processed_count := processed_count + 1;
            total_consumed := total_consumed + consumption_amount;
            
            -- Düşük stok uyarısı kontrol et
            IF (current_stock - consumption_amount) <= feed_record.min_stock_level THEN
              warning_messages := array_append(warning_messages, 
                format('DÜŞÜK STOK: %s (%s) - Kalan: %s %s', 
                  feed_record.feed_name, 
                  feed_record.feed_type,
                  (current_stock - consumption_amount), 
                  feed_record.unit));
            END IF;
            
            EXIT; -- Bu yem türü için yeterli, diğer yemlere geçme
            
          ELSIF current_stock > 0 THEN
            -- Kısmi tüketim (stok yeterli değil ama bir miktar var)
            UPDATE feed_inventory 
            SET quantity = 0,
                updated_at = NOW()
            WHERE id = feed_record.id;
            
            INSERT INTO daily_feed_consumption (
              user_id, feed_id, consumption_date, total_animals_count,
              consumption_per_animal, total_consumption, remaining_stock,
              species, feed_type, notes
            ) VALUES (
              user_record.id, feed_record.id, CURRENT_DATE, animal_count,
              setting_record.daily_consumption_per_animal, current_stock,
              0, setting_record.species, setting_record.feed_type,
              format('Yetersiz stok! İhtiyaç: %s, Mevcut: %s', consumption_amount, current_stock)
            ) ON CONFLICT (user_id, feed_id, consumption_date) 
            DO UPDATE SET
              total_consumption = EXCLUDED.total_consumption,
              remaining_stock = 0,
              notes = EXCLUDED.notes;
            
            consumption_amount := consumption_amount - current_stock;
            total_consumed := total_consumed + current_stock;
            
            warning_messages := array_append(warning_messages, 
              format('STOK TÜKENDİ: %s - Eksik: %s %s', 
                feed_record.feed_name, 
                consumption_amount, 
                feed_record.unit));
          END IF;
        END LOOP;
        
        -- Hiç yem bulunamadıysa uyarı
        IF NOT EXISTS (
          SELECT 1 FROM feed_inventory 
          WHERE user_id = user_record.id 
            AND feed_type = setting_record.feed_type
            AND quantity > 0
        ) THEN
          warning_messages := array_append(warning_messages, 
            format('YEM BULUNAMADI: %s türü için %s tipinde yem stoku yok!', 
              setting_record.species, 
              setting_record.feed_type));
        END IF;
        
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN QUERY SELECT processed_count, total_consumed, warning_messages;
END;
$$ LANGUAGE plpgsql;

-- Yem tüketim raporları için view
CREATE OR REPLACE VIEW feed_consumption_summary AS
SELECT 
  dfc.user_id,
  dfc.consumption_date,
  dfc.species,
  dfc.feed_type,
  COUNT(DISTINCT dfc.feed_id) as feed_varieties_used,
  SUM(dfc.total_consumption) as total_daily_consumption,
  AVG(dfc.consumption_per_animal) as avg_consumption_per_animal,
  SUM(dfc.total_animals_count) as total_animals,
  STRING_AGG(fi.feed_name, ', ') as feeds_used
FROM daily_feed_consumption dfc
JOIN feed_inventory fi ON dfc.feed_id = fi.id
GROUP BY dfc.user_id, dfc.consumption_date, dfc.species, dfc.feed_type
ORDER BY dfc.consumption_date DESC;

-- Manuel yem tüketim ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_manual_feed_consumption(
  p_feed_id UUID,
  p_consumption_amount DECIMAL,
  p_animal_count INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  current_user_id UUID;
  feed_info RECORD;
  consumption_id UUID;
BEGIN
  -- Kullanıcı ID'sini al
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Yem bilgilerini al
  SELECT * INTO feed_info
  FROM feed_inventory 
  WHERE id = p_feed_id AND user_id = current_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Feed not found or access denied';
  END IF;
  
  -- Stok kontrolü
  IF feed_info.quantity < p_consumption_amount THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', 
      feed_info.quantity, p_consumption_amount;
  END IF;
  
  -- Stoktan düş
  UPDATE feed_inventory 
  SET quantity = quantity - p_consumption_amount,
      updated_at = NOW()
  WHERE id = p_feed_id;
  
  -- Tüketim kaydı oluştur
  INSERT INTO daily_feed_consumption (
    user_id, feed_id, consumption_date, total_animals_count,
    consumption_per_animal, total_consumption, remaining_stock,
    species, feed_type, is_manual, notes
  ) VALUES (
    current_user_id, p_feed_id, CURRENT_DATE, p_animal_count,
    CASE WHEN p_animal_count > 0 THEN p_consumption_amount / p_animal_count ELSE 0 END,
    p_consumption_amount, feed_info.quantity - p_consumption_amount,
    'manual', feed_info.feed_type, true, p_notes
  ) 
  RETURNING id INTO consumption_id;
  
  RETURN consumption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 