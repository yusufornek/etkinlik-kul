
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'film' | 'social' | 'education' | 'sports' | 'arts';
  organizer: string;
  imageUrl: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export const events: Event[] = [
  {
    id: "1",
    title: "Klasik Film Gösterimi: Vertigo",
    description: "Alfred Hitchcock'un 1958 yapımı klasik gerilim filmi Vertigo gösterimi. Film gösteriminin ardından sinema kulübü üyeleri ile film analizi yapılacaktır.",
    date: "2025-05-25",
    time: "19:00",
    location: "Merkez Amfi",
    category: "film",
    organizer: "Sinema Kulübü",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0082,
      lng: 28.9784
    },
    address: "İstanbul Üniversitesi, Beyazıt Merkez Kampüsü, Fatih/İstanbul"
  },
  {
    id: "2",
    title: "Kariyer Gelişim Semineri",
    description: "Sektör profesyonelleri tarafından verilecek olan bu seminer, öğrencilere CV hazırlama, mülakat teknikleri ve profesyonel ağ kurma konularında bilgiler sunacak.",
    date: "2025-05-26",
    time: "14:00",
    location: "İktisadi İdari Bilimler Konferans Salonu",
    category: "education",
    organizer: "Kariyer Merkezi",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0122,
      lng: 28.9714
    },
    address: "İstanbul Üniversitesi İktisat Fakültesi, Beyazıt/İstanbul"
  },
  {
    id: "3",
    title: "Bahar Şenliği Konseri",
    description: "Geleneksel bahar şenliği kapsamında düzenlenen ücretsiz konser etkinliği. Kampüs rock grupları ve DJ performansları ile dolu bir gün sizleri bekliyor.",
    date: "2025-05-28",
    time: "16:00",
    location: "Merkez Çim Alan",
    category: "social",
    organizer: "Öğrenci Konseyi",
    imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0102,
      lng: 28.9744
    },
    address: "İstanbul Üniversitesi Ana Bahçe, Beyazıt/İstanbul"
  },
  {
    id: "4",
    title: "Kampüs Yoga Günü",
    description: "Stres atmak ve zihinsel rahatlama sağlamak için kampüs yoga günü etkinliğimize katılın. Tüm seviyeler için uygun hareketler içerir.",
    date: "2025-05-30",
    time: "08:00",
    location: "Spor Salonu",
    category: "sports",
    organizer: "Spor Bilimleri Fakültesi",
    imageUrl: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0157,
      lng: 28.9706
    },
    address: "İstanbul Üniversitesi Spor Bilimleri Fakültesi, Avcılar/İstanbul"
  },
  {
    id: "5",
    title: "Fotoğraf Sergisi: Kampüste Yaşam",
    description: "Fotoğrafçılık kulübü öğrencilerinin çektiği kampüs yaşamını anlatan fotoğrafların sergileneceği etkinlik.",
    date: "2025-06-01",
    time: "10:00",
    location: "Güzel Sanatlar Galerisi",
    category: "arts",
    organizer: "Fotoğrafçılık Kulübü",
    imageUrl: "https://images.unsplash.com/photo-1594807777657-664cf4a4a616?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0125,
      lng: 28.9756
    },
    address: "İstanbul Üniversitesi Güzel Sanatlar Fakültesi, Beyazıt/İstanbul"
  },
  {
    id: "6",
    title: "Açık Hava Sineması: Ayla",
    description: "Türk sinemasının duygu dolu filmlerinden Ayla'nın açık hava gösterimi yapılacaktır. Kendi minderinizi ve atıştırmalıklarınızı getirebilirsiniz.",
    date: "2025-06-03",
    time: "21:00",
    location: "Botanik Bahçe",
    category: "film",
    organizer: "Kültür Sanat Topluluğu",
    imageUrl: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0137,
      lng: 28.9788
    },
    address: "İstanbul Üniversitesi Botanik Bahçesi, Süleymaniye/İstanbul"
  },
  {
    id: "7",
    title: "Yapay Zeka ve Gelecek Paneli",
    description: "Bilgisayar mühendisliği ve yapay zeka alanında çalışan akademisyenlerimiz, yapay zekanın geleceğini ve kariyer imkanlarını tartışacaklar.",
    date: "2025-06-05",
    time: "15:30",
    location: "Mühendislik Fakültesi Konferans Salonu",
    category: "education",
    organizer: "Bilgisayar Mühendisliği Bölümü",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0279,
      lng: 28.8913
    },
    address: "İstanbul Üniversitesi Mühendislik Fakültesi, Avcılar/İstanbul"
  },
  {
    id: "8",
    title: "Kampüs Satranç Turnuvası",
    description: "Tüm bölümlerden öğrencilerin katılabileceği satranç turnuvası. Dereceye girenlere çeşitli ödüller verilecektir.",
    date: "2025-06-07",
    time: "13:00",
    location: "Öğrenci Merkezi",
    category: "sports",
    organizer: "Satranç Kulübü",
    imageUrl: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=1000&auto=format&fit=crop",
    coordinates: {
      lat: 41.0118,
      lng: 28.9734
    },
    address: "İstanbul Üniversitesi Öğrenci Merkezi, Beyazıt/İstanbul"
  }
];

export const getCategoryColor = (category: Event['category']) => {
  switch (category) {
    case 'film':
      return 'bg-soft-blue text-blue-800';
    case 'education':
      return 'bg-soft-green text-green-800';
    case 'social':
      return 'bg-purple-100 text-vivid-purple';
    case 'sports':
      return 'bg-amber-100 text-amber-800';
    case 'arts':
      return 'bg-soft-pink text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryName = (category: Event['category']) => {
  switch (category) {
    case 'film':
      return 'Film';
    case 'education':
      return 'Eğitim';
    case 'social':
      return 'Sosyal';
    case 'sports':
      return 'Spor';
    case 'arts':
      return 'Sanat';
    default:
      return 'Diğer';
  }
};
