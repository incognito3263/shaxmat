"""CheckDetector — thin wrapper kept for backward compatibility."""
from typing import Optional, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from .game_state import GameState


class CheckDetector:
    """Delegates to GameState.is_in_check() which is the canonical implementation."""

    def __init__(self, game_state: 'GameState'):
        self.game_state = game_state
        self.board = game_state.board

    def is_king_in_check(self, color: str) -> bool:
        return self.game_state.is_in_check(color)

    def _can_pawn_attack_square(self, pawn, target_pos: Tuple[int, int]) -> bool:
        pr, pc = pawn.position
        tr, tc = target_pos
        d = 1 if pawn.color == 'white' else -1
        return tr == pr + d and tc in (pc - 1, pc + 1)

    def _can_supplier_attack_square(self, supplier, target_pos: Tuple[int, int]) -> bool:
        sr, sc = supplier.position
        tr, tc = target_pos
        d = 1 if supplier.color == 'white' else -1
        return tr == sr + d and tc == sc
