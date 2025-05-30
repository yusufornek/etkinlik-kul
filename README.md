# Kampüs Etkinlikleri Platformu

Modern bir kampüs etkinlikleri yönetim sistemi. React + TypeScript + Vite (Frontend) ve FastAPI + SQLAlchemy (Backend) ile geliştirilmiştir.

## 🚀 Özellikler

- **Etkinlik Yönetimi**: Etkinlik oluşturma, düzenleme, silme
- **Kategori Sistemi**: Etkinlikleri kategorilere göre filtreleme
- **Story Özelliği**: Instagram tarzı story'ler ile duyurular
- **Harita Entegrasyonu**: Etkinlik konumlarını haritada gösterme
- **Kayıt Sistemi**: Etkinliklere online kayıt imkanı
- **Admin Paneli**: Tam yetki ile yönetim
- **Responsive Tasarım**: Mobil uyumlu arayüz
- **Dark Mode**: Karanlık tema desteği

## 📋 Gereksinimler

- **Node.js** (v16 veya üzeri)
- **Python** (3.8 veya üzeri)
- **Git** (opsiyonel)

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd etkinlik-kul
```

### 2. Backend Kurulumu

```bash
# Backend klasörüne gidin
cd backend

# Python sanal ortamı oluşturun
python -m venv venv

# Sanal ortamı aktifleştirin
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Gerekli paketleri yükleyin
pip install -r requirements.txt

# Backend'i başlatın
uvicorn app.main:app --reload
```

Backend `http://localhost:8000` adresinde çalışacaktır.

### 3. Frontend Kurulumu

Yeni bir terminal açın:

```bash
# Ana dizinde (projenin kök klasöründe)
# Gerekli paketleri yükleyin
# Proje `bun.lockb` içerdiğinden, öncelikle `bun` ile deneyin:
bun install
# Eğer `bun` kurulu değilse veya sorun yaşarsanız `npm` kullanın:
# npm install

# Frontend'i başlatın
bun run dev
# veya npm run dev
```

