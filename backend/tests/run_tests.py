"""Run all engine tests without pytest dependency."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import traceback
from engine import GameState, Move
from engine.board import Board
from engine.pieces import King, Queen, Rook, Bishop, Knight, Pawn, Supplier


def bare_board(white_king=(0, 4), black_king=(9, 4)) -> Board:
    b = Board()
    b.set_piece_at(*white_king, King("white", white_king))
    b.set_piece_at(*black_king, King("black", black_king))
    return b


tests_passed = 0
tests_failed = 0


def run(name, fn):
    global tests_passed, tests_failed
    try:
        fn()
        print(f"  PASS  {name}")
        tests_passed += 1
    except Exception as e:
        print(f"  FAIL  {name}: {e}")
        traceback.print_exc()
        tests_failed += 1


# ── Initial position ──────────────────────────────────────────────────────────

def t_initial_board():
    gs = GameState()
    assert gs.board.get_piece_at(0, 4).type == "K"
    assert gs.board.get_piece_at(9, 4).type == "K"
    assert gs.board.get_piece_at(2, 1).type == "S"
    assert gs.board.get_piece_at(7, 1).type == "S"
    assert gs.turn == "white"


def t_initial_legal_moves():
    gs = GameState()
    moves = gs.get_legal_moves()
    assert len(moves) == 17, f"Expected 17, got {len(moves)}"


# ── Pawn ──────────────────────────────────────────────────────────────────────

def t_pawn_single_step():
    gs = GameState()
    ok = gs.apply_move(Move(from_pos=(1, 0), to_pos=(2, 0)))
    assert ok
    assert gs.board.get_piece_at(2, 0).type == "P"


def t_pawn_double_step():
    gs = GameState()
    ok = gs.apply_move(Move(from_pos=(1, 0), to_pos=(3, 0)))
    assert ok
    assert gs.en_passant_target == (2, 0)


def t_pawn_double_step_blocked_by_supplier():
    gs = GameState()
    ok = gs.apply_move(Move(from_pos=(1, 1), to_pos=(3, 1)))
    assert not ok, "b-pawn double step should be blocked by supplier at b3"


def t_pawn_promotion():
    b = bare_board()
    b.set_piece_at(8, 0, Pawn("white", (8, 0)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(8, 0), to_pos=(9, 0), promotion="Q"))
    assert ok
    assert gs.board.get_piece_at(9, 0).type == "Q"


def t_pawn_auto_queen():
    b = bare_board()
    b.set_piece_at(8, 0, Pawn("white", (8, 0)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(8, 0), to_pos=(9, 0)))
    assert ok
    assert gs.board.get_piece_at(9, 0).type == "Q"


def t_en_passant():
    b = bare_board()
    b.set_piece_at(1, 1, Pawn("white", (1, 1)))
    b.set_piece_at(8, 2, Pawn("black", (8, 2)))
    gs = GameState(board=b)
    # Advance white b-pawn to b6 (row5)
    gs.apply_move(Move(from_pos=(1, 1), to_pos=(3, 1)))  # b2-b4
    gs.apply_move(Move(from_pos=(9, 4), to_pos=(9, 3)))  # black king move (pass turn)
    gs.apply_move(Move(from_pos=(3, 1), to_pos=(4, 1)))  # b4-b5
    gs.apply_move(Move(from_pos=(9, 3), to_pos=(9, 4)))  # black king move
    gs.apply_move(Move(from_pos=(4, 1), to_pos=(5, 1)))  # b5-b6
    # Black c9-c7 double step
    ok = gs.apply_move(Move(from_pos=(8, 2), to_pos=(6, 2)))
    assert ok
    assert gs.en_passant_target == (7, 2)
    # White b6xc7 en passant
    ok = gs.apply_move(Move(from_pos=(5, 1), to_pos=(6, 2)))
    assert ok
    assert gs.board.get_piece_at(6, 2).color == "white"


# ── Supplier ──────────────────────────────────────────────────────────────────

def t_supplier_diagonal():
    # b3 supplier (2,1) can move to c4 (3,2) without any setup
    gs = GameState()
    gs.apply_move(Move(from_pos=(2, 1), to_pos=(3, 2)))  # b3 supplier -> c4
    assert gs.board.get_piece_at(3, 2).type == "S", f"Expected S, got {gs.board.get_piece_at(3,2)}"


def t_supplier_no_backward():
    b = bare_board()
    b.set_piece_at(5, 3, Supplier("white", (5, 3)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(5, 3), to_pos=(4, 4)))
    assert not ok


def t_supplier_capture_forward():
    b = bare_board()
    b.set_piece_at(5, 3, Supplier("white", (5, 3)))
    b.set_piece_at(6, 3, Pawn("black", (6, 3)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(5, 3), to_pos=(6, 3)))
    assert ok
    assert gs.board.get_piece_at(6, 3).color == "white"


def t_supplier_no_diagonal_capture():
    b = bare_board()
    b.set_piece_at(5, 3, Supplier("white", (5, 3)))
    b.set_piece_at(6, 4, Pawn("black", (6, 4)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(5, 3), to_pos=(6, 4)))
    assert not ok


def t_supplier_promotion():
    b = bare_board()
    b.set_piece_at(8, 0, Supplier("white", (8, 0)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(8, 0), to_pos=(9, 1), promotion="N"))
    assert ok
    assert gs.board.get_piece_at(9, 1).type == "N"


# ── Castling ──────────────────────────────────────────────────────────────────

def t_castling_kingside():
    gs = GameState()
    gs.board.set_piece_at(0, 5, None)
    gs.board.set_piece_at(0, 6, None)
    ok = gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 6)))
    assert ok
    assert gs.board.get_piece_at(0, 6).type == "K"
    assert gs.board.get_piece_at(0, 5).type == "R"
    assert gs.board.get_piece_at(0, 7) is None


def t_castling_queenside():
    gs = GameState()
    gs.board.set_piece_at(0, 1, None)
    gs.board.set_piece_at(0, 2, None)
    gs.board.set_piece_at(0, 3, None)
    ok = gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 2)))
    assert ok
    assert gs.board.get_piece_at(0, 2).type == "K"
    assert gs.board.get_piece_at(0, 3).type == "R"


def t_castling_rights_revoked():
    gs = GameState()
    gs.board.set_piece_at(0, 5, None)
    gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 5)))
    assert not gs.castling_rights["white_king_side"]
    assert not gs.castling_rights["white_queen_side"]


def t_castling_blocked():
    gs = GameState()
    ok = gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 6)))
    assert not ok


def t_castling_not_through_check():
    b = bare_board()
    b.set_piece_at(0, 4, King("white", (0, 4)))
    b.set_piece_at(0, 7, Rook("white", (0, 7)))
    b.set_piece_at(5, 5, Rook("black", (5, 5)))  # attacks f1
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 6)))
    assert not ok


# ── Check ─────────────────────────────────────────────────────────────────────

def t_check_by_rook():
    b = bare_board()
    b.set_piece_at(5, 4, Rook("black", (5, 4)))
    gs = GameState(board=b)
    assert gs.is_in_check("white")


def t_check_by_pawn():
    b = bare_board()
    b.set_piece_at(1, 5, Pawn("black", (1, 5)))
    gs = GameState(board=b)
    assert gs.is_in_check("white")


def t_check_by_supplier():
    b = bare_board()
    b.set_piece_at(1, 4, Supplier("black", (1, 4)))
    gs = GameState(board=b)
    assert gs.is_in_check("white")


def t_move_into_check_rejected():
    b = bare_board()
    b.set_piece_at(5, 3, Rook("black", (5, 3)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(0, 4), to_pos=(0, 3)))
    assert not ok


def t_pin_prevents_move():
    b = bare_board()
    b.set_piece_at(0, 3, Rook("white", (0, 3)))
    b.set_piece_at(5, 4, Rook("black", (5, 4)))
    gs = GameState(board=b)
    ok = gs.apply_move(Move(from_pos=(0, 3), to_pos=(0, 2)))
    assert not ok


# ── Checkmate ─────────────────────────────────────────────────────────────────

def t_checkmate():
    # Black king at a10 (9,0), white rook at h10 (9,7) gives check along rank 10.
    # Queen at b8 (7,1) covers a9 and b9 and b10.
    # White king at c8 (7,2) defends the queen.
    b = Board()
    b.set_piece_at(9, 0, King("black", (9, 0)))   # a10
    b.set_piece_at(7, 2, King("white", (7, 2)))   # c8
    b.set_piece_at(7, 1, Queen("white", (7, 1)))  # b8 — defended by king
    b.set_piece_at(9, 7, Rook("white", (9, 7)))   # h10
    gs = GameState(board=b)
    gs.turn = "black"
    assert gs.is_in_check("black"), "Black should be in check"
    legal = gs.get_legal_moves()
    assert len(legal) == 0, f"Should have no legal moves, got: {legal}"
    assert gs.is_checkmate("black")


# ── Stalemate ─────────────────────────────────────────────────────────────────

def t_stalemate():
    b = Board()
    b.set_piece_at(9, 0, King("black", (9, 0)))
    b.set_piece_at(0, 7, King("white", (0, 7)))
    b.set_piece_at(7, 1, Queen("white", (7, 1)))
    b.set_piece_at(8, 2, Rook("white", (8, 2)))
    gs = GameState(board=b)
    gs.turn = "black"
    assert not gs.is_in_check("black")
    assert gs.is_stalemate("black")


# ── Draw ──────────────────────────────────────────────────────────────────────

def t_50_move_rule():
    gs = GameState()
    gs.halfmove_clock = 100
    gs._check_game_over()
    assert gs.game_over
    assert gs.result == "draw_50"


def t_insufficient_material():
    b = bare_board()
    gs = GameState(board=b)
    assert gs._is_insufficient_material()


def t_sufficient_material():
    b = bare_board()
    b.set_piece_at(5, 0, Pawn("white", (5, 0)))
    gs = GameState(board=b)
    assert not gs._is_insufficient_material()


# ── Serialisation ─────────────────────────────────────────────────────────────

def t_serialisation():
    gs = GameState()
    gs.apply_move(Move(from_pos=(1, 0), to_pos=(3, 0)))
    d = gs.to_dict()
    gs2 = GameState.from_dict(d)
    assert gs2.turn == gs.turn
    assert gs2.board.get_piece_at(3, 0).type == "P"
    assert len(gs2.move_history) == 1


# ── Run all ───────────────────────────────────────────────────────────────────

print("\n=== SHAXMAT+ Engine Tests ===\n")

run("Initial board setup", t_initial_board)
run("Initial legal moves = 17", t_initial_legal_moves)
run("Pawn single step", t_pawn_single_step)
run("Pawn double step + EP target", t_pawn_double_step)
run("Pawn double step blocked by supplier", t_pawn_double_step_blocked_by_supplier)
run("Pawn promotion to queen", t_pawn_promotion)
run("Pawn auto-queen on promotion", t_pawn_auto_queen)
run("En passant", t_en_passant)
run("Supplier diagonal move", t_supplier_diagonal)
run("Supplier cannot move backward", t_supplier_no_backward)
run("Supplier capture straight forward", t_supplier_capture_forward)
run("Supplier cannot capture diagonally", t_supplier_no_diagonal_capture)
run("Supplier promotion", t_supplier_promotion)
run("Castling kingside", t_castling_kingside)
run("Castling queenside", t_castling_queenside)
run("Castling rights revoked on king move", t_castling_rights_revoked)
run("Castling blocked by piece", t_castling_blocked)
run("Castling not through check", t_castling_not_through_check)
run("Check by rook", t_check_by_rook)
run("Check by pawn", t_check_by_pawn)
run("Check by supplier", t_check_by_supplier)
run("Move into check rejected", t_move_into_check_rejected)
run("Pin prevents move", t_pin_prevents_move)
run("Checkmate detection", t_checkmate)
run("Stalemate detection", t_stalemate)
run("50-move rule draw", t_50_move_rule)
run("Insufficient material (KK)", t_insufficient_material)
run("Sufficient material (K+P vs K)", t_sufficient_material)
run("Serialisation round-trip", t_serialisation)

print(f"\n{'='*30}")
print(f"Results: {tests_passed} passed, {tests_failed} failed")
if tests_failed:
    sys.exit(1)
