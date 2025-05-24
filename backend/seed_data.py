"""
Veritabanına başlangıç verilerini ekleyen script
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models import Category, Event, Story, Admin
from app.core.security import get_password_hash
from app.core.config import settings

# Tablolari olustur
Base.metadata.create_all(bind=engine)

def seed_categories():
    """Varsayılan kategorileri oluştur"""
    db = SessionLocal()
    
    categories_data = [
        {
            "name": "Film",
            "slug": "film",
            "color_class": "bg-soft-blue",
            "text_color_class": "text-blue-800",
            "icon": "Film",
            "description": "Film gösterimleri ve sinema etkinlikleri"
        },
        {
            "name": "Eğitim",
            "slug": "education",
            "color_class": "bg-soft-green",
            "text_color_class": "text-green-800",
            "icon": "GraduationCap",
            "description": "Seminerler, workshoplar ve eğitim etkinlikleri"
        },
        {
            "name": "Sosyal",
            "slug": "social",
            "color_class": "bg-purple-100",
            "text_color_class": "text-vivid-purple",
            "icon": "Users",
            "description": "Sosyal etkinlikler ve buluşmalar"
        },
        {
            "name": "Spor",
            "slug": "sports",
            "color_class": "bg-amber-100",
            "text_color_class": "text-amber-800",
            "icon": "Trophy",
            "description": "Spor etkinlikleri ve turnuvalar"
        },
        {
            "name": "Sanat",
            "slug": "arts",
            "color_class": "bg-soft-pink",
            "text_color_class": "text-pink-800",
            "icon": "Palette",
            "description": "Sanat etkinlikleri ve sergiler"
        }
    ]
    
    try:
        for cat_data in categories_data:
            # Kategori zaten var mı kontrol et
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                print(f"Kategori oluşturuldu: {cat_data['name']}")
            else:
                print(f"Kategori zaten mevcut: {cat_data['name']}")
        
        db.commit()
        print("Kategoriler başarıyla oluşturuldu!")
        
    except Exception as e:
        print(f"Hata: {e}")
        db.rollback()
    finally:
        db.close()


def seed_events():
    """Örnek etkinlikleri oluştur"""
    db = SessionLocal()
    
    try:
        # Kategorileri al
        categories = {cat.slug: cat.id for cat in db.query(Category).all()}
        
        events_data = [
            {
                "title": "Klasik Film Gösterimi: Vertigo",
                "description": "Alfred Hitchcock'un 1958 yapımı klasik gerilim filmi Vertigo gösterimi. Film gösteriminin ardından sinema kulübü üyeleri ile film analizi yapılacaktır.",
                "date": "2025-05-25",
                "time": "19:00",
                "location": "Merkez Amfi",
                "category_id": categories.get("film"),
                "organizer": "Sinema Kulübü",
                "image_url": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop",
                "latitude": 41.0082,
                "longitude": 28.9784,
                "address": "İstanbul Üniversitesi, Beyazıt Merkez Kampüsü, Fatih/İstanbul"
            },
            {
                "title": "Kariyer Gelişim Semineri",
                "description": "Sektör profesyonelleri tarafından verilecek olan bu seminer, öğrencilere CV hazırlama, mülakat teknikleri ve profesyonel ağ kurma konularında bilgiler sunacak.",
                "date": "2025-05-26",
                "time": "14:00",
                "location": "İktisadi İdari Bilimler Konferans Salonu",
                "category_id": categories.get("education"),
                "organizer": "Kariyer Merkezi",
                "image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
                "latitude": 41.0122,
                "longitude": 28.9714,
                "address": "İstanbul Üniversitesi İktisat Fakültesi, Beyazıt/İstanbul"
            },
            {
                "title": "Bahar Şenliği Konseri",
                "description": "Geleneksel bahar şenliği kapsamında düzenlenen ücretsiz konser etkinliği. Kampüs rock grupları ve DJ performansları ile dolu bir gün sizleri bekliyor.",
                "date": "2025-05-28",
                "time": "16:00",
                "location": "Merkez Çim Alan",
                "category_id": categories.get("social"),
                "organizer": "Öğrenci Konseyi",
                "image_url": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1000&auto=format&fit=crop",
                "latitude": 41.0102,
                "longitude": 28.9744,
                "address": "İstanbul Üniversitesi Ana Bahçe, Beyazıt/İstanbul"
            },
            {
                "title": "Kampüs Yoga Günü",
                "description": "Stres atmak ve zihinsel rahatlama sağlamak için kampüs yoga günü etkinliğimize katılın. Tüm seviyeler için uygun hareketler içerir.",
                "date": "2025-05-30",
                "time": "08:00",
                "location": "Spor Salonu",
                "category_id": categories.get("sports"),
                "organizer": "Spor Bilimleri Fakültesi",
                "image_url": "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1000&auto=format&fit=crop",
                "latitude": 41.0157,
                "longitude": 28.9706,
                "address": "İstanbul Üniversitesi Spor Bilimleri Fakültesi, Avcılar/İstanbul"
            },
            {
                "title": "Fotoğraf Sergisi: Kampüste Yaşam",
                "description": "Fotoğrafçılık kulübü öğrencilerinin çektiği kampüs yaşamını anlatan fotoğrafların sergileneceği etkinlik.",
                "date": "2025-06-01",
                "time": "10:00",
                "location": "Güzel Sanatlar Galerisi",
                "category_id": categories.get("arts"),
                "organizer": "Fotoğrafçılık Kulübü",
                "image_url": "https://images.unsplash.com/photo-1594807777657-664cf4a4a616?q=80&w=1000&auto=format&fit=crop",
                "latitude": 41.0125,
                "longitude": 28.9756,
                "address": "İstanbul Üniversitesi Güzel Sanatlar Fakültesi, Beyazıt/İstanbul"
            }
        ]
        
        for event_data in events_data:
            if event_data["category_id"]:  # Kategori varsa ekle
                # Aynı başlıklı etkinlik var mı kontrol et
                existing = db.query(Event).filter(Event.title == event_data["title"]).first()
                if not existing:
                    event = Event(**event_data)
                    db.add(event)
                    print(f"Etkinlik oluşturuldu: {event_data['title']}")
                else:
                    print(f"Etkinlik zaten mevcut: {event_data['title']}")
        
        db.commit()
        print("Etkinlikler başarıyla oluşturuldu!")
        
    except Exception as e:
        print(f"Hata: {e}")
        db.rollback()
    finally:
        db.close()


def seed_admin():
    """Admin kullanıcısını oluştur"""
    db = SessionLocal()
    
    try:
        # Admin zaten var mı kontrol et
        existing = db.query(Admin).filter(Admin.username == settings.ADMIN_USERNAME).first()
        if not existing:
            admin = Admin(
                username=settings.ADMIN_USERNAME,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD)
            )
            db.add(admin)
            db.commit()
            print(f"Admin kullanıcısı oluşturuldu: {settings.ADMIN_USERNAME}")
            print(f"Şifre: {settings.ADMIN_PASSWORD}")
        else:
            print(f"Admin kullanıcısı zaten mevcut: {settings.ADMIN_USERNAME}")
            
    except Exception as e:
        print(f"Hata: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Veritabanı seed işlemi başlıyor...")
    print("-" * 50)
    
    print("\n1. Admin kullanıcısı oluşturuluyor...")
    seed_admin()
    
    print("\n2. Kategoriler oluşturuluyor...")
    seed_categories()
    
    print("\n3. Örnek etkinlikler oluşturuluyor...")
    seed_events()
    
    print("\n" + "-" * 50)
    print("Seed işlemi tamamlandı!")
    print("\nBackend'i başlatmak için: uvicorn app.main:app --reload")
    print("API dokümantasyonu: http://localhost:8000/docs")
    print(f"\nAdmin girişi için:")
    print(f"Kullanıcı adı: {settings.ADMIN_USERNAME}")
    print(f"Şifre: {settings.ADMIN_PASSWORD}")
