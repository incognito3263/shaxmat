# Debug va Baza Tekshirish

## Muammo: "Did not find any relations"

Bazada jadval yo‘q. Backend `create_all` ishga tushmagan yoki boshqa DB ga ulangan bo‘lishi mumkin.

---

## Yechim: Jadval yaratish

### 1-usul: init_db skripti (tavsiya etiladi)

```bash
cd /var/www/shaxmat
docker compose exec backend python init_db.py
```

Yoki bir qatorda:

```bash
docker compose exec backend python -c "from database import engine, Base; from models import User, Follow, FriendRequest, Notification, Game, Move, BoardState; Base.metadata.create_all(bind=engine); print('OK')"
```

### 2-usul: Backend qayta ishga tushirish

```bash
docker compose restart backend
```

Keyin tekshiring:

```bash
docker compose exec db psql -U shaxmat_user -d shaxmat_plus_db -c "\dt"
```

`users`, `games`, `moves` va boshqa jadvallar ko‘rinishi kerak.

---

## Foydalanuvchilarni ko‘rish

```bash
docker compose exec db psql -U shaxmat_user -d shaxmat_plus_db -c "SELECT id, username, public_id FROM users;"
```

---

## Backend qaysi bazaga ulanganini tekshirish

```bash
docker compose exec backend env | grep DATABASE
```

`postgresql://shaxmat_user:...@db:5432/shaxmat_plus_db` bo‘lishi kerak.
