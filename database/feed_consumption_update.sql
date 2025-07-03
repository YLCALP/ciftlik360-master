-- YEM TÜKETİM SİSTEMİ GÜNCELLEMELER
-- Bu dosyayı Supabase Dashboard'da SQL Editor'de çalıştırın

-- 1. Hayvan yem tüketim ayarları tablosu
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

-- 2. Günlük yem tüketim kayıtları tablosu
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

-- 3. Yem tüketim profilleri tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS feed_consumption_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  species TEXT NOT NULL,
  age_group TEXT,
  feed_type TEXT NOT NULL,
  daily_consumption_per_animal DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS Policies
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

-- 5. Indexler
CREATE INDEX IF NOT EXISTS idx_animal_feed_settings_user_id ON animal_feed_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_animal_feed_settings_species ON animal_feed_settings(species, feed_type);
CREATE INDEX IF NOT EXISTS idx_daily_feed_consumption_user_id ON daily_feed_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_feed_consumption_date ON daily_feed_consumption(consumption_date);
CREATE INDEX IF NOT EXISTS idx_daily_feed_consumption_feed_id ON daily_feed_consumption(feed_id);

-- 6. Updated_at trigger
CREATE TRIGGER update_animal_feed_settings_updated_at
  BEFORE UPDATE ON animal_feed_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Otomatik yem tüketim işleme fonksiyonu
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

-- 8. Yem tüketim raporları için view
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

-- 9. Manuel yem tüketim ekleme fonksiyonu
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

-- 10. Başlangıç için örnek ayarlar oluştur (opsiyonel)
-- INSERT INTO animal_feed_settings (user_id, species, feed_type, daily_consumption_per_animal, auto_deduct_enabled)
-- VALUES 
--   (auth.uid(), 'cattle', 'concentrate', 8.0, true),
--   (auth.uid(), 'cattle', 'roughage', 15.0, true),
--   (auth.uid(), 'sheep', 'concentrate', 1.5, true),
--   (auth.uid(), 'sheep', 'roughage', 3.0, true);

-- Tamamlandı! Artık otomatik yem tüketim sistemi kullanıma hazır. 