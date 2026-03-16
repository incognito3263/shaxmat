from typing import List, Tuple
from ..piece import Piece
from ..board import Board

class Supplier(Piece):
    def __init__(self, color: str, position: Tuple[int, int]):
        super().__init__(color, position)
        self.type = "S"

    def get_valid_moves(self, board: Board) -> List[Tuple[int, int]]:
        moves = []
        r, c = self.position

        # Non-capture: Exactly 1 square diagonally (forward only implied by rules)
        # Assuming "forward" for white is increasing row, for black is decreasing row.
        # Rules state "Cannot move backward", so for white (r_dir = 1), only (r+1, c+1) and (r+1, c-1)
        # For black (r_dir = -1), only (r-1, c+1) and (r-1, c-1)
        r_dir = 1 if self.color == "white" else -1

        diag_moves = [
            (r + r_dir, c + 1),
            (r + r_dir, c - 1)
        ]

        for new_r, new_c in diag_moves:
            if board.is_valid_position(new_r, new_c) and board.is_empty(new_r, new_c):
                moves.append((new_r, new_c))
        
        # Capture: Exactly 1 square straight forward
        straight_forward_capture = [
            (r + r_dir, c)
        ]

        for new_r, new_c in straight_forward_capture:
            if board.is_valid_position(new_r, new_c):
                target_piece = board.get_piece_at(new_r, new_c)
                if target_piece and target_piece.color != self.color:
                    moves.append((new_r, new_c))
        
        return moves
