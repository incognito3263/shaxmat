from typing import List, Tuple
from ..piece import Piece
from ..board import Board

class Knight(Piece):
    def __init__(self, color: str, position: Tuple[int, int]):
        super().__init__(color, position)
        self.type = "N"

    def get_valid_moves(self, board: Board) -> List[Tuple[int, int]]:
        moves = []
        r, c = self.position

        knight_moves = [
            (r + 2, c + 1), (r + 2, c - 1), (r - 2, c + 1), (r - 2, c - 1),
            (r + 1, c + 2), (r + 1, c - 2), (r - 1, c + 2), (r - 1, c - 2)
        ]

        for new_r, new_c in knight_moves:
            if board.is_valid_position(new_r, new_c):
                target_piece = board.get_piece_at(new_r, new_c)
                if target_piece is None or target_piece.color != self.color:
                    moves.append((new_r, new_c))
        return moves
