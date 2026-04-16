"""SQLAlchemy models for SHAXMAT+."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True)
    password_hash = Column(String(128)) # Hash for security
    public_id = Column(String(8), unique=True, index=True)
  # 8-digit unique ID
    online = Column(Boolean, default=False)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    rating = Column(Integer, default=1200)
    avatar = Column(String(64), default='👨‍🚀')
    country_code = Column(String(2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    games = relationship("Game", back_populates="white_player", foreign_keys="Game.white_player_id")
    games_black = relationship("Game", back_populates="black_player", foreign_keys="Game.black_player_id")
    
    # Followers relationship
    following = relationship(
        "User",
        secondary="follows",
        primaryjoin="User.id==Follow.follower_id",
        secondaryjoin="User.id==Follow.followed_id",
        backref="followers"
    )


class Follow(Base):
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    followed_id = Column(Integer, ForeignKey("users.id"))


class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    from_id = Column(Integer, ForeignKey("users.id"))
    to_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(16), default='pending') # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(String(255))
    type = Column(String(32)) # info, invite, friend_request
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Game(Base):
    __tablename__ = "games"
    id = Column(Integer, primary_key=True, index=True)
    white_player_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    black_player_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    game_mode = Column(String(16), default="AI") # "AI" or "Person"
    ai_difficulty = Column(String(16), default="normal") # easy, normal, hard
    status = Column(String(32), default="active")
    winner = Column(String(8), nullable=True)
    board_state = Column(JSON)
    turn = Column(String(8), default="white")
    
    # Timers (in seconds)
    white_time_left = Column(Integer, default=600) # 10 minutes default
    black_time_left = Column(Integer, default=600)
    clock_initial_seconds = Column(Integer, default=600)  # starting clock per side (for history display)
    time_increment = Column(Integer, default=0) # Fischer increment in seconds
    last_move_at = Column(DateTime, default=datetime.utcnow)
    
    halfmove_clock = Column(Integer, default=0)
    en_passant = Column(JSON, nullable=True)
    white_kingside = Column(Boolean, default=True)
    white_queenside = Column(Boolean, default=True)
    black_kingside = Column(Boolean, default=True)
    black_queenside = Column(Boolean, default=True)
    fullmove_number = Column(Integer, default=1)
    stats_updated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    white_player = relationship("User", back_populates="games", foreign_keys=[white_player_id])
    black_player = relationship("User", back_populates="games_black", foreign_keys=[black_player_id])
    moves = relationship("Move", back_populates="game", order_by="Move.move_number")
    board_states = relationship("BoardState", back_populates="game", order_by="BoardState.move_number")


class Move(Base):
    __tablename__ = "moves"
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    move_number = Column(Integer, nullable=False)
    algebraic = Column(String(16), nullable=False)  # e.g. e2e4
    from_row = Column(Integer, nullable=False)
    from_col = Column(Integer, nullable=False)
    to_row = Column(Integer, nullable=False)
    to_col = Column(Integer, nullable=False)
    promotion = Column(String(1), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game", back_populates="moves")


class BoardState(Base):
    __tablename__ = "board_states"
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    move_number = Column(Integer, nullable=False)
    board_hash = Column(Integer, nullable=True)  # Zobrist for repetition
    state = Column(JSON, nullable=False)  # Full board serialization
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game", back_populates="board_states")
