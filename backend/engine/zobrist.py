"""Zobrist hashing for SHAXMAT+ (10×8 board, 7 piece types)."""
import random
from typing import Dict, Tuple

BOARD_ROWS = 10
BOARD_COLS = 8
PIECE_TYPES = ['K', 'Q', 'R', 'B', 'N', 'P', 'S']
COLORS = ['white', 'black']

# Use a fixed seed so keys are stable across the process lifetime.
# (They are regenerated each process start, which is fine – we only need
#  consistency within one running server instance.)
_rng = random.Random(0x5348415858)


def _rand() -> int:
    return _rng.getrandbits(64)


class Zobrist:
    """Computes a Zobrist hash for a GameState snapshot."""

    # Class-level tables so all instances share the same keys.
    _piece_keys: Dict[Tuple[str, str, int, int], int] = {}
    _ep_keys: Dict[int, int] = {}
    _castling_keys: Dict[str, int] = {}
    _side_key: int = 0
    _initialised: bool = False

    @classmethod
    def _init_keys(cls):
        if cls._initialised:
            return
        for pt in PIECE_TYPES:
            for color in COLORS:
                for r in range(BOARD_ROWS):
                    for c in range(BOARD_COLS):
                        cls._piece_keys[(pt, color, r, c)] = _rand()
        for c in range(BOARD_COLS):
            cls._ep_keys[c] = _rand()
        for right in ('white_king_side', 'white_queen_side',
                      'black_king_side', 'black_queen_side'):
            cls._castling_keys[right] = _rand()
        cls._side_key = _rand()
        cls._initialised = True

    def __init__(self):
        Zobrist._init_keys()

    def hash(self, game_state) -> int:
        h = 0
        board = game_state.board
        for r in range(BOARD_ROWS):
            for c in range(BOARD_COLS):
                p = board.get_piece_at(r, c)
                if p:
                    key = self._piece_keys.get((p.type.upper(), p.color, r, c), 0)
                    h ^= key
        if game_state.en_passant_target is not None:
            h ^= self._ep_keys[game_state.en_passant_target[1]]
        for right, key in self._castling_keys.items():
            if game_state.castling_rights.get(right):
                h ^= key
        if game_state.turn == 'black':
            h ^= self._side_key
        return h
