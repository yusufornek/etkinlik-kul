import os

# Database dosyasını sil
db_file = "etkinlik.db"
if os.path.exists(db_file):
    os.remove(db_file)
    print(f"{db_file} silindi.")
else:
    print(f"{db_file} bulunamadı.")
