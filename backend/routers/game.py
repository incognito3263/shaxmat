"""Game API routes."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Game, Move as MoveModel, User
from schemas import CreateGameRequest, CreateGameResponse, MoveRequest, GameResponse
from game_service import (
    create_new_game,
    get_or_create_game_state,
    put_game_state,
    square_to_pos,
    pos_to_square,
)
from engine import Move
from engine.ai import get_best_move
from websocket_manager import manager

router = APIRouter(prefix="/game", tags=["game"])


@router.post("/create", response_model=CreateGameResponse)
def create_game(req: CreateGameRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: create_game request: {req.dict()}")
    white_id = None
    black_id = None
    
    # If creator ID is provided, set them as white
    if req.creator_public_id:
        creator = db.query(User).filter(User.public_id == req.creator_public_id).first()
        if creator:
            white_id = creator.id
            print(f"DEBUG: Identified creator as white_id: {white_id}")
        else:
            print(f"DEBUG: Creator public_id {req.creator_public_id} not found in DB")

    # For Person mode, let's find the opponent
    if req.game_mode == "Person" and req.opponent_public_id:
        opp = db.query(User).filter(User.public_id == req.opponent_public_id).first()
        if not opp:
            print(f"DEBUG: Opponent public_id {req.opponent_public_id} not found")
            raise HTTPException(404, "Opponent not found")
        black_id = opp.id
        print(f"DEBUG: Identified opponent as black_id: {black_id}")

    gs, game_id = create_new_game(
        game_mode=req.game_mode,
        white_player_id=white_id,
        black_player_id=black_id,
        time_limit=req.time_limit,
        time_increment=req.time_increment or 0,
        ai_difficulty=req.ai_difficulty
    )
    put_game_state(game_id, gs)
    return CreateGameResponse(
        id=game_id, 
        status="active", 
        turn="white",
        game_mode=req.game_mode,
        ai_difficulty=req.ai_difficulty
    )


@router.get("/user/{user_id}/history")
def get_user_game_history(user_id: int, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    games = db.query(Game).filter(
        or_(Game.white_player_id == user_id, Game.black_player_id == user_id)
    ).order_by(Game.created_at.desc()).all()
    
    results = []
    for g in games:
        w_u = db.query(User).filter(User.id == g.white_player_id).first()
        b_u = db.query(User).filter(User.id == g.black_player_id).first()
        results.append({
            "id": g.id,
            "status": g.status,
            "winner": g.winner,
            "game_mode": g.game_mode,
            "white": w_u.username if w_u else "AI",
            "black": b_u.username if b_u else "AI",
            "white_avatar": w_u.avatar if w_u else "🤖",
            "black_avatar": b_u.avatar if b_u else "🤖",
            "date": g.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.get("/live")
def get_live_games(db: Session = Depends(get_db)):
    # Get active PvP games updated in the last 5 minutes
    from datetime import timedelta
    five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
    
    games = db.query(Game).filter(
        Game.status == "active",
        Game.game_mode == "Person",
        Game.updated_at >= five_mins_ago
    ).order_by(Game.updated_at.desc()).all()
    
    results = []
    for g in games:
        w_u = db.query(User).filter(User.id == g.white_player_id).first()
        b_u = db.query(User).filter(User.id == g.black_player_id).first()
        results.append({
            "game_id": g.id,
            "white": w_u.username if w_u else "Unknown",
            "black": b_u.username if b_u else "Unknown",
            "white_avatar": w_u.avatar if w_u else "👨‍🚀",
            "black_avatar": b_u.avatar if b_u else "👨‍🚀",
            "move_count": len(g.moves)
        })
    return results


@router.get("/{game_id}", response_model=GameResponse)
def get_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")
    
    gs = get_or_create_game_state(game_id, game)
    if gs is None:
        raise HTTPException(500, "Could not load game state")

    d = gs.to_dict()
    board = d["board"]

    # Build legal moves map { "e2": ["e3","e4"], ... }
    legal_map: dict[str, list[str]] = {}
    if not gs.game_over:
        for (fr, fc), (tr, tc) in gs.get_legal_moves():
            sq = pos_to_square(fr, fc)
            tgt = pos_to_square(tr, tc)
            legal_map.setdefault(sq, []).append(tgt)

    # Fetch player public IDs and avatars
    white_public_id = None
    black_public_id = None
    white_avatar = None
    black_avatar = None
    if game.white_player_id:
        w_u = db.query(User).filter(User.id == game.white_player_id).first()
        if w_u: 
            white_public_id = w_u.public_id
            white_avatar = w_u.avatar
    if game.black_player_id:
        b_u = db.query(User).filter(User.id == game.black_player_id).first()
        if b_u: 
            black_public_id = b_u.public_id
            black_avatar = b_u.avatar

    # Calculate evaluation
    from engine.ai import evaluate_board
    eval_score = evaluate_board(gs) / 100.0 # Convert centipawns to pawns

    # Calculate live clocks
    w_time = game.white_time_left
    b_time = game.black_time_left
    if game.status == "active":
        elapsed = int((datetime.utcnow() - game.last_move_at).total_seconds())
        if gs.turn == "white":
            w_time = max(0, w_time - elapsed)
        else:
            b_time = max(0, b_time - elapsed)
        
        # Check for flag fall (timeout)
        if w_time <= 0 or b_time <= 0:
            game.winner = "black" if w_time <= 0 else "white"
            gs.game_over = True
            gs.result = "timeout"
            gs.winner = game.winner
            put_game_state(game_id, gs)
            # Refresh to get latest state including stats_updated
            db.refresh(game)

    return GameResponse(
        id=game_id,
        game_mode=game.game_mode,
        status=d.get("result") or game.status or "active",
        turn=d["turn"],
        winner=d.get("winner") or game.winner,
        board=board,
        move_history=d.get("move_history", []),
        halfmove_clock=d.get("halfmove_clock", 0),
        fullmove_number=d.get("fullmove_number", 1),
        legal_moves=legal_map,
        in_check=gs.is_in_check(gs.turn),
        white_time_left=w_time,
        black_time_left=b_time,
        time_increment=game.time_increment or 0,
        white_player_id=game.white_player_id,
        black_player_id=game.black_player_id,
        white_player_public_id=white_public_id,
        black_player_public_id=black_public_id,
        white_avatar=white_avatar,
        black_avatar=black_avatar,
        ai_difficulty=game.ai_difficulty,
        evaluation=eval_score,
        captured_pieces=d.get("captured_pieces"),
        last_move=d.get("last_move")
    )


@router.post("/{game_id}/move")
async def make_move(game_id: int, req: MoveRequest, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    gs = get_or_create_game_state(game_id, game)
    if gs is None:
        raise HTTPException(500, "Could not load game state")
    if gs.game_over or game.status != "active":
        raise HTTPException(400, "Game is already over")

    from_pos = square_to_pos(req.from_square)
    to_pos = square_to_pos(req.to_square)
    move = Move(from_pos=from_pos, to_pos=to_pos, promotion=req.promotion)

    if not gs.apply_move(move):
        print(f"DEBUG: Illegal move attempted: {move.to_algebraic()}")
        raise HTTPException(400, "Illegal move")

    # This handles time subtraction and persistence
    put_game_state(game_id, gs)
    
    # CRITICAL: Refresh the game object to get updated status and player IDs
    db.refresh(game)

    # Persist move record
    m = MoveModel(
        game_id=game_id,
        move_number=len(gs.move_history),
        algebraic=move.to_algebraic(),
        from_row=from_pos[0],
        from_col=from_pos[1],
        to_row=to_pos[0],
        to_col=to_pos[1],
        promotion=req.promotion,
    )
    db.add(m)

    db.commit()

    # REAL-TIME UPDATE: Notify the opponent
    if game.game_mode == "Person":
        try:
            import json
            
            # Identify who to notify: the opponent of the player who just moved
            target_user_id = None
            if gs.turn == "black": # White just moved, notify black
                target_user_id = game.black_player_id
            else: # Black just moved, notify white
                target_user_id = game.white_player_id
            
            if target_user_id:
                opp_user = db.query(User).filter(User.id == target_user_id).first()
                if opp_user and opp_user.public_id:
                    print(f"DEBUG: Notifying opponent {opp_user.public_id} of move in game {game_id}")
                    await manager.send_personal_message(
                        json.dumps({"type": "move_made", "game_id": game_id}),
                        opp_user.public_id
                    )
            
            # Also notify spectators
            await manager.broadcast_to_game(
                game_id,
                json.dumps({"type": "move_made", "game_id": game_id}),
                exclude_id=None # Optionally exclude the person who just moved
            )
        except Exception as e:
            print(f"DEBUG: Notification error: {e}")

    return {
        "success": True,
        "move": move.to_algebraic(),
        "turn": gs.turn,
        "game_over": gs.game_over,
        "result": gs.result,
        "winner": gs.winner,
        "in_check": gs.is_in_check(gs.turn),
    }


@router.post("/{game_id}/ai-move")
def ai_move(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    gs = get_or_create_game_state(game_id, game)
    if gs is None:
        raise HTTPException(500, "Could not load game state")
    if gs.game_over or game.status != "active":
        raise HTTPException(400, "Game is already over")

    # Determine depth based on difficulty
    depth = 2
    if game.ai_difficulty == "easy":
        depth = 1
    elif game.ai_difficulty == "normal":
        depth = 2
    elif game.ai_difficulty == "hard":
        depth = 3

    move = get_best_move(gs, depth=depth)
    if not move:
        raise HTTPException(400, "No legal moves available for AI")

    if not gs.apply_move(move):
        raise HTTPException(500, "AI generated an illegal move")

    put_game_state(game_id, gs)
    db.refresh(game)

    # Persist move record
    m = MoveModel(
        game_id=game_id,
        move_number=len(gs.move_history),
        algebraic=move.to_algebraic(),
        from_row=move.from_pos[0],
        from_col=move.from_pos[1],
        to_row=move.to_pos[0],
        to_col=move.to_pos[1],
        promotion=move.promotion,
    )
    db.add(m)
    db.commit()

    return {
        "success": True,
        "move": move.to_algebraic(),
        "turn": gs.turn,
        "game_over": gs.game_over,
        "result": gs.result,
        "winner": gs.winner,
        "in_check": gs.is_in_check(gs.turn),
    }



@router.post("/{game_id}/resign")
async def resign_game(game_id: int, user_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")
    
    if game.status != "active":
        return {"success": True}

    # Determine winner
    winner = "black" if user_id == game.white_player_id else "white"
    
    # Update stats using helper via put_game_state
    gs = get_or_create_game_state(game_id, game)
    if gs:
        gs.game_over = True
        gs.result = "resigned"
        gs.winner = winner
        put_game_state(game_id, gs)
    else:
        # Fallback if gs not found
        game.status = "resigned"
        game.winner = winner
        db.commit()

    # Notify opponent
    if game.game_mode == "Person":
        try:
            import json
            resigned_user = db.query(User).filter(User.id == user_id).first()
            resigned_name = resigned_user.username if resigned_user else "Opponent"

            # Notify through manager
            await manager.broadcast_to_game(
                game_id,
                json.dumps({
                    "type": "opponent_resigned", 
                    "game_id": game_id,
                    "winner": winner,
                    "from_username": resigned_name
                })
            )
        except Exception as e:
            print(f"DEBUG: Resign notification error: {e}")

    return {"success": True, "winner": winner}


@router.post("/{game_id}/draw")
async def set_draw(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game: raise HTTPException(404, "Game not found")
    
    if game.status != "active":
        return {"success": True}

    # Update stats using helper via put_game_state
    gs = get_or_create_game_state(game_id, game)
    if gs:
        gs.game_over = True
        gs.result = "draw_agreement"
        put_game_state(game_id, gs)
    else:
        game.status = "draw_agreement"
        db.commit()
    
    # Notify all involved
    try:
        import json
        await manager.broadcast_to_game(
            game_id,
            json.dumps({"type": "draw_respond", "game_id": game_id, "accepted": True})
        )
    except:
        pass

    return {"success": True}


@router.get("/{game_id}/review/{move_index}")
def review_game(game_id: int, move_index: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")
        
    # Reconstruct game state up to move_index
    from engine.game_state import GameState
    from engine.move import Move
    from engine.ai import evaluate_board
    import copy

    gs = GameState() # Starts at initial
    # We need the full history of moves. The easiest way is to apply them sequentially.
    # We have algebraic moves in db.
    db_moves = db.query(MoveModel).filter(MoveModel.game_id == game_id).order_by(MoveModel.move_number).all()
    
    # We only apply up to move_index
    for i in range(min(move_index, len(db_moves))):
        m = db_moves[i]
        # Create engine Move object
        engine_move = Move(
            from_pos=(m.from_row, m.from_col),
            to_pos=(m.to_row, m.to_col),
            promotion=m.promotion
        )
        gs.apply_move(engine_move)

    eval_score = evaluate_board(gs) / 100.0

    return {
        "board": gs.board.to_dict(),
        "turn": gs.turn,
        "captured_pieces": gs.captured_pieces,
        "last_move": gs.last_move,
        "evaluation": eval_score
    }

@router.get("/{game_id}/history")
def get_history(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")
    return {
        "moves": [
            {"move_number": m.move_number, "algebraic": m.algebraic}
            for m in game.moves
        ]
    }
