"""PromotionHandler — determines if a move requires promotion."""
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .game_state import GameState
    from .move import Move
    from .piece import Piece

WHITE_PROMO_ROW = 9
BLACK_PROMO_ROW = 0


class PromotionHandler:
    def __init__(self, game_state: 'GameState'):
        self.game_state = game_state
        self.board = game_state.board

    def is_promotion_move(self, move: 'Move') -> bool:
        fr, fc = move.from_pos
        tr, tc = move.to_pos
        piece = self.board.get_piece_at(fr, fc)
        if not piece or piece.type not in ('P', 'S'):
            return False
        promo_row = WHITE_PROMO_ROW if piece.color == 'white' else BLACK_PROMO_ROW
        return tr == promo_row

    def promote_piece(self, piece: 'Piece', new_type: str) -> 'Piece':
        from .pieces import Queen, Rook, Bishop, Knight
        _map = {'Q': Queen, 'R': Rook, 'B': Bishop, 'N': Knight}
        cls = _map.get(new_type.upper())
        if cls is None:
            raise ValueError(f"Cannot promote to {new_type!r}")
        new_piece = cls(piece.color, piece.position)
        new_piece.has_moved = True
        return new_piece
