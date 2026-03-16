"""Game service — bridges engine and database."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from engine import GameState, Move
from models import Game
from database import SessionLocal


# ── Coordinate helpers ────────────────────────────────────────────────────────

def square_to_pos(square: str) -> tuple:
    """'e2' → (1, 4)"""
    col = ord(square[0].lower()) - ord('a')
    row = int(square[1:]) - 1
    return (row, col)


def pos_to_square(row: int, col: int) -> str:
    """(1, 4) → 'e2'"""
    return chr(ord('a') + col) + str(row + 1)


# ── DB helpers ────────────────────────────────────────────────────────────────

def load_game_state_from_db(game: Game) -> GameState:
    if game.board_state and isinstance(game.board_state, dict) and "board" in game.board_state:
        return GameState.from_dict(game.board_state)
    return GameState()


def save_game_to_db(game_id: int, gs: GameState):
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.id == game_id).first()
        if not game:
            return
        
        game.last_move_at = datetime.utcnow()
        
        d = gs.to_dict()
        game.board_state = d
        game.turn = d["turn"]
        game.halfmove_clock = d["halfmove_clock"]
        game.fullmove_number = d["fullmove_number"]
        game.status = d["result"] or "active"
        game.winner = d["winner"]
        
        db.commit()
    finally:
        db.close()


def create_new_game(
    game_mode: str = "AI",
    white_player_id: Optional[int] = None,
    black_player_id: Optional[int] = None,
    time_limit: int = 600,
    ai_difficulty: str = "normal"
) -> tuple[GameState, int]:
    gs = GameState()
    db = SessionLocal()
    try:
        game = Game(
            status="active",
            turn="white",
            game_mode=game_mode,
            ai_difficulty=ai_difficulty,
            white_player_id=white_player_id,
            black_player_id=black_player_id,
            white_time_left=time_limit,
            black_time_left=time_limit,
            last_move_at=datetime.utcnow(),
            board_state=gs.to_dict(),
            halfmove_clock=0,
            fullmove_number=1,
        )
        db.add(game)
        db.commit()
        db.refresh(game)
        return gs, game.id
    finally:
        db.close()


# ── In-memory cache ───────────────────────────────────────────────────────────

_game_store: dict[int, GameState] = {}


def get_or_create_game_state(game_id: int, db_game: Optional[Game] = None) -> Optional[GameState]:
    if game_id in _game_store:
        return _game_store[game_id]
    if db_game:
        gs = load_game_state_from_db(db_game)
        _game_store[game_id] = gs
        return gs
    return None


def put_game_state(game_id: int, gs: GameState):
    _game_store[game_id] = gs
    save_game_to_db(game_id, gs)
