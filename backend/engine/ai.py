import random
from typing import Tuple, Optional, List
from .game_state import GameState
from .move import Move

PIECE_VALUES = {
    'P': 100,
    'N': 320,
    'B': 330,
    'R': 500,
    'Q': 900,
    'K': 20000,
    'S': 150,
}

# Simple positional bonus for centralization (10x8 board)
# Center is roughly rows 4-5, cols 3-4
def get_positional_bonus(row: int, col: int) -> int:
    # Reward pieces closer to the center
    dist_row = min(abs(row - 4), abs(row - 5))
    dist_col = min(abs(col - 3), abs(col - 4))
    return (6 - (dist_row + dist_col)) * 2

def evaluate_board(gs: GameState) -> int:
    if gs.game_over:
        if gs.result == 'checkmate':
            return -1000000 if gs.winner == 'black' else 1000000
        return 0

    score = 0
    board = gs.board
    for r in range(board.BOARD_ROWS):
        for c in range(board.BOARD_COLS):
            piece = board.get_piece_at(r, c)
            if piece:
                val = PIECE_VALUES.get(piece.type, 0)
                bonus = get_positional_bonus(r, c)
                if piece.color == 'white':
                    score += (val + bonus)
                else:
                    score -= (val + bonus)
    
    # Bonus for being in check (bad for the one in check)
    if gs.is_in_check('white'): score -= 50
    if gs.is_in_check('black'): score += 50
    
    return score

def score_move(gs: GameState, move: Move) -> int:
    """Score a move for ordering (MVV-LVA inspired)."""
    score = 0
    fr, fc = move.from_pos
    tr, tc = move.to_pos
    
    moving_piece = gs.board.get_piece_at(fr, fc)
    target_piece = gs.board.get_piece_at(tr, tc)
    
    if not moving_piece: return 0

    # 1. Captures (Most Valuable Victim - Least Valuable Attacker)
    if target_piece:
        score += 10 * PIECE_VALUES.get(target_piece.type, 0) - PIECE_VALUES.get(moving_piece.type, 0)
    
    # 2. Promotions
    if move.promotion:
        score += 900
        
    # 3. Give check
    # (Checking this is slow, so maybe skip or do it lightly)
    
    return score

def get_ordered_moves(gs: GameState) -> List[Move]:
    legal_moves_raw = gs.get_legal_moves()
    moves = [Move(from_pos=f, to_pos=t) for f, t in legal_moves_raw]
    
    # Score each move
    move_scores = []
    for m in moves:
        move_scores.append((m, score_move(gs, m)))
    
    # Sort descending by score
    move_scores.sort(key=lambda x: x[1], reverse=True)
    return [x[0] for x in move_scores]

_ZOBRIST = None # Global for lazy init

# Simple Transposition Table (Cache)
# Maps hash -> (eval, depth, alpha, beta)
_TRANSPOSITION_TABLE = {}

def minimax(gs: GameState, depth: int, alpha: int, beta: int, is_maximizing: bool) -> int:
    global _ZOBRIST
    if _ZOBRIST is None:
        from .zobrist import Zobrist
        _ZOBRIST = Zobrist()
        
    pos_hash = _ZOBRIST.hash(gs)
    
    # Check cache
    if pos_hash in _TRANSPOSITION_TABLE:
        entry = _TRANSPOSITION_TABLE[pos_hash]
        if entry['depth'] >= depth:
            return entry['eval']

    if depth == 0 or gs.game_over:
        res = evaluate_board(gs)
        _TRANSPOSITION_TABLE[pos_hash] = {'eval': res, 'depth': depth}
        return res

    # Use ordered moves for much faster pruning
    moves = get_ordered_moves(gs)
    if not moves:
        res = evaluate_board(gs)
        _TRANSPOSITION_TABLE[pos_hash] = {'eval': res, 'depth': depth}
        return res

    if is_maximizing:
        max_eval = -float('inf')
        for move in moves:
            sim_gs = gs._simulate(move)
            eval = minimax(sim_gs, depth - 1, alpha, beta, False)
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        _TRANSPOSITION_TABLE[pos_hash] = {'eval': max_eval, 'depth': depth}
        return max_eval
    else:
        min_eval = float('inf')
        for move in moves:
            sim_gs = gs._simulate(move)
            eval = minimax(sim_gs, depth - 1, alpha, beta, True)
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        _TRANSPOSITION_TABLE[pos_hash] = {'eval': min_eval, 'depth': depth}
        return min_eval

def get_best_move(gs: GameState, depth: int = 2) -> Optional[Move]:
    # Clear cache for a new move search
    _TRANSPOSITION_TABLE.clear()
    
    moves = get_ordered_moves(gs)
    if not moves:
        return None

    best_move = None
    is_maximizing = (gs.turn == 'white')
    
    # If there's only one move, just take it
    if len(moves) == 1:
        return moves[0]

    if is_maximizing:
        best_val = -float('inf')
        alpha = -float('inf')
        beta = float('inf')
        for move in moves:
            sim_gs = gs._simulate(move)
            val = minimax(sim_gs, depth - 1, alpha, beta, False)
            if val > best_val:
                best_val = val
                best_move = move
            alpha = max(alpha, val)
    else:
        best_val = float('inf')
        alpha = -float('inf')
        beta = float('inf')
        for move in moves:
            sim_gs = gs._simulate(move)
            val = minimax(sim_gs, depth - 1, alpha, beta, True)
            if val < best_val:
                best_val = val
                best_move = move
            beta = min(beta, val)

    return best_move
