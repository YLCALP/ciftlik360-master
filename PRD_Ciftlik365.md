# Çiftlik365 - Product Requirements Document (PRD)

## 1. Proje Genel Bilgileri

### 1.1 Proje Adı
**Çiftlik365** - Kapsamlı Çiftlik Yönetim Mobil Uygulaması

### 1.2 Proje Vizyonu
Modern teknoloji ile çiftçilerin günlük operasyonlarını dijitalleştirmek, verimliliği artırmak ve sürdürülebilir çiftçilik yapmalarını desteklemek.

### 1.3 Proje Hedefleri
- Çiftlik operasyonlarının dijital takibi
- Hayvan ve tarla verimliliğinin artırılması
- Mali durumun şeffaf takibi
- Veteriner ve tarımsal işlemlerin zamanında yapılması
- Raporlama ve analiz desteği

## 2. Hedef Kullanıcılar

### 2.1 Birincil Kullanıcılar
- **Küçük ve orta ölçekli çiftçiler** (1-500 hayvan)
- **Karma çiftlik işletmecileri** (hayvancılık + tarımcılık)
- **Çiftlik yöneticileri ve işçileri**

### 2.2 İkincil Kullanıcılar
- **Veteriner hekimler** (çiftlik takibi için)
- **Tarım danışmanları**
- **Muhasebeciler** (mali rapor takibi için)

## 3. Ana Özellikler ve Modüller

### 3.1 Hayvan Yönetimi Modülü
#### 3.1.1 Hayvan Envanteri
- Hayvan listesi (büyükbaş, küçükbaş, kanatlı)
- Hayvan profilleri (fotoğraf, küpe no, yaş, cinsiyet, ırk)
- Aile ağacı takibi (anne-baba-yavru ilişkileri)
- Hayvan grupları ve kategoriler

#### 3.1.2 Sağlık Takibi
- Aşı kayıtları ve hatırlatıcıları
- İlaç ve tedavi geçmişi
- Veteriner muayene kayıtları
- Hastalık ve semptom takibi
- Doğum ve üreme kayıtları

#### 3.1.3 Beslenme Takibi
- Günlük yem tüketimi
- Yem türleri ve maliyetleri
- Beslenme programları
- Kilo takibi ve büyüme grafikleri

### 3.2 Tarla ve Arazi Yönetimi
#### 3.2.1 Arazi Envanteri
- Tarla listesi ve lokasyonları
- Alan ölçüleri (dönüm/hektar)
- Toprak analiz sonuçları
- Sulama sistemleri

#### 3.2.2 Mahsul Takibi
- Ekim ve hasat tarihleri
- Tohum ve fide bilgileri
- Gübre ve ilaç uygulamaları
- Verim takibi ve analizi

### 3.3 Finansal Yönetim
#### 3.3.1 Gelir Takibi
- Hayvan satışları (süt, et, yavru)
- Mahsul satışları
- Diğer gelir kalemleri
- Fatura ve makbuz yönetimi

#### 3.3.2 Gider Takibi
- Yem masrafları
- Veteriner giderleri
- İşçilik maliyetleri
- Yakıt ve enerji giderleri
- Tohum, gübre, ilaç masrafları

### 3.4 Stok Yönetimi
- Yem stoku takibi
- İlaç ve aşı stoku
- Tarımsal girdi stokları
- Düşük stok uyarıları
- Tedarikçi bilgileri

### 3.5 Görev ve Hatırlatıcı Sistemi
- Günlük görevler (sağım, besleme, sulama)
- Veteriner randevuları
- Aşı ve ilaç takvimleri
- Ekim ve hasat zamanları
- Push notification desteği

### 3.6 Raporlama ve Analiz
- Mali durum raporları
- Verimlilik analizleri
- Hayvan performans raporları
- Mahsul analiz raporları
- Grafiksel dashboard'lar

## 4. Teknik Gereksinimler

