# 🎓 İstanbul Üniversitesi Kampüs Etkinlikleri Platformu

## 📋 Proje Durumu ve Kapsamlı Analiz Raporu

Bu rapor, projenin mevcut durumunu, eksiklikleri ve gelecekteki geliştirme planlarını kapsamlı bir şekilde sunmaktadır. Yeni başlayacak geliştiriciler için detaylı rehber niteliğindedir.

---

## 🚀 Projenin Genel Amacı

Modern bir kampüs etkinlikleri yönetim sistemi. Üniversite kulüplerinin etkinlik yönetimi, içerik onay süreçleri ve öğrencilerin etkinliklere katılım süreçlerini dijitalleştiren kapsamlı bir platform.

### 🎯 Ana Hedefler
- **Kulüp Yönetimi**: Her kulübün kendi paneli ile etkinlik ve içerik yönetimi
- **Onay Sistemi**: Kulüp içeriklerinin admin onayından geçmesi
- **Form Sistemi**: Yerleşik başvuru formu sistemi ve analitik araçları
- **Kullanıcı Deneyimi**: Modern, mobil uyumlu ve kullanıcı dostu arayüz

---

## ✅ MEVCUT DURUM - Tamamlanan Özellikler

### 🏗️ **Temel Altyapı (100% Tamamlandı)**
- ✅ **Backend**: FastAPI + SQLAlchemy + SQLite
- ✅ **Frontend**: React + TypeScript + Vite
- ✅ **UI Framework**: Tailwind CSS + shadcn/ui
- ✅ **Authentication**: JWT tabanlı giriş sistemi
- ✅ **Database**: SQLite with ORM
- ✅ **CORS**: Cross-origin kaynak paylaşımı
- ✅ **File Upload**: Görsel yükleme sistemi

### 📱 **Frontend Özellikleri (80% Tamamlandı)**
- ✅ **Ana Sayfa**: Etkinlik listesi ve filtreleme
- ✅ **Etkinlik Detayı**: Tam etkinlik bilgileri ve harita
- ✅ **Stories**: Instagram tarzı hikaye sistemi
- ✅ **Dark/Light Mode**: Tema değiştirme
- ✅ **Responsive**: Mobil uyumlu tasarım
- ✅ **Admin Paneli**: Temel yönetim arayüzü
- ✅ **Categories**: Kategori filtreleme sistemi

### 🔧 **Backend API'leri (70% Tamamlandı)**
- ✅ **Events API**: CRUD operasyonları
- ✅ **Categories API**: Kategori yönetimi
- ✅ **Stories API**: Hikaye yönetimi
- ✅ **Settings API**: Genel ayarlar
- ✅ **Auth API**: Giriş/çıkış işlemleri
- ✅ **File Upload**: Görsel yükleme endpoint'leri

### 🧪 **Test Altyapısı (60% Tamamlandı)**
- ✅ **Backend Tests**: Pytest ile API testleri
- ✅ **Frontend Tests**: Vitest + React Testing Library
- ✅ **CI/CD Pipeline**: GitHub Actions entegrasyonu
- ✅ **Code Quality**: ESLint yapılandırması

---

## 🚨 KRİTİK EKSİKLİKLER - Öncelik Sırası

### **1. 🎯 KULÜP YÖNETİM SİSTEMİ (KRİTİK - Henüz Başlanmadı)**

#### **Gerekli Özellikler:**
- 🏛️ **Kulüp Profil Sistemi**
  - Kulüp sayfaları (`/clubs`, `/clubs/[id]`)
  - Kulüp bilgileri (isim, açıklama, logo, üye sayısı)
  - Kulübün geçmiş etkinlikleri listesi
  - İletişim bilgileri ve sosyal medya linkleri

- 👥 **Rol Bazlı Yetkilendirme Sistemi**
  - **Super Admin**: Tüm sistem yönetimi
  - **Admin**: Onay süreçleri, genel yönetim
  - **Kulüp Sorumlusu**: Sadece kendi kulübü için yetki
  - **Normal Kullanıcı**: Sadece görüntüleme

- 📋 **İçerik Talep & Onay Sistemi**
  - Kulüp sorumluları için etkinlik talep formu
  - Admin onay/red işlemleri
  - Onay durumu takibi (Bekliyor/Onaylandı/Reddedildi)
  - Bildirim sistemi (dashboard + e-posta)

