"""Pydantic schemas for SHAXMAT+ API."""
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime


class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    avatar: Optional[str] = '👨‍🚀'

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    public_id: str
    is_online: bool
    wins: int = 0
    losses: int = 0
    draws: int = 0
    avatar: str
    country_code: Optional[str] = None
    class Config:
        from_attributes = True

class FriendRequestResponse(BaseModel):
    id: int
    from_user: UserResponse
    status: str
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    text: str
    type: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CreateGameRequest(BaseModel):
    game_mode: str = "AI" # "AI" or "Person"
    opponent_public_id: Optional[str] = None
    creator_public_id: Optional[str] = None
    time_limit: Optional[int] = 600 # default 10 min
    time_increment: Optional[int] = 0 # Fischer increment
    ai_difficulty: Optional[str] = "normal" # easy, normal, hard

class CreateGameResponse(BaseModel):
    id: int
    status: str
    turn: str
    game_mode: str
    ai_difficulty: Optional[str] = None

class MoveRequest(BaseModel):
    from_square: str
    to_square: str
    promotion: Optional[str] = None

class GameResponse(BaseModel):
    id: int
    game_mode: str
    status: str
    turn: str
    winner: Optional[str] = None
    board: List[List[Optional[dict]]]
    move_history: List[str]
    halfmove_clock: int
    fullmove_number: int
    legal_moves: Optional[Dict[str, List[str]]] = None
    in_check: bool = False
    white_time_left: int
    black_time_left: int
    time_increment: int
    white_player_id: Optional[int] = None
    black_player_id: Optional[int] = None
    white_player_public_id: Optional[str] = None
    black_player_public_id: Optional[str] = None
    white_avatar: Optional[str] = None
    black_avatar: Optional[str] = None
    white_username: Optional[str] = None
    black_username: Optional[str] = None
    white_country_code: Optional[str] = None
    black_country_code: Optional[str] = None
    ai_difficulty: Optional[str] = None
    evaluation: Optional[float] = 0.0
    captured_pieces: Optional[Dict[str, List[str]]] = None
    last_move: Optional[Dict] = None

class MoveHistoryItem(BaseModel):
    move_number: int
    algebraic: str