### 4.1 Teknoloji Stack'i
- **Frontend**: React Native + Expo
- **Dil**: JavaScript (.jsx dosyaları)
- **Backend**: Supabase
- **Veritabanı**: PostgreSQL (Supabase)
- **Kimlik Doğrulama**: Supabase Auth
- **Dosya Yönetimi**: Supabase Storage
- **State Management**: Redux Toolkit (karmaşık state'ler için)
- **HTTP Client**: Axios
- **Validasyon**: Zod
- **Navigation**: Expo Router

### 4.2 Platform Desteği
- **iOS**: 12.0 ve üzeri
- **Android**: API Level 21 (Android 5.0) ve üzeri
- **Responsive Design**: Tablet desteği

### 4.3 Offline Özellikler
- Kritik verilerin offline erişimi
- Senkronizasyon mekanizması
- Conflict resolution stratejisi

## 5. UI/UX Gereksinimleri

### 5.1 Tasarım Sistemi
- **Renk Paleti**: Siyah ve Beyaz tonları (şirket kimliği)
- **Tema Desteği**: Light ve Dark mode
- **Accessibility**: WCAG 2.1 AA standardı
- **Responsive**: Farklı ekran boyutları desteği

### 5.2 Kullanıcı Deneyimi
- Basit ve sezgisel navigasyon
- Hızlı veri girişi (form optimization)
- Görsel feedback'ler
- Drag & drop özellikleri
- Gesture desteği

### 5.3 Ana Ekranlar
1. **Dashboard**: Genel özet ve hızlı erişim
2. **Hayvan Listesi**: Filtreleme ve arama
3. **Tarla Yönetimi**: Harita entegrasyonu
4. **Finansal Dashboard**: Grafikler ve trendler
5. **Görev Listesi**: To-do management
6. **Raporlar**: Detaylı analizler
7. **Ayarlar**: Kullanıcı tercihleri

## 6. Veritabanı Tasarımı

### 6.1 Ana Tablolar
```sql
-- Kullanıcılar
users (id, email, name, phone, farm_name, created_at)

-- Hayvanlar
animals (id, user_id, tag_number, name, species, breed, gender, birth_date, mother_id, father_id, photo_url, status, created_at)

-- Tarlalar
fields (id, user_id, name, area_size, location, soil_type, created_at)

-- Sağlık Kayıtları
health_records (id, animal_id, record_type, description, treatment, vet_name, date, cost, next_checkup)

-- Finansal İşlemler
transactions (id, user_id, type, category, amount, description, date, invoice_url)

-- Stok
inventory (id, user_id, item_name, category, quantity, unit, min_threshold, supplier, cost_per_unit)

-- Görevler
tasks (id, user_id, title, description, due_date, priority, status, category)

-- Mahsul Kayıtları
crop_records (id, field_id, crop_type, planting_date, harvest_date, yield_amount, notes)
```

### 6.2 İlişkiler ve Constraints
- User-based data isolation (RLS policies)
- Foreign key constraints
- Index optimization for queries
- Audit trail için trigger'lar

## 7. API Gereksinimleri

### 7.1 Supabase Entegrasyonu
- **Real-time subscriptions**: Anlık veri güncellemeleri
- **Row Level Security**: Kullanıcı bazlı veri güvenliği
- **Edge Functions**: Özel iş mantığı için
- **Storage**: Fotoğraf ve dosya yönetimi

### 7.2 Temel API Endpoint'leri
```javascript
// Hayvan işlemleri
GET /animals - Hayvan listesi
POST /animals - Yeni hayvan ekleme
PUT /animals/:id - Hayvan güncelleme
DELETE /animals/:id - Hayvan silme

// Sağlık kayıtları
GET /health-records/:animal_id - Hayvan sağlık geçmişi
POST /health-records - Yeni kayıt ekleme

// Finansal işlemler
GET /transactions - İşlem listesi (filtreleme desteği)
POST /transactions - Yeni işlem ekleme
GET /financial-summary - Mali özet

// Görevler
GET /tasks - Görev listesi
POST /tasks - Yeni görev ekleme
PUT /tasks/:id - Görev güncelleme
```

### 7.3 Üçüncü Parti Entegrasyonlar
- **Harita Servisleri**: Google Maps / Apple Maps
- **Hava Durumu API**: Tarımsal planlama için
- **Push Notifications**: Expo Notifications
- **SMS/Email**: Hatırlatıcılar için

## 8. Güvenlik Gereksinimleri

### 8.1 Kimlik Doğrulama
- Email/şifre ile giriş
- İki faktörlü kimlik doğrulama (opsiyonel)
- Biyometrik giriş desteği

### 8.2 Veri Güvenliği
- End-to-end encryption (hassas veriler için)
- GDPR uyumluluğu
- Veri yedekleme stratejisi
- Güvenli veri silme

### 8.3 Uygulama Güvenliği
- SSL pinning
- Jailbreak/root detection
- Code obfuscation
- API rate limiting

## 9. Performans Gereksinimleri

### 9.1 Performans Hedefleri
- **Uygulama başlangıç süresi**: < 3 saniye
- **Sayfa geçiş süreleri**: < 1 saniye
- **API yanıt süreleri**: < 2 saniye
- **Offline sync süresi**: < 10 saniye

### 9.2 Optimizasyon Stratejileri
- Lazy loading
- Image optimization
- Data pagination
- Caching strategies
- Bundle size optimization

## 10. Test Gereksinimleri

### 10.1 Test Türleri
- **Unit Tests**: Component ve function testleri
- **Integration Tests**: API entegrasyon testleri
- **E2E Tests**: Kritik user flow'ları
- **Performance Tests**: Load testing
- **Security Tests**: Penetrasyon testleri

### 10.2 Test Kapsamı
- Minimum %80 code coverage
- Automated testing pipeline
- Device farm testing (iOS/Android)
- Accessibility testing

## 11. Geliştirme Aşamaları

### 11.1 Faz 1 - MVP (8 hafta)
**Hedef**: Temel çiftlik yönetimi özellikleri
- Kullanıcı kaydı ve girişi
- Temel hayvan yönetimi (CRUD)
- Basit finansal takip
- Görev listesi
- Temel raporlama

### 11.2 Faz 2 - Gelişmiş Özellikler (6 hafta)
- Tarla yönetimi
- Gelişmiş sağlık takibi
- Stok yönetimi
- Hatırlatıcı sistemi
- Offline support

### 11.3 Faz 3 - Analiz ve Optimizasyon (4 hafta)
- Gelişmiş raporlama
- Dashboard analytics
- Performance optimizations
- Push notifications
- Üçüncü parti entegrasyonlar

### 11.4 Faz 4 - Ölçeklendirme (4 hafta)
- Multi-farm support
- Team collaboration
- Advanced security
- Export/import özellikleri
- Beta test ve feedback

## 12. Başarı Metrikleri

### 12.1 Kullanıcı Metrikleri
- **Daily Active Users (DAU)**: Hedef 70%
- **Monthly Retention**: Hedef 60%
- **Session Duration**: Hedef 10+ dakika
- **Feature Adoption**: Core features için 80%+

### 12.2 Teknik Metrikleri
- **App Store Rating**: 4.5+ yıldız
- **Crash Rate**: < 1%
- **API Uptime**: 99.9%
- **Response Time**: P95 < 2s

### 12.3 İş Metrikleri
- **Cost Per Acquisition**: Hedef $10
- **Lifetime Value**: Hedef $100+
- **Churn Rate**: < 5% monthly
- **NPS Score**: 70+

## 13. Risk Analizi

### 13.1 Teknik Riskler
- **Supabase vendor lock-in**: Migration planı hazırlığı
- **Performance bottlenecks**: Monitoring ve alerting
- **Data migration**: Backup ve recovery stratejisi

### 13.2 İş Riskleri
- **User adoption**: Iterative development ve feedback
- **Competition**: Unique value proposition
- **Seasonality**: Agricultural cycle awareness

### 13.3 Risk Azaltma Stratejileri
- Agile development methodology
- Regular user testing
- Performance monitoring
- Security audits
- Backup plans

## 14. Sonuç

Çiftlik365 uygulaması, modern çiftçilik operasyonlarını dijitalleştirmek için kapsamlı bir çözüm sunacaktır. Expo ve Supabase teknolojileri kullanarak hızlı geliştirme süreci sağlanırken, kullanıcı dostu arayüz ve güçlü özelliklerle çiftçilerin verimliliğini artırmayı hedeflemektedir.

Bu PRD dokümanı, projenin tüm paydaşları için yol haritası niteliğinde olup, geliştirme sürecinde referans alınacak temel dokümandır. 