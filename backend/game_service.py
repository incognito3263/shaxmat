"""Game service — bridges engine and database."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from engine import GameState, Move
from engine.board import board_has_legacy_wrong_white_suppliers
from models import Game, User
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
        gs = GameState.from_dict(game.board_state)
        # Self-heal: old servers saved the wrong white Supplier files in board_state JSON.
        # No moves yet + legacy pattern → replace with correct GameState and persist.
        if (
            not gs.move_history
            and game.status == "active"
            and board_has_legacy_wrong_white_suppliers(gs.board)
            and game.id is not None
        ):
            gs = GameState()
            put_game_state(game.id, gs)
        return gs
    return GameState()


def calculate_elo_change(rating_a: int, rating_b: int, score_a: float, k: int = 32) -> int:
    """Calculate ELO rating change. score_a: 1.0 for win, 0.5 for draw, 0.0 for loss."""
    expected_a = 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
    return int(k * (score_a - expected_a))


def save_game_to_db(game_id: int, gs: GameState):
    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.id == game_id).first()
        if not game:
            return
        
        # Calculate time spent on the move
        now = datetime.utcnow()
        elapsed = int((now - game.last_move_at).total_seconds())
        
        # Subtract time from the player who just MOVED
        # gs.turn has already switched to the next player
        if game.status == "active" and len(gs.move_history) > 0:
            if gs.turn == "black": # White just moved
                game.white_time_left = max(0, game.white_time_left - elapsed + game.time_increment)
            else: # Black just moved
                game.black_time_left = max(0, game.black_time_left - elapsed + game.time_increment)
            
            # Check for flag fall
            if game.white_time_left <= 0:
                game.status = "timeout"
                game.winner = "black"
                gs.game_over = True
                gs.result = "timeout"
                gs.winner = "black"
            elif game.black_time_left <= 0:
                game.status = "timeout"
                game.winner = "white"
                gs.game_over = True
                gs.result = "timeout"
                gs.winner = "white"

        game.last_move_at = now
        
        d = gs.to_dict()
        game.board_state = d
        game.turn = d["turn"]
        game.halfmove_clock = d["halfmove_clock"]
        game.fullmove_number = d["fullmove_number"]
        if game.status == "active": # Only update if not already set by timeout
            game.status = d["result"] or "active"
            game.winner = d["winner"]

        # ── Statistics Update ────────────────────────────────────────────────
        if gs.game_over and not game.stats_updated:
            print(f"DEBUG: Updating stats for game {game.id}. Result: {gs.result}, Winner: {gs.winner}")
            
            w_player = db.query(User).filter(User.id == game.white_player_id).first() if game.white_player_id else None
            b_player = db.query(User).filter(User.id == game.black_player_id).first() if game.black_player_id else None

            if gs.result in ["checkmate", "timeout", "resigned"]:
                # If resigned, gs.winner should be set by the caller
                winner = gs.winner
                if winner == "white":
                    if w_player: w_player.wins += 1
                    if b_player: b_player.losses += 1
                elif winner == "black":
                    if b_player: b_player.wins += 1
                    if w_player: w_player.losses += 1
            elif gs.result in ["stalemate", "draw_50", "draw_repetition", "draw_insufficient", "draw_agreement"]:
                if w_player: w_player.draws += 1
                if b_player: b_player.draws += 1
            
            game.stats_updated = True
            print(f"DEBUG: Stats updated flag set for game {game.id}")
        
        db.commit()
    finally:
        db.close()


def create_new_game(
    game_mode: str = "AI",
    white_player_id: Optional[int] = None,
    black_player_id: Optional[int] = None,
    time_limit: int = 600,
    time_increment: int = 0,
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
            time_increment=time_increment,
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
