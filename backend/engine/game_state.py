"""SHAXMAT+ GameState — rule-complete, no UI/DB imports."""
from __future__ import annotations

from collections import Counter
from copy import deepcopy
from typing import Dict, List, Optional, Tuple

from .board import Board, create_initial_board
from .move import Move
from .zobrist import Zobrist

_ZOBRIST = Zobrist()

# Promotion rows (row indices)
WHITE_PROMO_ROW = 9   # rank 10
BLACK_PROMO_ROW = 0   # rank 1


class GameState:
    """
    Self-contained game state.  apply_move() mutates in place and returns True
    on success, False if the move is illegal.
    """

    def __init__(self, board: Optional[Board] = None):
        self.board: Board = board if board is not None else create_initial_board()
        self.turn: str = "white"
        self.castling_rights: Dict[str, bool] = {
            "white_king_side": True,
            "white_queen_side": True,
            "black_king_side": True,
            "black_queen_side": True,
        }
        self.en_passant_target: Optional[Tuple[int, int]] = None
        self.halfmove_clock: int = 0
        self.fullmove_number: int = 1
        self.move_history: List[str] = []
        self.position_history: List[int] = []
        self.game_over: bool = False
        self.result: Optional[str] = None   # 'checkmate','stalemate','draw_50','draw_repetition','draw_insufficient'
        self.winner: Optional[str] = None
        self.captured_pieces: Dict[str, List[str]] = {"white": [], "black": []}
        self.last_move: Optional[Dict] = None
        
        # Cache king positions for speed
        self._king_pos = {"white": None, "black": None}
        self._update_king_cache()

        # Record initial position
        self.position_history.append(_ZOBRIST.hash(self))

    def _update_king_cache(self):
        # We look manually here, then use it elsewhere
        for r in range(self.board.BOARD_ROWS):
            for c in range(self.board.BOARD_COLS):
                p = self.board.get_piece_at(r, c)
                if p and p.type == 'K':
                    self._king_pos[p.color] = (r, c)

    # ── Convenience properties ────────────────────────────────────────────────
    @property
    def active_color(self) -> str:
        return self.turn

    @property
    def white_kingside(self) -> bool:
        return self.castling_rights["white_king_side"]

    @property
    def white_queenside(self) -> bool:
        return self.castling_rights["white_queen_side"]

    @property
    def black_kingside(self) -> bool:
        return self.castling_rights["black_king_side"]

    @property
    def black_queenside(self) -> bool:
        return self.castling_rights["black_queen_side"]

    # ── King position ─────────────────────────────────────────────────────────
    def get_king_position(self, color: str) -> Optional[Tuple[int, int]]:
        # Use cache if available
        if hasattr(self, '_king_pos') and self._king_pos.get(color):
            return self._king_pos[color]

        for r in range(self.board.BOARD_ROWS):
            for c in range(self.board.BOARD_COLS):
                p = self.board.get_piece_at(r, c)
                if p and p.type == 'K' and p.color == color:
                    return (r, c)
        return None

    # ── Attack detection ──────────────────────────────────────────────────────
    def is_square_attacked_by(self, row: int, col: int, attacker_color: str) -> bool:
        """Checks if a square (row, col) is attacked by any piece of attacker_color."""
        board = self.board
        opp = attacker_color
        
        # 1. Pawns & Suppliers
        # If attacker is white, they come from row-1 (moving forward to row+1)
        # If attacker is black, they come from row+1 (moving forward to row-1)
        pawn_dir = -1 if opp == 'white' else 1
        
        # Attacking pawns (diagonal capture)
        for dc in [-1, 1]:
            r_p, c_p = row + pawn_dir, col + dc
            if board.is_valid_position(r_p, c_p):
                p = board.get_piece_at(r_p, c_p)
                if p and p.type == 'P' and p.color == opp:
                    return True
        
        # Attacking suppliers (straight forward capture)
        r_s, c_s = row + pawn_dir, col
        if board.is_valid_position(r_s, c_s):
            p = board.get_piece_at(r_s, c_s)
            if p and p.type == 'S' and p.color == opp:
                return True

        # 2. Knights
        for dr, dc in [(2,1),(2,-1),(-2,1),(-2,-1),(1,2),(1,-2),(-1,2),(-1,-2)]:
            r_n, c_n = row + dr, col + dc
            if board.is_valid_position(r_n, c_n):
                p = board.get_piece_at(r_n, c_n)
                if p and p.type == 'N' and p.color == opp:
                    return True

        # 3. King (adjacent squares)
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0: continue
                r_k, c_k = row + dr, col + dc
                if board.is_valid_position(r_k, c_k):
                    p = board.get_piece_at(r_k, c_k)
                    if p and p.type == 'K' and p.color == opp:
                        return True

        # 4. Sliders (Rook, Bishop, Queen)
        # Orthogonal (Rook, Queen)
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            r, c = row + dr, col + dc
            while board.is_valid_position(r, c):
                p = board.get_piece_at(r, c)
                if p:
                    # If we hit a piece, it blocks the slider unless it's the King we're checking for
                    # Actually, for "is attacked", any piece blocks the attack to squares BEHIND it.
                    if p.color == opp and p.type in ('R', 'Q'):
                        return True
                    # If the piece at (r,c) is NOT the target square itself, it blocks
                    break
                r += dr
                c += dc
        
        # Diagonal (Bishop, Queen)
        for dr, dc in [(1,1),(1,-1),(-1,1),(-1,-1)]:
            r, c = row + dr, col + dc
            while board.is_valid_position(r, c):
                p = board.get_piece_at(r, c)
                if p:
                    if p.color == opp and p.type in ('B', 'Q'):
                        return True
                    break
                r += dr
                c += dc

        return False

    def is_in_check(self, color: str) -> bool:
        kp = self.get_king_position(color)
        if kp is None:
            return False
        opp = 'black' if color == 'white' else 'white'
        return self.is_square_attacked_by(kp[0], kp[1], opp)

    # ── Legal move generation ─────────────────────────────────────────────────
    def get_legal_moves(self) -> List[Tuple[Tuple[int, int], Tuple[int, int]]]:
        """Return list of ((from_row,from_col),(to_row,to_col)) for active player."""
        moves: List[Tuple[Tuple[int, int], Tuple[int, int]]] = []
        color = self.turn
        board = self.board

        for piece in board.get_all_pieces(color):
            fr, fc = piece.position
            for tr, tc in piece.get_valid_moves(board):
                m = Move(from_pos=(fr, fc), to_pos=(tr, tc))
                if self._is_legal(m):
                    moves.append(((fr, fc), (tr, tc)))

            # En passant
            if piece.type == 'P' and self.en_passant_target:
                epr, epc = self.en_passant_target
                d = 1 if color == 'white' else -1
                if fr + d == epr and abs(fc - epc) == 1:
                    m = Move(from_pos=(fr, fc), to_pos=(epr, epc), is_en_passant=True)
                    if self._is_legal(m):
                        moves.append(((fr, fc), (epr, epc)))

            # Castling
            if piece.type == 'K' and not piece.has_moved:
                for side, end_col, rook_col, pass_cols in self._castling_candidates(color):
                    m = Move(from_pos=(fr, fc), to_pos=(fr, end_col),
                             is_castling=True, castling_side=side)
                    if self._is_legal_castling(m, pass_cols, rook_col):
                        moves.append(((fr, fc), (fr, end_col)))

        return moves

    def _castling_candidates(self, color: str):
        """Yield (side, king_end_col, rook_col, [pass_cols]) for potential castles."""
        row = 0 if color == 'white' else 9
        king = self.board.get_piece_at(row, 4)
        if not king or king.type != 'K' or king.has_moved:
            return
        # Kingside
        if self.castling_rights[f"{color}_king_side"]:
            rook = self.board.get_piece_at(row, 7)
            if rook and rook.type == 'R' and not rook.has_moved:
                if (self.board.is_empty(row, 5) and self.board.is_empty(row, 6)):
                    yield ('kingside', 6, 7, [5, 6])
        # Queenside
        if self.castling_rights[f"{color}_queen_side"]:
            rook = self.board.get_piece_at(row, 0)
            if rook and rook.type == 'R' and not rook.has_moved:
                if (self.board.is_empty(row, 1) and
                        self.board.is_empty(row, 2) and
                        self.board.is_empty(row, 3)):
                    yield ('queenside', 2, 0, [2, 3])

    def _is_legal_castling(self, move: Move, pass_cols: List[int], rook_col: int) -> bool:
        color = self.turn
        row = move.from_pos[0]
        opp = 'black' if color == 'white' else 'white'
        # King must not be in check
        if self.is_in_check(color):
            return False
        # King must not pass through or land on attacked square
        for col in pass_cols:
            if self.is_square_attacked_by(row, col, opp):
                return False
        return True

    def _is_legal(self, move: Move) -> bool:
        """Optimized: check legality without cloning the entire state."""
        board = self.board
        fr, fc = move.from_pos
        tr, tc = move.to_pos
        piece = board.get_piece_at(fr, fc)
        if not piece: return False
        
        color = piece.color
        target_piece = board.get_piece_at(tr, tc)
        
        # 1. Temporarily make the move
        orig_king_pos = self._king_pos[color]
        board._grid[tr][tc] = piece
        board._grid[fr][fc] = None
        if piece.type == 'K':
            self._king_pos[color] = (tr, tc)
            
        # Special case: en passant capture
        ep_captured_pawn = None
        if move.is_en_passant:
            d = 1 if color == 'white' else -1
            ep_captured_pawn = board.get_piece_at(tr - d, tc)
            board._grid[tr - d][tc] = None

        # 2. Check if king is safe
        in_check = self.is_in_check(color)
        
        # 3. Undo the move
        board._grid[fr][fc] = piece
        board._grid[tr][tc] = target_piece
        self._king_pos[color] = orig_king_pos
        if move.is_en_passant:
            d = 1 if color == 'white' else -1
            board._grid[tr - d][tc] = ep_captured_pawn
            
        return not in_check

    def copy(self) -> 'GameState':
        """Manual shallow-copy of GameState for performance."""
        sim = GameState.__new__(GameState)
        sim.board = self.board.copy()
        sim.turn = self.turn
        sim.castling_rights = self.castling_rights.copy()
        sim.en_passant_target = self.en_passant_target
        sim.halfmove_clock = self.halfmove_clock
        sim.fullmove_number = self.fullmove_number
        sim.move_history = self.move_history.copy()
        sim.position_history = self.position_history.copy()
        sim.game_over = self.game_over
        sim.result = self.result
        sim.winner = self.winner
        sim.captured_pieces = {
            "white": self.captured_pieces["white"].copy(),
            "black": self.captured_pieces["black"].copy()
        }
        sim.last_move = self.last_move
        sim._king_pos = self._king_pos.copy()
        return sim

    def _simulate(self, move: Move) -> 'GameState':
        """Apply move on a copied state and return it (no legality check)."""
        sim = self.copy()
        sim._apply_unchecked(move)
        return sim

    # ── Move application ──────────────────────────────────────────────────────
    def apply_move(self, move: Move) -> bool:
        """
        Validate and apply move.  Returns True on success, False if illegal.
        Mutates self in place.
        """
        if self.game_over:
            return False

        fr, fc = move.from_pos
        tr, tc = move.to_pos
        piece = self.board.get_piece_at(fr, fc)

        if piece is None or piece.color != self.turn:
            return False

        # Determine move type if not already set
        move = self._classify_move(move, piece)
        if move is None:
            return False

        # Legality check (king safety)
        if not self._is_legal(move):
            return False

        # For castling, additional pass-through check
        if move.is_castling:
            pass_cols = [5, 6] if move.castling_side == 'kingside' else [2, 3]
            if not self._is_legal_castling(move, pass_cols, 0):
                return False

        self._apply_unchecked(move)
        self.move_history.append(move.to_algebraic())
        self.position_history.append(_ZOBRIST.hash(self))
        self._check_game_over()
        return True

    def _classify_move(self, move: Move, piece) -> Optional[Move]:
        """
        Validate the move is pseudo-legal and fill in flags.
        Returns None if the move is not pseudo-legal.
        """
        fr, fc = move.from_pos
        tr, tc = move.to_pos

        # En passant
        if (piece.type == 'P' and
                self.en_passant_target == (tr, tc) and
                abs(fc - tc) == 1):
            return Move(from_pos=(fr, fc), to_pos=(tr, tc),
                        promotion=move.promotion, is_en_passant=True)

        # Castling
        if piece.type == 'K' and not piece.has_moved and abs(tc - fc) == 2:
            side = 'kingside' if tc > fc else 'queenside'
            # Verify the path is clear and rook is in place
            row = fr
            if side == 'kingside':
                rook = self.board.get_piece_at(row, 7)
                if not rook or rook.type != 'R' or rook.has_moved:
                    return None
                if not (self.board.is_empty(row, 5) and self.board.is_empty(row, 6)):
                    return None
                if not self.castling_rights[f"{piece.color}_king_side"]:
                    return None
            else:
                rook = self.board.get_piece_at(row, 0)
                if not rook or rook.type != 'R' or rook.has_moved:
                    return None
                if not (self.board.is_empty(row, 1) and
                        self.board.is_empty(row, 2) and
                        self.board.is_empty(row, 3)):
                    return None
                if not self.castling_rights[f"{piece.color}_queen_side"]:
                    return None
            return Move(from_pos=(fr, fc), to_pos=(tr, tc),
                        is_castling=True, castling_side=side)

        # Normal / promotion
        pseudo = piece.get_valid_moves(self.board)
        if (tr, tc) not in pseudo:
            return None

        # Promotion check
        promo = move.promotion
        if piece.type in ('P', 'S'):
            promo_row = WHITE_PROMO_ROW if piece.color == 'white' else BLACK_PROMO_ROW
            if tr == promo_row:
                if not promo or promo.upper() not in ('Q', 'R', 'B', 'N'):
                    promo = 'Q'  # auto-queen if not specified

        return Move(from_pos=(fr, fc), to_pos=(tr, tc),
                    promotion=promo,
                    is_castling=move.is_castling,
                    castling_side=move.castling_side,
                    is_en_passant=move.is_en_passant)

    def _apply_unchecked(self, move: Move):
        """Apply move without any legality checks. Used for simulation."""
        from .pieces import Queen, Rook, Bishop, Knight

        board = self.board
        fr, fc = move.from_pos
        tr, tc = move.to_pos
        piece = board.get_piece_at(fr, fc)

        if piece is None:
            return

        color = piece.color
        captured = board.get_piece_at(tr, tc)

        # Track captured piece
        if captured:
            self.captured_pieces[color].append(captured.type)
        elif move.is_en_passant:
            self.captured_pieces[color].append('P')

        # Reset half-move clock
        if piece.type in ('P', 'S') or captured is not None:
            self.halfmove_clock = 0
        else:
            self.halfmove_clock += 1

        # Move piece
        board.set_piece_at(tr, tc, piece)
        board.set_piece_at(fr, fc, None)
        piece.has_moved = True
        
        # Update king cache if king moved
        if piece.type == 'K':
            self._king_pos[color] = (tr, tc)

        # En passant capture
        if move.is_en_passant:
            d = 1 if color == 'white' else -1
            board.set_piece_at(tr - d, tc, None)
            self.halfmove_clock = 0

        # Castling: move rook
        if move.is_castling:
            row = fr
            if move.castling_side == 'kingside':
                rook = board.get_piece_at(row, 7)
                if rook:
                    board.set_piece_at(row, 5, rook)
                    board.set_piece_at(row, 7, None)
                    rook.has_moved = True
            else:
                rook = board.get_piece_at(row, 0)
                if rook:
                    board.set_piece_at(row, 3, rook)
                    board.set_piece_at(row, 0, None)
                    rook.has_moved = True

        # Promotion
        if move.promotion and piece.type in ('P', 'S'):
            _map = {'Q': Queen, 'R': Rook, 'B': Bishop, 'N': Knight}
            cls = _map.get(move.promotion.upper(), Queen)
            new_piece = cls(color, (tr, tc))
            new_piece.has_moved = True
            board.set_piece_at(tr, tc, new_piece)

        # Update castling rights
        if piece.type == 'K':
            self.castling_rights[f"{color}_king_side"] = False
            self.castling_rights[f"{color}_queen_side"] = False
        elif piece.type == 'R':
            if color == 'white':
                if fr == 0 and fc == 7:
                    self.castling_rights["white_king_side"] = False
                elif fr == 0 and fc == 0:
                    self.castling_rights["white_queen_side"] = False
            else:
                if fr == 9 and fc == 7:
                    self.castling_rights["black_king_side"] = False
                elif fr == 9 and fc == 0:
                    self.castling_rights["black_queen_side"] = False

        # If a rook is captured on its starting square, revoke rights
        if captured and captured.type == 'R':
            if captured.color == 'white':
                if (tr, tc) == (0, 7):
                    self.castling_rights["white_king_side"] = False
                elif (tr, tc) == (0, 0):
                    self.castling_rights["white_queen_side"] = False
            else:
                if (tr, tc) == (9, 7):
                    self.castling_rights["black_king_side"] = False
                elif (tr, tc) == (9, 0):
                    self.castling_rights["black_queen_side"] = False

        # Update en passant target
        if piece.type == 'P' and abs(tr - fr) == 2:
            self.en_passant_target = (fr + (tr - fr) // 2, fc)
        else:
            self.en_passant_target = None

        # Advance full-move counter
        if color == 'black':
            self.fullmove_number += 1

        # Switch turn
        self.turn = 'black' if color == 'white' else 'white'
        self.last_move = {
            "from": [fr, fc],
            "to": [tr, tc]
        }

    # ── Game-over detection ───────────────────────────────────────────────────
    def _check_game_over(self):
        color = self.turn  # the player who must move next

        # 50-move rule
        if self.halfmove_clock >= 100:
            self.game_over = True
            self.result = 'draw_50'
            return

        # Threefold repetition
        if self.position_history:
            cnt = Counter(self.position_history)
            if cnt[self.position_history[-1]] >= 3:
                self.game_over = True
                self.result = 'draw_repetition'
                return

        # Insufficient material
        if self._is_insufficient_material():
            self.game_over = True
            self.result = 'draw_insufficient'
            return

        # Checkmate / stalemate
        has_moves = len(self.get_legal_moves()) > 0
        if not has_moves:
            if self.is_in_check(color):
                self.game_over = True
                self.result = 'checkmate'
                opp = 'black' if color == 'white' else 'white'
                self.winner = opp
            else:
                self.game_over = True
                self.result = 'stalemate'

    def _is_insufficient_material(self) -> bool:
        white = [p for p in self.board.get_all_pieces('white') if p.type != 'K']
        black = [p for p in self.board.get_all_pieces('black') if p.type != 'K']
        # Any pawn, supplier, rook, queen → sufficient
        for p in white + black:
            if p.type in ('P', 'S', 'R', 'Q'):
                return False
        # K vs K
        if not white and not black:
            return True
        # K+minor vs K
        if (len(white) == 1 and white[0].type in ('B', 'N') and not black):
            return True
        if (len(black) == 1 and black[0].type in ('B', 'N') and not white):
            return True
        # K+B vs K+B same colour squares
        if (len(white) == 1 and white[0].type == 'B' and
                len(black) == 1 and black[0].type == 'B'):
            wp = white[0].position
            bp = black[0].position
            if (wp[0] + wp[1]) % 2 == (bp[0] + bp[1]) % 2:
                return True
        return False

    # ── Serialisation ─────────────────────────────────────────────────────────
    def to_dict(self) -> dict:
        return {
            "board": self.board.to_dict(),
            "turn": self.turn,
            "castling_rights": dict(self.castling_rights),
            "en_passant_target": list(self.en_passant_target) if self.en_passant_target else None,
            "halfmove_clock": self.halfmove_clock,
            "fullmove_number": self.fullmove_number,
            "move_history": list(self.move_history),
            "position_history": list(self.position_history),
            "game_over": self.game_over,
            "result": self.result,
            "winner": self.winner,
            "captured_pieces": self.captured_pieces,
            "last_move": self.last_move,
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'GameState':
        gs = cls.__new__(cls)
        gs.board = Board.from_dict(data["board"])
        gs.turn = data.get("turn", "white")
        gs.castling_rights = dict(data.get("castling_rights", {
            "white_king_side": True, "white_queen_side": True,
            "black_king_side": True, "black_queen_side": True,
        }))
        ep = data.get("en_passant_target")
        gs.en_passant_target = tuple(ep) if ep else None
        gs.halfmove_clock = data.get("halfmove_clock", 0)
        gs.fullmove_number = data.get("fullmove_number", 1)
        gs.move_history = list(data.get("move_history", []))
        gs.position_history = list(data.get("position_history", []))
        gs.game_over = data.get("game_over", False)
        gs.result = data.get("result")
        gs.winner = data.get("winner")
        gs.captured_pieces = data.get("captured_pieces", {"white": [], "black": []})
        gs.last_move = data.get("last_move")
        
        # Re-init king position cache
        gs._king_pos = {"white": None, "black": None}
        gs._update_king_cache()
        return gs

    # ── Check / checkmate helpers (used by API) ───────────────────────────────
    def is_check(self, color: str) -> bool:
        return self.is_in_check(color)

    def is_checkmate(self, color: str) -> bool:
        return self.is_in_check(color) and len(self.get_legal_moves()) == 0

    def is_stalemate(self, color: str) -> bool:
        return not self.is_in_check(color) and len(self.get_legal_moves()) == 0
