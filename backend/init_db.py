"""Create all database tables. Run: python init_db.py or docker compose exec backend python init_db.py"""
from database import engine, Base
from models import User, Follow, FriendRequest, Notification, Game, Move, BoardState

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Jadvallar muvaffaqiyatli yaratildi.")
