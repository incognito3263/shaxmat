"""MoveValidator — thin wrapper; canonical logic lives in GameState."""
from typing import TYPE_CHECKING
from .move import Move

if TYPE_CHECKING:
    from .game_state import GameState


class MoveValidator:
    """Validates a Move against a GameState."""

    def __init__(self, game_state: 'GameState'):
        self.game_state = game_state
        self.board = game_state.board

    def is_valid_move(self, move: Move) -> bool:
        """Return True if move is fully legal (pseudo-legal + king-safe)."""
        gs = self.game_state
        fr, fc = move.from_pos
        piece = self.board.get_piece_at(fr, fc)
        if piece is None or piece.color != gs.turn:
            return False

        classified = gs._classify_move(move, piece)
        if classified is None:
            return False

        if classified.is_castling:
            pass_cols = [5, 6] if classified.castling_side == 'kingside' else [2, 3]
            return gs._is_legal_castling(classified, pass_cols, 0)

        return gs._is_legal(classified)
