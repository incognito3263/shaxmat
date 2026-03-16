"""Move representation for SHAXMAT+."""
from dataclasses import dataclass, field
from typing import Optional, Tuple


@dataclass
class Move:
    """Represents a single move in the game."""
    from_pos: Tuple[int, int]   # (row, col)
    to_pos: Tuple[int, int]
    promotion: Optional[str] = None       # 'Q', 'R', 'B', 'N'
    is_castling: bool = False
    castling_side: Optional[str] = None   # 'kingside' or 'queenside'
    is_en_passant: bool = False
    captured_piece_type: Optional[str] = None

    # Legacy aliases so old code using start_pos / end_pos / promotion_piece_type still works
    @property
    def start_pos(self) -> Tuple[int, int]:
        return self.from_pos

    @property
    def end_pos(self) -> Tuple[int, int]:
        return self.to_pos

    @property
    def promotion_piece_type(self) -> Optional[str]:
        return self.promotion

    def to_algebraic(self) -> str:
        """Convert to algebraic notation (e.g. e2e4, e7e8q)."""
        def pos_to_sq(row: int, col: int) -> str:
            return chr(ord('a') + col) + str(row + 1)
        s = pos_to_sq(*self.from_pos) + pos_to_sq(*self.to_pos)
        if self.promotion:
            s += self.promotion.lower()
        return s

    def to_dict(self) -> dict:
        return {
            "from_pos": list(self.from_pos),
            "to_pos": list(self.to_pos),
            "promotion": self.promotion,
            "is_castling": self.is_castling,
            "castling_side": self.castling_side,
            "is_en_passant": self.is_en_passant,
            "algebraic": self.to_algebraic(),
        }