Frontend `http://localhost:5173` (veya Vite'in belirlediği başka bir port, genellikle 8080 CI/CD için ayarlandığı gibi) adresinde çalışacaktır.

### 4. Veritabanı ve Örnek Veriler

Backend ilk çalıştığında otomatik olarak SQLite veritabanı (`etkinlik.db`) oluşturulur.

Örnek verilerle doldurmak için:

```bash
cd backend
python seed_data.py
```

## 🔐 Admin Girişi

- **URL**: `http://localhost:5173/admin` (Frontend adresinize göre değişebilir)
- **Kullanıcı adı**: `admin`
- **Şifre**: `admin123`

## 📂 Proje Yapısı

```
etkinlik-kul/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoint'leri
│   │   ├── core/          # Yapılandırma ve güvenlik
│   │   ├── models/        # Veritabanı modelleri
│   │   └── schemas/       # Pydantic şemaları
│   ├── uploads/           # Yüklenen görseller
│   ├── requirements.txt   # Python bağımlılıkları
│   └── seed_data.py      # Örnek veri oluşturucu
│
├── src/
│   ├── components/        # React bileşenleri
│   ├── contexts/          # React context'leri
│   ├── hooks/            # Custom hook'lar
│   ├── lib/              # Yardımcı fonksiyonlar
│   ├── pages/            # Sayfa bileşenleri
│   └── types/            # TypeScript tipleri
│
├── public/               # Statik dosyalar
├── package.json          # Node.js bağımlılıkları
└── README.md            # Bu dosya
```

## 🔧 Teknik Detaylar

### Frontend
- **React** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (UI Components)
- **React Query** (Data fetching)
- **React Router** (Routing)
- **Mapbox GL JS** (Harita, EventDetail sayfasında kullanılıyor)

### Backend
- **FastAPI** (Web framework)
- **SQLAlchemy** (ORM)
- **SQLite** (Veritabanı)
- **Pydantic** (Data validation)
- **JWT** (Authentication)
- **Pillow** (Görsel işleme)

## 📱 Kullanım

### Kullanıcı Arayüzü
1. Ana sayfada tüm etkinlikleri görüntüleyin
2. Kategorilere göre filtreleyin
3. Etkinlik detaylarını inceleyin
4. Etkinliklere kayıt olun (eğer gerekiyorsa)
5. Story'leri görüntüleyin

### Admin Paneli
1. `/admin` adresinden giriş yapın
2. Etkinlikleri yönetin (oluştur, düzenle, sil)
3. Kategorileri yönetin
4. Story'leri yönetin
5. Görsel yükleyin

## 🎨 Özelleştirme

- Tema renkleri: `src/index.css` ve `tailwind.config.ts`
- API ayarları: `backend/.env`
- Frontend API bağlantı noktası: `src/lib/api.ts` (genellikle `VITE_API_BASE_URL` çevre değişkeni ile)

## 🧪 Testler

Bu bölümde, projenin backend ve frontend testlerinin nasıl çalıştırılacağına dair bilgiler bulunmaktadır.

### Backend Testleri

Backend testleri API endpoint'lerini ve temel iş mantığını Pytest kullanarak test eder.

1.  **Backend Klasörüne Gidin:**
    ```bash
    cd backend
    ```
2.  **Gerekli Ortam Değişkenlerini Ayarlayın:**
    Testlerin doğru çalışması için bazı ortam değişkenlerinin ayarlanması gerekmektedir. Bu değişkenleri test ortamınıza özel, üretimde olmayan değerlerle ayarlamanız önerilir. `.env` dosyasını kopyalayarak veya doğrudan terminalde ayarlayarak kullanabilirsiniz. Temel değişkenler:
    ```bash
    export DATABASE_URL="sqlite:///:memory:"  # Testler için hafızada çalışan veritabanı
    export SECRET_KEY="test_secret_key"
    export ADMIN_USERNAME="testadmin"
    export ADMIN_PASSWORD="testpassword"
    export ACCESS_TOKEN_EXPIRE_MINUTES="30"
    export ALGORITHM="HS256"
    # Diğer gerekli olabilecek değişkenler... (örn: UPLOAD_FOLDER, ALLOWED_EXTENSIONS)
    export UPLOAD_FOLDER="./uploads_test" 
    export MAX_FILE_SIZE="1048576"
    export ALLOWED_EXTENSIONS='["jpg", "jpeg", "png", "gif"]'
    ```
    *Not: Proje ana dizininden çalıştırıyorsanız, `PYTHONPATH`'in de ayarlanması gerekebilir.* `PYTHONPATH=. pytest backend/tests/` gibi. CI/CD pipeline'da bu ayar mevcuttur. Genellikle backend klasörü içindeyken `pytest` komutu yeterlidir.*

3.  **Testleri Çalıştırın:**
    Backend klasöründeyken:
    ```bash
    pytest
    ```
    Veya proje ana dizininden:
    ```bash
    PYTHONPATH=. pytest backend/tests
    ```

### Frontend Testleri

Frontend testleri React bileşenlerini, hook'ları ve yardımcı fonksiyonları Vitest ve React Testing Library kullanarak test eder.

1.  **Ana Proje Klasöründe Olduğunuzdan Emin Olun.**
2.  **Testleri Çalıştırın:**
    Proje `bun.lockb` içerdiğinden, `bun` ile çalıştırılması tercih edilir:
    ```bash
    bun test
    ```
    Eğer `bun` kurulu değilse `npm` ile de çalıştırabilirsiniz:
    ```bash
    npm test 
    ```
    Bu komut, `package.json` dosyasındaki `"test"` script'ini çalıştıracaktır (genellikle `vitest run`).

## ⚙️ CI/CD Pipeline

Projede, kod kalitesini sağlamak ve regresyonları önlemek amacıyla GitHub Actions ile kurulmuş bir CI/CD (Sürekli Entegrasyon / Sürekli Dağıtım) pipeline'ı bulunmaktadır.

-   **Tetikleyiciler:** Bu pipeline, `main` (veya `master`) branch'ine yapılan her `push` işleminde ve bu branch'lere yönelik açılan `pull request`'lerde otomatik olarak çalışır.
-   **Aşamalar:** Pipeline temel olarak iki ana iş (job) içerir:
    1.  **Frontend Kontrolleri:**
        *   Gerekli Node.js ve Bun ortamını kurar.
        *   Frontend bağımlılıklarını yükler (`bun install`).
        *   ESLint ile kod stilini kontrol eder (`bun run lint`).
        *   Vitest ile frontend testlerini çalıştırır (`bun test`).
        *   Frontend projesini build eder (`bun run build`) ve build hatalarını yakalar.
    2.  **Backend Kontrolleri:**
        *   Gerekli Python ortamını kurar.
        *   Backend bağımlılıklarını yükler (`pip install -r requirements.txt`).
        *   Pytest ile backend testlerini çalıştırır. Bu aşamada testler için gerekli ortam değişkenleri CI ortamında güvenli test değerleriyle ayarlanır.
-   **Amaç:** Bu otomatik kontroller, geliştirme sürecinin erken aşamalarında hataların yakalanmasına yardımcı olur ve projenin ana branch'lerinin her zaman stabil kalmasını hedefler.

## 🚨 Sorun Giderme

### Backend Hataları
- **401 Unauthorized**: Token süresi dolmuş, yeniden giriş yapın
- **Database hatası**: `backend/etkinlik.db` dosyasını silin ve backend'i yeniden başlatın (geliştirme ortamında). Testler hafızada çalışan veritabanı kullanır.

### Frontend Hataları
- **CORS hatası**: Backend'in çalıştığından ve doğru adreste olduğundan emin olun. Frontend'in API isteklerini doğru hedefe yaptığını kontrol edin (`src/lib/api.ts` ve `.env` dosyaları).
- **Build hatası**: `node_modules` klasörünü silip `bun install` (veya `npm install`) komutunu tekrar çalıştırın.

## 📄 Lisans

MIT

## 👥 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit'leyin (`git commit -m 'Add some AmazingFeature'`)
4. Push'layın (`git push origin feature/AmazingFeature`)
5. Pull Request açın
