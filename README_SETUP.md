# Çiftlik365 - Setup Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Supabase Setup

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. `database/schema.sql` dosyasındaki SQL komutlarını Supabase SQL editörde çalıştırın
4. Project Settings > API'den URL ve anon key'i alın

### 2. Environment Variables

Proje root dizininde `.env` dosyası oluşturun:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Kurulum

```bash
npm install
```

### 4. Çalıştırma

```bash
npx expo start
```

## 📱 Özellikler

### ✅ Tamamlanan
- ✅ Supabase entegrasyonu
- ✅ Veritabanı şeması (8 tablo)
- ✅ Auth Context
- ✅ Giriş yapma ekranı
- ✅ Kayıt olma ekranı
- ✅ Responsive tasarım
- ✅ [Siyah-beyaz renk paleti][[memory:4832177719027370559]]
- ✅ Loading states
- ✅ Form validasyonu

### 🚧 Geliştirilecek
- 🔄 Dashboard ekranı
- 🔄 Hayvan yönetimi modülü
- 🔄 Finansal takip modülü
- 🔄 Görev yönetimi
- 🔄 Raporlama sistemi

## 🗄️ Veritabanı Tabloları

1. **users** - Kullanıcı bilgileri
2. **animals** - Hayvan envanteri
3. **fields** - Tarla yönetimi
4. **health_records** - Sağlık kayıtları
5. **transactions** - Mali işlemler
6. **inventory** - Stok yönetimi
7. **tasks** - Görevler
8. **crop_records** - Mahsul kayıtları

## 🔐 Güvenlik

- Row Level Security (RLS) aktif
- User-based data isolation
- Supabase Auth entegrasyonu
- Secure session management

## 📋 İleriki Adımlar

1. Dashboard ekranını geliştir
2. Hayvan CRUD işlemlerini ekle
3. Finansal modülü oluştur
4. Push notification entegrasyonu
5. Offline support
6. Export/Import özellikleri 