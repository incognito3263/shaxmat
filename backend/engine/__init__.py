"""SHAXMAT+ Game Engine — rule-complete, no UI/DB dependencies."""
from .board import (
    Board,
    BOARD_ROWS,
    BOARD_COLS,
    board_has_legacy_wrong_white_suppliers,
    create_initial_board,
)
from .game_state import GameState
from .move import Move
from .piece import Piece

__all__ = [
    "Board",
    "BOARD_ROWS",
    "BOARD_COLS",
    "board_has_legacy_wrong_white_suppliers",
    "create_initial_board",
    "GameState",
    "Move",
    "Piece",
]