#### **Database Değişiklikleri:**
```sql
-- Yeni tablolar gerekli
clubs (id, name, description, logo, contact_info, created_at)
club_members (id, club_id, user_id, role, joined_at)
content_requests (id, club_id, event_data, status, submitted_at, reviewed_at)
user_roles (id, user_id, role_type, club_id, granted_at)
```

#### **Yeni Sayfalar:**
- `/clubs` - Kulüpler listesi
- `/clubs/[id]` - Kulüp detay sayfası
- `/club-dashboard` - Kulüp sorumlusu paneli
- `/admin/pending-requests` - Admin onay paneli

---

### **2. 📝 FORM YÖNETİM SİSTEMİ (KRİTİK - Henüz Başlanmadı)**

#### **Gerekli Özellikler:**
- 🔧 **Dinamik Form Builder**
  - Drag & drop form oluşturucu
  - Farklı input tipleri (metin, e-posta, dosya, tarih, çoktan seçmeli)
  - Conditional logic (şartlı alanlar)
  - Form validasyon kuralları

- 📊 **Kulüp Dashboard'u**
  - Başvuru listesi ve durumları görüntüleme
  - Excel/CSV indirme özelliği
  - Başvuru istatistikleri (günlük, haftalık, toplam)
  - Gelişmiş filtreleme ve arama
  - Başvuru durumu güncelleme (Kabul/Red)

- 🛡️ **Admin Süper Dashboard'u**
  - Tüm kulüplerin başvurularını görme
  - Platform geneli istatistikler
  - Cross-kulüp analiz araçları
  - Toplu veri dışa aktarma

#### **Database Değişiklikleri:**
```sql
forms (id, club_id, event_id, name, description, fields_json, is_active)
form_fields (id, form_id, field_type, label, required, options_json, order)
applications (id, form_id, user_id, status, submitted_at, data_json)
application_files (id, application_id, file_path, file_type, uploaded_at)
```

#### **Yeni Sayfalar:**
- `/club/forms` - Form yönetimi
- `/club/forms/create` - Yeni form oluşturma
- `/club/applications` - Başvuru listesi
- `/apply/[formId]` - Başvuru formu
- `/admin/all-applications` - Tüm başvurular

---

### **3. 🔔 BİLDİRİM SİSTEMİ (YÜKSEK ÖNCELİK - Henüz Başlanmadı)**

#### **Gerekli Özellikler:**
- 📧 **E-posta Bildirimleri**
  - Etkinlik hatırlatmaları
  - Onay/red bildirimleri
  - Haftalık etkinlik özeti
  - Başvuru durumu güncellemeleri

- 📱 **In-App Bildirimler**
  - Real-time bildirim sistemi
  - Bildirim geçmişi
  - Bildirim ayarları (hangi tür bildirimleri alacak)

- 🔄 **Otomatik Bildirimler**
  - Etkinlik başlamadan 1 saat önce
  - Yeni etkinlik yayınlandığında
  - Form başvurusu alındığında

---

## 📱 ORTA ÖNCELİKLİ EKSİKLİKLER

### **4. 🎫 Gelişmiş Katılım Sistemi**
- Katılım durumu işaretleme (Katılacağım/İlgiliyim)
- QR kod tabanlı giriş sistemi
- Kontenjan yönetimi
- Bekleme listesi sistemi

### **5. 📅 Gelişmiş Takvim Entegrasyonu**
- Google Calendar, Outlook entegrasyonu
- Kişisel takvim görünümü
- Çakışma kontrolü
- Tekrarlayan etkinlikler

