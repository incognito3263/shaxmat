from typing import List, Tuple
from ..piece import Piece
from ..board import Board

class King(Piece):
    def __init__(self, color: str, position: Tuple[int, int]):
        super().__init__(color, position)
        self.type = "K"
        self.castling_rights = True # Can castle if not moved

    def get_valid_moves(self, board: Board) -> List[Tuple[int, int]]:
        moves = []
        r, c = self.position

        king_moves = [
            (r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1),
            (r + 1, c + 1), (r + 1, c - 1), (r - 1, c + 1), (r - 1, c - 1)
        ]

        for new_r, new_c in king_moves:
            if board.is_valid_position(new_r, new_c):
                target_piece = board.get_piece_at(new_r, new_c)
                if target_piece is None or target_piece.color != self.color:
                    moves.append((new_r, new_c))

        # Castling moves will be handled by MoveValidator based on game state
        return moves
