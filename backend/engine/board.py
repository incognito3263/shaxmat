from typing import List, Optional
from .piece import Piece

BOARD_ROWS = 10
BOARD_COLS = 8


def create_initial_board() -> 'Board':
    """Create board with SHAXMAT+ initial setup."""
    from .pieces import King, Queen, Rook, Bishop, Knight, Pawn, Supplier
    board = Board()

    # ── White ────────────────────────────────────────────────────────────────
    # Row 1 (index 0): R N B Q K B N R
    for col, cls in enumerate([Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]):
        board.set_piece_at(0, col, cls("white", (0, col)))
    # Row 2 (index 1): Pawns
    for c in range(8):
        board.set_piece_at(1, c, Pawn("white", (1, c)))
    # Row 3 (index 2): Suppliers on WHITE squares (A3,C3,E3,G3 → cols 0,2,4,6)
    for c in [0, 2, 4, 6]:
        board.set_piece_at(2, c, Supplier("white", (2, c)))

    # ── Black ────────────────────────────────────────────────────────────────
    # Row 10 (index 9): R N B Q K B N R
    for col, cls in enumerate([Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]):
        board.set_piece_at(9, col, cls("black", (9, col)))
    # Row 9 (index 8): Pawns
    for c in range(8):
        board.set_piece_at(8, c, Pawn("black", (8, c)))
    # Row 8 (index 7): Suppliers on BLACK squares (B8,D8,F8,H8 → cols 1,3,5,7)
    for c in [1, 3, 5, 7]:
        board.set_piece_at(7, c, Supplier("black", (7, c)))

    return board


class Board:
    BOARD_ROWS = BOARD_ROWS
    BOARD_COLS = BOARD_COLS

    def __init__(self):
        self._grid: List[List[Optional[Piece]]] = [
            [None] * BOARD_COLS for _ in range(BOARD_ROWS)
        ]

    # ── Access ────────────────────────────────────────────────────────────────
    def get_piece_at(self, row: int, col: int) -> Optional[Piece]:
        if 0 <= row < BOARD_ROWS and 0 <= col < BOARD_COLS:
            return self._grid[row][col]
        return None

    def set_piece_at(self, row: int, col: int, piece: Optional[Piece]):
        if 0 <= row < BOARD_ROWS and 0 <= col < BOARD_COLS:
            self._grid[row][col] = piece
            if piece is not None:
                piece.position = (row, col)

    def is_empty(self, row: int, col: int) -> bool:
        return self.get_piece_at(row, col) is None

    def is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < BOARD_ROWS and 0 <= col < BOARD_COLS

    def get_all_pieces(self, color: Optional[str] = None) -> List[Piece]:
        pieces: List[Piece] = []
        for r in range(BOARD_ROWS):
            for c in range(BOARD_COLS):
                p = self._grid[r][c]
                if p and (color is None or p.color == color):
                    pieces.append(p)
        return pieces

    def copy(self) -> 'Board':
        """Return a copy of the board with cloned pieces. Much faster than deepcopy."""
        new_board = Board()
        for r in range(BOARD_ROWS):
            for c in range(BOARD_COLS):
                p = self._grid[r][c]
                if p:
                    new_board._grid[r][c] = p.clone()
        return new_board

    # ── Serialisation ─────────────────────────────────────────────────────────
    def to_dict(self) -> List[List[Optional[dict]]]:
        """Return 10×8 list-of-lists; row 0 = rank 1."""
        result = []
        for r in range(BOARD_ROWS):
            row_data = []
            for c in range(BOARD_COLS):
                p = self._grid[r][c]
                row_data.append(p.to_dict() if p else None)
            result.append(row_data)
        return result

    @classmethod
    def from_dict(cls, data: List[List[Optional[dict]]]) -> 'Board':
        from .pieces import King, Queen, Rook, Bishop, Knight, Pawn, Supplier
        _map = {'K': King, 'Q': Queen, 'R': Rook, 'B': Bishop,
                'N': Knight, 'P': Pawn, 'S': Supplier}
        board = cls()
        for r, row in enumerate(data):
            for c, cell in enumerate(row):
                if cell:
                    piece_cls = _map.get(cell['type'].upper())
                    if piece_cls:
                        p = piece_cls(cell['color'], (r, c))
                        p.has_moved = cell.get('has_moved', False)
                        board._grid[r][c] = p
        return board

    # ── Debug ─────────────────────────────────────────────────────────────────
    def __str__(self):
        lines = []
        for r in range(BOARD_ROWS - 1, -1, -1):
            row_str = f"{r + 1:2} "
            for c in range(BOARD_COLS):
                p = self._grid[r][c]
                row_str += (str(p) if p else '.') + ' '
            lines.append(row_str.rstrip())
        lines.append("   a b c d e f g h")
        return '\n'.join(lines)
