from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, File, UploadFile
import shutil
import uuid
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, List, Any
import json
import random
import string
import bcrypt
import os
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt

from database import engine, Base, get_db
from models import User, Game, Notification
from routers import game
import schemas
from websocket_manager import manager

# Security setup
SECRET_KEY = "shaxmat-plus-super-secret-key"
ALGORITHM = "HS256"

def get_password_hash(password: str):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    # Run robust migrations for new columns
    from sqlalchemy import text, inspect
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            columns = [c['name'] for c in inspector.get_columns('games')]
            
            # Add time_increment if missing
            if 'time_increment' not in columns:
                print("DEBUG: Adding time_increment column...")
                conn.execute(text("ALTER TABLE games ADD COLUMN time_increment INTEGER DEFAULT 0"))
                conn.commit()
                print("DEBUG: time_increment added.")
                
            # Add stats_updated if missing
            if 'stats_updated' not in columns:
                print("DEBUG: Adding stats_updated column...")
                conn.execute(text("ALTER TABLE games ADD COLUMN stats_updated BOOLEAN DEFAULT FALSE"))
                conn.commit()
                print("DEBUG: stats_updated added.")
    except Exception as e:
        print(f"DEBUG: Migration error: {e}")
    
    # Heartbeat task to keep WS connections alive
    async def heartbeat():
        while True:
            await asyncio.sleep(20)
            print(f"DEBUG: WS Heartbeat - active: {len(manager.active_connections)}")
            for public_id in list(manager.active_connections.keys()):
                websocket = manager.active_connections.get(public_id)
                if not websocket: continue
                try:
                    await manager.send_personal_message(json.dumps({"type": "ping"}), public_id)
                except:
                    manager.disconnect(public_id, websocket)
    
    asyncio.create_task(heartbeat())
    yield

app = FastAPI(title="CHESS NEXUS API", lifespan=lifespan)

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth endpoints ───────────────────────────────────────────────────────────

@app.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...)):
    os.makedirs("uploads/avatars", exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"uploads/avatars/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/{file_path}"}

