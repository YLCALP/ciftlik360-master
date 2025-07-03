-- Çiftlik365 Veritabanı Şeması
-- PRD'ye göre oluşturulan tablolar

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

-- Finansal işlemler tablosu
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income', 'expense'
  category TEXT NOT NULL, -- 'animal_sale', 'milk_sale', 'feed', 'vet', 'fuel', etc.
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Yem Envanteri Tablosu
CREATE TABLE feed_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Trigger for updating users table when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Trigger for updated_at
CREATE TRIGGER update_feed_inventory_updated_at
  BEFORE UPDATE ON feed_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 