### **6. 🔍 Gelişmiş Arama ve Filtreleme**
- Etiket sistemi (#teknoloji #sanat)
- AI tabanlı etkinlik önerileri
- Gelişmiş arama algoritması
- Popülerlik bazlı sıralama

### **7. 📊 Analytics ve Raporlama**
- Etkinlik katılım analitiği
- Kulüp performans raporları
- Demografik analiz
- Trend analizi

---

## 🎨 DÜŞÜK ÖNCELİKLİ EKSİKLİKLER

### **8. 👥 Sosyal Özellikler**
- Kullanıcı yorumları ve değerlendirmeleri
- Arkadaş sistemi
- Etkinlik fotoğraf paylaşımı
- Gamification (puan, rozet sistemi)

### **9. 📱 PWA Özellikleri**
- Offline çalışma
- Push bildirimler
- App Store'a yükleme
- Native app deneyimi

### **10. 🌐 Entegrasyonlar**
- Sosyal medya paylaşımı
- Canlı yayın entegrasyonu
- Ödeme sistemi (eğer ileride gerekirse)
- Kurumsal e-posta entegrasyonu

---

## 🗂️ PROJE YAPISININ DETAYLI ANALİZİ

### **📁 Backend Yapısı (`/backend/`)**

```
backend/
├── app/
│   ├── main.py              # 🟢 FastAPI ana uygulaması
│   ├── api/                 # 🟢 API endpoint'leri
│   │   ├── api.py          # 🟢 API router'ları
│   │   ├── deps.py         # 🟢 Dependency injection
│   │   └── endpoints/      # 🟢 Endpoint modülleri
│   │       ├── auth.py     # 🟢 Giriş/çıkış API'ları
│   │       ├── events.py   # 🟢 Etkinlik API'ları
│   │       ├── categories.py # 🟢 Kategori API'ları
│   │       ├── stories.py  # 🟢 Hikaye API'ları
│   │       └── settings.py # 🟢 Ayarlar API'ları
│   ├── core/               # 🟢 Temel yapılandırma
│   │   ├── config.py       # 🟢 Uygulama ayarları
│   │   ├── database.py     # 🟢 Veritabanı bağlantısı
│   │   └── security.py     # 🟢 JWT ve güvenlik
│   ├── models/             # 🟢 SQLAlchemy modelleri
│   │   ├── admin.py        # 🟢 Admin kullanıcı modeli
│   │   ├── event.py        # 🟢 Etkinlik modeli
│   │   ├── category.py     # 🟢 Kategori modeli
│   │   ├── story.py        # 🟢 Hikaye modeli
│   │   └── settings.py     # 🟢 Ayarlar modeli
│   └── schemas/            # 🟢 Pydantic şemaları
│       ├── auth.py         # 🟢 Giriş şemaları
│       ├── event.py        # 🟢 Etkinlik şemaları
│       ├── category.py     # 🟢 Kategori şemaları
│       ├── story.py        # 🟢 Hikaye şemaları
│       └── settings.py     # 🟢 Ayarlar şemaları
├── tests/                  # 🟡 Test dosyaları (kısmi)
├── uploads/                # 🟢 Yüklenen dosyalar
├── requirements.txt        # 🟢 Python bağımlılıkları
├── .env                    # 🟢 Ortam değişkenleri
└── etkinlik.db            # 🟢 SQLite veritabanı
```

### **📁 Frontend Yapısı (`/src/`)**

```
src/
├── components/             # 🟢 React bileşenleri
│   ├── ui/                # 🟢 shadcn/ui bileşenleri
│   ├── AdminLayout.tsx    # 🟢 Admin panel layout'u
│   ├── EventCard.tsx      # 🟢 Etkinlik kartı
│   ├── EventFilters.tsx   # 🟢 Filtreleme bileşeni
│   ├── Navbar.tsx         # 🟢 Navigation bar
│   ├── Stories.tsx        # 🟢 Hikaye bileşeni
│   └── ProtectedRoute.tsx # 🟢 Yetkilendirme wrapper'ı
├── contexts/              # 🟢 React context'leri
│   └── AuthContext.tsx    # 🟢 Authentication context
├── hooks/                 # 🟢 Custom hook'lar
├── lib/                   # 🟢 Yardımcı fonksiyonlar
│   ├── api.ts            # 🟢 API çağrı fonksiyonları
│   └── utils.ts          # 🟢 Genel yardımcı fonksiyonlar
├── pages/                 # 🟢 Sayfa bileşenleri
│   ├── admin/            # 🟢 Admin paneli sayfaları
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminEvents.tsx
│   │   ├── AdminCategories.tsx
│   │   ├── AdminStories.tsx
│   │   └── AdminSettings.tsx
│   ├── Index.tsx         # 🟢 Ana sayfa
│   ├── EventDetail.tsx   # 🟢 Etkinlik detay sayfası
│   ├── About.tsx         # 🟢 Hakkında sayfası
│   └── AdminLogin.tsx    # 🟢 Admin giriş sayfası
├── types/                # 🟢 TypeScript tip tanımları
└── data/                 # 🟢 Mock veri dosyaları
```

### **🔴 Eksik Olan Dosya ve Klasörler**

```
# Backend'de eksik
backend/app/api/endpoints/
├── clubs.py              # 🔴 Kulüp API'ları
├── forms.py              # 🔴 Form API'ları
├── applications.py       # 🔴 Başvuru API'ları
└── notifications.py      # 🔴 Bildirim API'ları

backend/app/models/
├── club.py               # 🔴 Kulüp modeli
├── form.py               # 🔴 Form modeli
├── application.py        # 🔴 Başvuru modeli
└── notification.py       # 🔴 Bildirim modeli

# Frontend'de eksik
src/pages/
├── clubs/                # 🔴 Kulüp sayfaları
├── club-dashboard/       # 🔴 Kulüp paneli
├── forms/               # 🔴 Form sayfaları
└── applications/        # 🔴 Başvuru sayfaları

src/components/
├── FormBuilder.tsx       # 🔴 Form oluşturucu
├── ApplicationsList.tsx  # 🔴 Başvuru listesi
├── ClubCard.tsx         # 🔴 Kulüp kartı
└── NotificationCenter.tsx # 🔴 Bildirim merkezi
```

---

## 🔧 TEKNİK SPESIFIKASYONLAR

### **🛠️ Kullanılan Teknolojiler**

#### **Backend**
- **Framework**: FastAPI 0.109.0
- **Database**: SQLite + SQLAlchemy 2.0.25
- **Authentication**: JWT (python-jose)
- **Validation**: Pydantic 2.5.3
- **Testing**: Pytest 7.4.4
- **Server**: Uvicorn
- **Image Processing**: Pillow 10.2.0

#### **Frontend**
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React
- **Maps**: Mapbox GL JS

### **📊 Database Schema Durumu**

#### **🟢 Mevcut Tablolar**
```sql
-- ✅ Çalışan tablolar
admins (id, username, password_hash, is_active, created_at)
categories (id, name, description, is_active, created_at)
events (id, title, description, date, time, location, category_id, ...)
stories (id, title, content, image_path, is_active, expires_at, ...)
settings (id, key, value, description, created_at)
```

#### **🔴 Eksik Tablolar**
```sql
-- ❌ Henüz oluşturulmamış tablolar
clubs (id, name, description, logo, contact_info, is_active, created_at)
club_members (id, club_id, user_id, role, joined_at)
users (id, email, password_hash, full_name, student_id, ...)
user_roles (id, user_id, role_type, club_id, granted_at)
content_requests (id, club_id, event_data, status, submitted_at, ...)
forms (id, club_id, event_id, name, fields_json, is_active, ...)
applications (id, form_id, user_id, status, data_json, submitted_at)
notifications (id, user_id, title, message, is_read, created_at)
```

---

## 🚀 KURULUM REHBERİ

### **📋 Gereksinimler**
- **Node.js** v16 veya üzeri
- **Python** 3.8 veya üzeri
- **Git** (opsiyonel)

### **🔧 Hızlı Kurulum**

#### **1. Repository'yi Klonlayın**
```bash
git clone <repo-url>
cd etkinlik-kul
```

#### **2. Backend Kurulumu**
```bash
# Backend klasörüne git
cd backend

# Python sanal ortamı oluştur
python -m venv venv

# Sanal ortamı aktifleştir
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Veritabanını başlat ve örnek veri ekle
python seed_data.py

# Backend'i çalıştır
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend `http://localhost:8000` adresinde çalışacak.
API Dokümantasyonu: `http://localhost:8000/docs`

#### **3. Frontend Kurulumu**
```bash
# Ana dizine dön
cd ..

# Bağımlılıkları yükle (Tercihen bun kullanın)
bun install
# veya
npm install

# Frontend'i çalıştır
bun run dev
# veya
npm run dev
```

Frontend `http://localhost:8080` adresinde çalışacak.

### **🔐 Admin Girişi**
- **URL**: `http://localhost:8080/admin`
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

---

## 🧪 TEST ÇALIŞTIRMA

### **Backend Testleri**
```bash
cd backend
pytest
```

### **Frontend Testleri**
```bash
# Ana dizinde
bun test
# veya
npm test
```

---

## 🛣️ GELİŞTİRME ROADMAPs

### **📅 Phase 1: Kritik Özellikler (1-2 Ay)**
1. **Hafta 1-2**: Kulüp yönetim sistemi
   - Database model'leri oluştur
   - Kulüp CRUD API'ları
   - Temel kulüp sayfaları
   
2. **Hafta 3-4**: Rol bazlı yetkilendirme
   - User model'i genişlet
   - Role-based access control
   - Permission middleware'leri

3. **Hafta 5-6**: İçerik onay sistemi
   - Content request workflow
   - Admin onay paneli
   - Durum takip sistemi

4. **Hafta 7-8**: Form yönetim sistemi
   - Dinamik form builder
   - Form submission handling
   - Application management

### **📅 Phase 2: Orta Öncelikli (2-3 Ay)**
1. **Bildirim sistemi** (e-posta + in-app)
2. **Gelişmiş katılım sistemi** (QR kod, kontenjan)
3. **Analytics ve raporlama**
4. **Gelişmiş arama ve filtreleme**

### **📅 Phase 3: İyileştirmeler (3-6 Ay)**
1. **PWA özellikleri**
2. **Sosyal özellikler**
3. **Entegrasyonlar**
4. **Performance optimizasyonları**

---

## 📝 GELİŞTİRİCİLER İÇİN REHBER

### **🏗️ Yeni Özellik Ekleme Süreci**

#### **Backend'de Yeni Model Ekleme**
1. `backend/app/models/` klasöründe model dosyasını oluştur
2. `backend/app/schemas/` klasöründe Pydantic şemalarını tanımla
3. `backend/app/api/endpoints/` klasöründe API endpoint'lerini yaz
4. `backend/app/api/api.py` dosyasında router'ı ekle
5. Test dosyalarını `backend/tests/` klasöründe oluştur

#### **Frontend'de Yeni Sayfa Ekleme**
1. `src/pages/` klasöründe React component'ini oluştur
2. `src/lib/api.ts` dosyasında API çağrı fonksiyonlarını ekle
3. `src/types/index.ts` dosyasında TypeScript tiplerini tanımla
4. Routing'i `src/App.tsx` dosyasında güncelle
5. Gerekirse `src/components/` klasöründe yeni bileşenler oluştur

### **🔍 Debugging İpuçları**

#### **Backend Debug**
```bash
# Debug mode ile çalıştır
uvicorn app.main:app --reload --log-level debug

# Veritabanını sıfırla
rm backend/etkinlik.db
python backend/seed_data.py
```

#### **Frontend Debug**
```bash
# Network isteklerini kontrol et
# Browser Developer Tools > Network tab

# Console loglarını kontrol et
# Browser Developer Tools > Console tab
```

### **📊 Code Quality Kontrolleri**

#### **Linting ve Formatting**
```bash
# Frontend
bun run lint

# Backend (eğer yapılandırılmışsa)
black backend/
flake8 backend/
```

---

## 🚨 PRODUCTION İÇİN GÜVENLİK ÖNLEMLERİ

### **🔐 Kritik Güvenlik Ayarları**

#### **Backend (.env dosyası)**
```env
# ❌ Geliştirme ayarları (Production'da değiştir!)
SECRET_KEY=your-secret-key-change-this-in-production  # 🚨 Değiştir!
ADMIN_PASSWORD=admin123  # 🚨 Güçlü şifre kullan!

# ✅ Production ayarları
DATABASE_URL=postgresql://user:pass@host:port/db  # SQLite yerine PostgreSQL
FRONTEND_URL=https://yourdomain.com
MAX_FILE_SIZE=2097152  # 2MB limit
```

#### **Frontend Environment Variables**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### **🛡️ Güvenlik Kontrol Listesi**
- [ ] SECRET_KEY'i güçlü random değerle değiştir
- [ ] Admin şifresini güçlü şifre ile değiştir
- [ ] HTTPS kullan (Let's Encrypt)
- [ ] Rate limiting ekle
- [ ] Input validation'ı güçlendir
- [ ] File upload güvenliğini artır
- [ ] SQL injection koruması kontrol et
- [ ] XSS koruması ekle
- [ ] CSRF koruması ekle

---

## 🐳 DEPLOYMENT SEÇENEKLERİ

### **☁️ Cloud Deployment**

#### **Vercel (Frontend) + Railway/Heroku (Backend)**
```bash
# Frontend (Vercel)
npm run build
vercel --prod

# Backend (Railway)
# railway.json oluştur ve deploy et
```

#### **Docker Deployment**
```dockerfile
# Dockerfile örnekleri backend/ ve root klasöründe oluşturulabilir
```

### **🖥️ VPS Deployment**
```bash
# Nginx reverse proxy yapılandırması
# PM2 ile process management
# Let's Encrypt SSL sertifikası
```

---

## 📈 PERFORMANS OPTİMİZASYONLARI

### **Backend Optimizasyonları**
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching (Redis)
- [ ] Image compression
- [ ] API rate limiting

### **Frontend Optimizasyonları**
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] CDN kullanımı

---

## 🤝 KATKI SAĞLAMA REHBERİ

### **🔄 Development Workflow**
1. **Fork** yapın
2. **Feature branch** oluşturun: `git checkout -b feature/amazing-feature`
3. **Commit** yapın: `git commit -m 'Add some amazing feature'`
4. **Push** yapın: `git push origin feature/amazing-feature`
5. **Pull Request** açın

### **📝 Commit Message Formatı**
```
feat: add club management system
fix: resolve authentication bug
docs: update README with new features
style: format code with prettier
refactor: restructure API endpoints
test: add form validation tests
```

### **🧪 PR Kontrol Listesi**
- [ ] Testler yazıldı ve geçiyor
- [ ] Kod review yapıldı
- [ ] Documentation güncellendi
- [ ] Breaking changes dokumentlendi
- [ ] Performance impact değerlendirildi

---

## ❓ SSS (Sık Sorulan Sorular)

### **🔧 Teknik Sorular**

**Q: Backend çalışmıyor, ne yapmalıyım?**
A: 
1. Python virtual environment aktif mi kontrol edin
2. `pip install -r requirements.txt` çalıştırın
3. `.env` dosyasının doğru ayarlandığından emin olun
4. `python seed_data.py` ile veritabanını yeniden oluşturun

**Q: Frontend backend'e bağlanamıyor?**
A:
1. Backend'in çalıştığından emin olun (localhost:8000)
2. CORS ayarlarını kontrol edin
3. API URL'lerini `src/lib/api.ts` dosyasında kontrol edin

**Q: Admin paneline giriş yapamıyorum?**
A:
1. Kullanıcı adı: `admin`, Şifre: `admin123`
2. Backend loglarını kontrol edin
3. Veritabanında admin kullanıcısının olduğundan emin olun

### **🚀 Geliştirme Sorları**

**Q: Yeni özellik nasıl eklerim?**
A: Yukarıdaki "Geliştiriciler İçin Rehber" bölümünü takip edin

**Q: Test nasıl yazarım?**
A: `backend/tests/` ve `src/` klasörlerindeki mevcut test örneklerini inceleyin

**Q: Database schema nasıl değiştiririm?**
A: SQLAlchemy model'lerini güncelleyin ve veritabanını yeniden oluşturun (geliştirme ortamında)

---

## 📞 İLETİŞİM VE DESTEK

### **🐛 Bug Bildirimi**
GitHub Issues kullanarak bug bildirimi yapabilirsiniz.

### **💡 Özellik Önerileri**
Yeni özellik önerileri için GitHub Discussions kullanın.

### **📚 Dokümantasyon**
Bu README dosyası sürekli güncellenmektedir. En güncel bilgiler için düzenli olarak kontrol edin.

---

## 📄 LİSANS

MIT License

---

## 🙏 TEŞEKKÜRLER

Bu proje açık kaynak topluluğunun katkılarıyla geliştirilmektedir. Tüm katkı sağlayanlara teşekkürler!

---

**📊 Proje İstatistikleri:**
- **Toplam Dosya Sayısı**: ~150
- **Backend Code Coverage**: %60
- **Frontend Code Coverage**: %40
- **API Endpoint Sayısı**: 25
- **React Component Sayısı**: 30
- **Tamamlanma Oranı**: %70

**🎯 Sonraki Milestone:** Kulüp Yönetim Sistemi (Phase 1)

---

*Son güncelleme: Haziran 2025*
