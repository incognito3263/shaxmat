import random
from typing import Tuple, Optional
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

def evaluate_board(gs: GameState) -> int:
    if gs.game_over:
        if gs.result == 'checkmate':
            return -100000 if gs.winner == 'black' else 100000
        return 0

    score = 0
    for r in range(gs.board.BOARD_ROWS):
        for c in range(gs.board.BOARD_COLS):
            piece = gs.board.get_piece_at(r, c)
            if piece:
                val = PIECE_VALUES.get(piece.type, 0)
                # Add a small bonus for position (centrality)
                # For simplicity, just piece values for now
                if piece.color == 'white':
                    score += val
                else:
                    score -= val
    
    return score

def minimax(gs: GameState, depth: int, alpha: int, beta: int, is_maximizing: bool) -> int:
    if depth == 0 or gs.game_over:
        return evaluate_board(gs)

    legal_moves = gs.get_legal_moves()
    if not legal_moves:
        return evaluate_board(gs)

    if is_maximizing:
        max_eval = -float('inf')
        for from_pos, to_pos in legal_moves:
            move = Move(from_pos=from_pos, to_pos=to_pos)
            # Use a faster way to simulate if possible, but GameState._simulate is okay for depth 2-3
            sim_gs = gs._simulate(move)
            eval = minimax(sim_gs, depth - 1, alpha, beta, False)
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for from_pos, to_pos in legal_moves:
            move = Move(from_pos=from_pos, to_pos=to_pos)
            sim_gs = gs._simulate(move)
            eval = minimax(sim_gs, depth - 1, alpha, beta, True)
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval

def get_best_move(gs: GameState, depth: int = 2) -> Optional[Move]:
    legal_moves = gs.get_legal_moves()
    if not legal_moves:
        return None

    best_move = None
    is_maximizing = (gs.turn == 'white')
    
    if is_maximizing:
        best_val = -float('inf')
        # Shuffle to avoid deterministic behavior for equal moves
        random.shuffle(legal_moves)
        for from_pos, to_pos in legal_moves:
            move = Move(from_pos=from_pos, to_pos=to_pos)
            sim_gs = gs._simulate(move)
            val = minimax(sim_gs, depth - 1, -float('inf'), float('inf'), False)
            if val > best_val:
                best_val = val
                best_move = move
    else:
        best_val = float('inf')
        random.shuffle(legal_moves)
        for from_pos, to_pos in legal_moves:
            move = Move(from_pos=from_pos, to_pos=to_pos)
            sim_gs = gs._simulate(move)
            val = minimax(sim_gs, depth - 1, -float('inf'), float('inf'), True)
            if val < best_val:
                best_val = val
                best_move = move

    return best_move