@app.post("/signup", response_model=schemas.Token)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Signup attempt for user: {user_in.username}")
    try:
        existing = db.query(User).filter(User.username == user_in.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already registered")
        while True:
            pid = ''.join(random.choices(string.digits, k=8))
            if not db.query(User).filter(User.public_id == pid).first():
                break
        user = User(
            username=user_in.username, 
            password_hash=get_password_hash(user_in.password),
            public_id=pid,
            avatar=user_in.avatar or '👨‍🚀'
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer", "user": user}
    except Exception as e:
        print(f"DEBUG: Signup ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post("/update-profile")
def update_profile(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.public_id == data.get("public_id")).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if data.get("avatar"):
        user.avatar = data.get("avatar")
        db.commit()
        db.refresh(user)
    return user

@app.get("/leaderboard", response_model=List[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).filter((User.wins + User.losses + User.draws) >= 2).order_by(User.wins.desc(), User.draws.desc(), User.losses.asc()).limit(10).all()
    return users

@app.get("/notifications/{user_id}", response_model=List[schemas.NotificationResponse])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    try:
        from models import Notification
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(20).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notifications/mark-read/{notif_id}")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}

def add_notif(user_id: int, text: str, ntype: str, db: Session):
    from models import Notification
    db.add(Notification(user_id=user_id, text=text, type=ntype))
    db.commit()

@app.post("/users/friend-request/{target_public_id}")
def send_friend_request(target_public_id: str, current_user_id: int, db: Session = Depends(get_db)):
    target = db.query(User).filter(User.public_id == target_public_id).first()
    if not target or target.id == current_user_id: raise HTTPException(status_code=400, detail="Invalid target")
    from models import FriendRequest
    if not db.query(FriendRequest).filter(FriendRequest.from_id == current_user_id, FriendRequest.to_id == target.id, FriendRequest.status == 'pending').first():
        db.add(FriendRequest(from_id=current_user_id, to_id=target.id))
        db.commit()
    return {"success": True}

@app.get("/users/friend-requests/{current_user_id}", response_model=List[schemas.FriendRequestResponse])
def get_friend_requests(current_user_id: int, db: Session = Depends(get_db)):
    from models import FriendRequest
    requests = db.query(FriendRequest).filter(FriendRequest.to_id == current_user_id, FriendRequest.status == 'pending').all()
    results = []
    for r in requests:
        u = db.query(User).filter(User.id == r.from_id).first()
        results.append({"id": r.id, "from_user": u, "status": r.status})
    return results

@app.post("/users/follow/{target_public_id}")
def follow_user(target_public_id: str, current_user_id: int, db: Session = Depends(get_db)):
    target = db.query(User).filter(User.public_id == target_public_id).first()
    if not target: raise HTTPException(status_code=404, detail="User not found")
    from models import Follow
    if not db.query(Follow).filter(Follow.follower_id == current_user_id, Follow.followed_id == target.id).first():
        db.add(Follow(follower_id=current_user_id, followed_id=target.id))
        db.commit()
    return {"success": True}

@app.post("/users/unfollow/{target_public_id}")
def unfollow_user(target_public_id: str, current_user_id: int, db: Session = Depends(get_db)):
    target = db.query(User).filter(User.public_id == target_public_id).first()
    if not target: raise HTTPException(status_code=404, detail="User not found")
    from models import Follow
    db.query(Follow).filter(Follow.follower_id == current_user_id, Follow.followed_id == target.id).delete()
    db.commit()
    return {"success": True}

@app.post("/users/friend-respond/{request_id}")
def respond_friend_request(request_id: int, accept: bool, db: Session = Depends(get_db)):
    from models import FriendRequest, Follow
    req = db.query(FriendRequest).filter(FriendRequest.id == request_id).first()
    if not req: raise HTTPException(status_code=404, detail="Request not found")
    if accept:
        req.status = 'accepted'
        db.add(Follow(follower_id=req.from_id, followed_id=req.to_id))
        db.add(Follow(follower_id=req.to_id, followed_id=req.from_id))
    else: req.status = 'rejected'
    db.commit()
    return {"success": True}

@app.get("/users/friends/{current_user_id}", response_model=List[schemas.UserResponse])
def get_friends(current_user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user.following

@app.get("/users/search/{public_id}", response_model=schemas.UserResponse)
def search_user(public_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.public_id == public_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user

@app.websocket("/ws/{public_id}")
async def websocket_endpoint(websocket: WebSocket, public_id: str, db: Session = Depends(get_db)):
    await manager.connect(public_id, websocket)
    user = db.query(User).filter(User.public_id == public_id).first()
    if user:
        user.is_online = True
        db.commit()
        await manager.broadcast(json.dumps({"type": "user_status", "public_id": public_id, "online": True}))
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "invite":
                await manager.send_personal_message(json.dumps({
                    "type": "game_invite", 
                    "from_id": public_id, 
                    "from_username": user.username if user else "Unknown",
                    "time_limit": message.get("time_limit"),
                    "time_increment": message.get("time_increment")
                }), message.get("target_id"))
            elif message.get("type") == "accept_invite":
                await manager.send_personal_message(json.dumps({"type": "invite_accepted", "from_id": public_id}), message.get("target_id"))
            elif message.get("type") == "game_start":
                await manager.send_personal_message(json.dumps({"type": "game_start", "game_id": message.get("game_id"), "from_id": public_id}), message.get("target_id"))
            elif message.get("type") == "chat":
                await manager.send_personal_message(json.dumps({"type": "chat", "from_id": public_id, "from_username": user.username if user else "Unknown", "text": message.get("text")}), message.get("target_id"))
            elif message.get("type") == "draw_offer":
                await manager.send_personal_message(json.dumps({"type": "draw_offer", "from_id": public_id, "from_username": user.username if user else "Unknown"}), message.get("target_id"))
            elif message.get("type") == "draw_respond":
                await manager.send_personal_message(json.dumps({"type": "draw_respond", "from_id": public_id, "accepted": message.get("accepted")}), message.get("target_id"))
            elif message.get("type") == "friend_request":
                target_user = db.query(User).filter(User.public_id == message.get("target_id")).first()
                if target_user: add_notif(target_user.id, f"New friend request from {user.username}", "friend_request", db)
                await manager.send_personal_message(json.dumps({"type": "friend_request", "from_id": public_id, "from_username": user.username if user else "Unknown"}), message.get("target_id"))
            elif message.get("type") == "friend_respond":
                await manager.send_personal_message(json.dumps({"type": "friend_respond", "from_id": public_id, "from_username": user.username if user else "Unknown", "accepted": message.get("accepted")}), message.get("target_id"))
            elif message.get("type") == "find_match":
                if public_id not in manager.matchmaking_queue: 
                    manager.matchmaking_queue.append(public_id)
                if len(manager.matchmaking_queue) >= 2:
                    p1_id = manager.matchmaking_queue.pop(0)
                    p2_id = manager.matchmaking_queue.pop(0)
                    
                    p1_obj = db.query(User).filter(User.public_id == p1_id).first()
                    p2_obj = db.query(User).filter(User.public_id == p2_id).first()
                    
                    if p1_obj and p2_obj:
                        await manager.send_personal_message(json.dumps({
                            "type": "match_found", 
                            "opponent_id": p2_id,
                            "opponent_username": p2_obj.username,
                            "opponent_avatar": p2_obj.avatar
                        }), p1_id)
                        await manager.send_personal_message(json.dumps({
                            "type": "match_found", 
                            "opponent_id": p1_id,
                            "opponent_username": p1_obj.username,
                            "opponent_avatar": p1_obj.avatar
                        }), p2_id)
            elif message.get("type") == "match_start":
                # One player sends this after selecting time
                await manager.send_personal_message(json.dumps({
                    "type": "match_offer",
                    "from_id": public_id,
                    "from_username": user.username if user else "Opponent",
                    "time_limit": message.get("time_limit"),
                    "time_increment": message.get("time_increment")
                }), message.get("target_id"))
            elif message.get("type") == "leave_queue":
                if public_id in manager.matchmaking_queue: manager.matchmaking_queue.remove(public_id)
            elif message.get("type") == "spectate":
                if message.get("game_id") not in manager.spectators: manager.spectators[message.get("game_id")] = set()
                manager.spectators[message.get("game_id")].add(public_id)
            elif message.get("type") == "leave_spectate":
                if message.get("game_id") in manager.spectators: manager.spectators[message.get("game_id")].discard(public_id)
            elif message.get("type") == "pong": pass
    except Exception: pass
    finally:
        manager.disconnect(public_id, websocket)
        user = db.query(User).filter(User.public_id == public_id).first()
        if user and public_id not in manager.active_connections:
            user.is_online = False
            db.commit()
            await manager.broadcast(json.dumps({"type": "user_status", "public_id": public_id, "online": False}))

app.include_router(game.router)
