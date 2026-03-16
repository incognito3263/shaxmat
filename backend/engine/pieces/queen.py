from typing import List, Tuple
from ..piece import Piece
from ..board import Board

class Queen(Piece):
    def __init__(self, color: str, position: Tuple[int, int]):
        super().__init__(color, position)
        self.type = "Q"

    def get_valid_moves(self, board: Board) -> List[Tuple[int, int]]:
        moves = []
        r, c = self.position

        # Directions: horizontal, vertical, diagonal
        directions = [
            (0, 1), (0, -1), (1, 0), (-1, 0),  # Horizontal and Vertical
            (1, 1), (1, -1), (-1, 1), (-1, -1)  # Diagonal
        ]

        for dr, dc in directions:
            for i in range(1, max(board.BOARD_ROWS, board.BOARD_COLS)):
                new_r, new_c = r + dr * i, c + dc * i
                if not board.is_valid_position(new_r, new_c):
                    break
                
                target_piece = board.get_piece_at(new_r, new_c)
                if target_piece is None:
                    moves.append((new_r, new_c))
                elif target_piece.color != self.color:
                    moves.append((new_r, new_c))
                    break # Captured opponent's piece, cannot move further
                else:
                    break # Blocked by own piece
        return moves
