from typing import List, Tuple
from ..piece import Piece
from ..board import Board

class Pawn(Piece):
    def __init__(self, color: str, position: Tuple[int, int]):
        super().__init__(color, position)
        self.type = "P"

    def get_valid_moves(self, board: Board) -> List[Tuple[int, int]]:
        moves = []
        r, c = self.position
        direction = 1 if self.color == "white" else -1

        # 1-square move
        new_r = r + direction
        if board.is_valid_position(new_r, c) and board.is_empty(new_r, c):
            moves.append((new_r, c))

            # 2-square move (only on first move)
            if not self.has_moved:
                new_r_double = r + 2 * direction
                if board.is_valid_position(new_r_double, c) and board.is_empty(new_r_double, c) and board.is_empty(new_r, c):
                    moves.append((new_r_double, c))

        # Captures
        for dc in [-1, 1]:
            new_r_capture, new_c_capture = r + direction, c + dc
            if board.is_valid_position(new_r_capture, new_c_capture):
                target_piece = board.get_piece_at(new_r_capture, new_c_capture)
                if target_piece and target_piece.color != self.color:
                    moves.append((new_r_capture, new_c_capture))
        
        # En passant will be handled by MoveValidator based on game state
        return moves
