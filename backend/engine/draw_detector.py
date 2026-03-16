"""DrawDetector — thin wrapper; canonical logic lives in GameState."""
from collections import Counter
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .game_state import GameState


class DrawDetector:
    def __init__(self, game_state: 'GameState'):
        self.game_state = game_state
        self.board = game_state.board

    def is_50_move_rule_draw(self) -> bool:
        return self.game_state.halfmove_clock >= 100

    def is_insufficient_material_draw(self) -> bool:
        return self.game_state._is_insufficient_material()

    def is_threefold_repetition_draw(self) -> bool:
        hist = self.game_state.position_history
        if not hist:
            return False
        cnt = Counter(hist)
        return cnt[hist[-1]] >= 3
