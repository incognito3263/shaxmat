"""CheckmateDetector — thin wrapper; canonical logic lives in GameState."""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .game_state import GameState


class CheckmateDetector:
    def __init__(self, game_state: 'GameState'):
        self.game_state = game_state
        self.board = game_state.board

    def has_legal_moves(self, color: str) -> bool:
        orig = self.game_state.turn
        self.game_state.turn = color
        moves = self.game_state.get_legal_moves()
        self.game_state.turn = orig
        return len(moves) > 0

    def is_checkmate(self, color: str) -> bool:
        return self.game_state.is_checkmate(color)

    def is_stalemate(self, color: str) -> bool:
        return self.game_state.is_stalemate(color)
