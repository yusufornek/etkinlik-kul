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
npm install

# Frontend'i başlatın
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

### 4. Veritabanı ve Örnek Veriler

Backend ilk çalıştığında otomatik olarak SQLite veritabanı oluşturulur.

Örnek verilerle doldurmak için:

```bash
cd backend
python seed_data.py
```

## 🔐 Admin Girişi

- **URL**: `http://localhost:5173/admin`
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
- **Leaflet** (Harita)

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
4. Etkinliklere kayıt olun
5. Story'leri görüntüleyin

### Admin Paneli
1. `/admin` adresinden giriş yapın
2. Etkinlikleri yönetin (oluştur, düzenle, sil)
3. Kategorileri yönetin
4. Story'leri yönetin
5. Görsel yükleyin

## 🎨 Özelleştirme

- Tema renkleri: `src/index.css`
- API ayarları: `backend/.env`
- Frontend ayarları: `src/lib/api.ts`

## 🚨 Sorun Giderme

### Backend Hataları
- **401 Unauthorized**: Token süresi dolmuş, yeniden giriş yapın
- **Database hatası**: `backend/etkinlik.db` dosyasını silin ve backend'i yeniden başlatın

### Frontend Hataları
- **CORS hatası**: Backend'in çalıştığından emin olun
- **Build hatası**: `node_modules` klasörünü silip `npm install` çalıştırın

## 📄 Lisans

MIT

## 👥 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit'leyin (`git commit -m 'Add some AmazingFeature'`)
4. Push'layın (`git push origin feature/AmazingFeature`)
5. Pull Request açın
