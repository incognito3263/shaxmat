"""Pytest-compatible unit tests for the SHAXMAT+ engine.
Run with: python3 -m pytest tests/test_engine.py -v
Or without pytest: python3 tests/run_tests.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from engine import GameState, Move
from engine.board import Board, board_has_legacy_wrong_white_suppliers, create_initial_board
from engine.pieces import King, Queen, Rook, Bishop, Knight, Pawn, Supplier


def bare_board(white_king=(0, 4), black_king=(9, 4)) -> Board:
    b = Board()
    b.set_piece_at(*white_king, King("white", white_king))
    b.set_piece_at(*black_king, King("black", black_king))
    return b


# ── Initial position ──────────────────────────────────────────────────────────

def test_initial_board():
    gs = GameState()
    assert gs.turn == "white"
    assert gs.board.get_piece_at(0, 4).type == "K"
    assert gs.board.get_piece_at(9, 4).type == "K"
    assert gs.board.get_piece_at(2, 0).type == "S"
    assert gs.board.get_piece_at(7, 1).type == "S"


def test_board_has_legacy_wrong_white_suppliers():
    b = create_initial_board()
    assert not board_has_legacy_wrong_white_suppliers(b)
    for c in [0, 2, 4, 6]:
        b.set_piece_at(2, c, None)
    for c in [1, 3, 5, 7]:
        b.set_piece_at(2, c, Supplier("white", (2, c)))
    assert board_has_legacy_wrong_white_suppliers(b)


def test_initial_legal_moves():
    gs = GameState()
    assert len(gs.get_legal_moves()) == 17


# ── Pawn ──────────────────────────────────────────────────────────────────────

def test_pawn_move():
    gs = GameState()
    assert gs.apply_move(Move(from_pos=(1, 3), to_pos=(3, 3)))
    assert gs.turn == "black"
    assert gs.board.get_piece_at(3, 3).type == "P"
    assert gs.board.get_piece_at(1, 3) is None


def test_pawn_double_step_sets_ep_target():
    gs = GameState()
    gs.apply_move(Move(from_pos=(1, 3), to_pos=(3, 3)))
    assert gs.en_passant_target == (2, 3)


def test_pawn_double_step_blocked_by_supplier():
    gs = GameState()
    assert not gs.apply_move(Move(from_pos=(1, 0), to_pos=(3, 0)))


def test_promotion():
    b = bare_board()
    b.set_piece_at(8, 0, Pawn("white", (8, 0)))
    gs = GameState(board=b)
    assert gs.apply_move(Move(from_pos=(8, 0), to_pos=(9, 0), promotion="Q"))
    assert gs.board.get_piece_at(9, 0).type == "Q"


# ── Supplier ──────────────────────────────────────────────────────────────────

def test_supplier_move():
    gs = GameState()
    assert gs.apply_move(Move(from_pos=(2, 2), to_pos=(3, 3)))
    assert gs.board.get_piece_at(3, 3).type == "S"


def test_supplier_no_backward():
    b = bare_board()
    b.set_piece_at(5, 3, Supplier("white", (5, 3)))
    gs = GameState(board=b)
    assert not gs.apply_move(Move(from_pos=(5, 3), to_pos=(4, 4)))


def test_supplier_capture_forward():
    b = bare_board()
    b.set_piece_at(5, 3, Supplier("white", (5, 3)))
    b.set_piece_at(6, 3, Pawn("black", (6, 3)))
    gs = GameState(board=b)
    assert gs.apply_move(Move(from_pos=(5, 3), to_pos=(6, 3)))
    assert gs.board.get_piece_at(6, 3).color == "white"


def test_supplier_promotion():
    b = bare_board()
    b.set_piece_at(8, 0, Supplier("white", (8, 0)))
    gs = GameState(board=b)
    assert gs.apply_move(Move(from_pos=(8, 0), to_pos=(9, 1), promotion="N"))
    assert gs.board.get_piece_at(9, 1).type == "N"


# ── Castling ──────────────────────────────────────────────────────────────────

def test_castling_kingside():
    gs = GameState()
    gs.board.set_piece_at(0, 5, None)
    gs.board.set_piece_at(0, 6, None)
    assert gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 6)))
    assert gs.board.get_piece_at(0, 6).type == "K"
    assert gs.board.get_piece_at(0, 5).type == "R"


def test_castling_queenside():
    gs = GameState()
    gs.board.set_piece_at(0, 1, None)
    gs.board.set_piece_at(0, 2, None)
    gs.board.set_piece_at(0, 3, None)
    assert gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 2)))
    assert gs.board.get_piece_at(0, 2).type == "K"
    assert gs.board.get_piece_at(0, 3).type == "R"


def test_castling_rights_revoked():
    gs = GameState()
    gs.board.set_piece_at(0, 5, None)
    gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 5)))
    assert not gs.castling_rights["white_king_side"]
    assert not gs.castling_rights["white_queen_side"]


def test_castling_blocked():
    gs = GameState()
    assert not gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 6)))


# ── Check / checkmate / stalemate ─────────────────────────────────────────────

def test_illegal_move_rejected():
    gs = GameState()
    assert not gs.apply_move(Move(from_pos=(0, 4), to_pos=(2, 4)))


def test_check_detection():
    b = bare_board()
    b.set_piece_at(5, 4, Rook("black", (5, 4)))
    gs = GameState(board=b)
    assert gs.is_in_check("white")


def test_checkmate():
    b = Board()
    b.set_piece_at(9, 0, King("black", (9, 0)))
    b.set_piece_at(7, 2, King("white", (7, 2)))
    b.set_piece_at(7, 1, Queen("white", (7, 1)))
    b.set_piece_at(9, 7, Rook("white", (9, 7)))
    gs = GameState(board=b)
    gs.turn = "black"
    assert gs.is_checkmate("black")


# ── Draw conditions ───────────────────────────────────────────────────────────

def test_50_move_rule():
    gs = GameState()
    gs.halfmove_clock = 100
    gs._check_game_over()
    assert gs.game_over
    assert gs.result == "draw_50"


# ── Serialisation ─────────────────────────────────────────────────────────────

def test_serialisation():
    gs = GameState()
    gs.apply_move(Move(from_pos=(1, 3), to_pos=(3, 3)))
    d = gs.to_dict()
    gs2 = GameState.from_dict(d)
    assert gs2.turn == gs.turn
    assert gs2.board.get_piece_at(3, 3).type == "P"
    assert len(gs2.move_history) == 1
