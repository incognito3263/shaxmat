import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store'
import PieceSvg from './pieces/PieceSvg'
import Board3D from './Board3D'

const COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ROWS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0
}

const THEMES: Record<string, { light: string; dark: string }> = {
  default: { light: '#2E4055', dark: '#1E2D40' },
  classic: { light: '#E8EDF2', dark: '#769656' },
  wood: { light: '#DEAC70', dark: '#8B4513' },
  forest: { light: '#A3D160', dark: '#4B7336' },
  ocean: { light: '#B1E4B9', dark: '#70A2A3' },
  midnight: { light: '#4B5563', dark: '#1F2937' },
}

function EvalBar() {
  const { game, reviewMode, reviewBoardData, isSpectator } = useGameStore()
  if (!game) return null

  const isVisible = game.game_mode === 'AI' || reviewMode || isSpectator
  if (!isVisible) return null

  const evaluation = (reviewMode && reviewBoardData) ? reviewBoardData.evaluation : game.evaluation
  
  const clampedEval = Math.max(-5, Math.min(5, evaluation || 0))
  const percentage = ((clampedEval + 5) / 10) * 100
  
  return (
    <div className="w-2 h-full bg-[#1E2D40] rounded-full overflow-hidden flex flex-col-reverse border border-white/5 relative mr-4">
      <motion.div 
        className="w-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        animate={{ height: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      <div className="absolute inset-0 flex flex-col justify-between items-center py-2 pointer-events-none">
        <span className="text-[8px] font-black text-black mix-blend-difference">{(evaluation || 0) > 0 ? `+${(evaluation || 0).toFixed(1)}` : (evaluation || 0).toFixed(1)}</span>
      </div>
    </div>
  )
}

export default function Board() {
  const { game, selectedSquare, legalMoves, user, boardTheme, reviewMode, reviewBoardData, viewMode } = useGameStore()

  if (!game || !game.board || !Array.isArray(game.board)) {
    return (
      <div className="flex items-center justify-center w-full h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accentCyan border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 tracking-wider">Loading board…</span>
        </div>
      </div>
    )
  }

  if (viewMode === '3d') {
    return <Board3D />
  }

  const activeBoard = (reviewMode && reviewBoardData) ? reviewBoardData.board : game.board;
  const activeTurn = (reviewMode && reviewBoardData) ? reviewBoardData.turn : game.turn;
  const activeLastMove = (reviewMode && reviewBoardData) ? reviewBoardData.last_move : game.last_move;
  const inCheck = reviewMode ? false : game.in_check;
  const kingSquare = inCheck ? findKingSquare(activeBoard, activeTurn) : null

  const isFlipped = game.game_mode === 'Person' && user?.id === game.black_player_id
  
  const displayRows = isFlipped ? [...ROWS].reverse() : ROWS
  const displayCols = isFlipped ? [...COLS].reverse() : COLS

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="flex items-stretch h-[clamp(440px,70vw,640px)]">
        <EvalBar />
        
        <div className="relative" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)' }}>
          <div className="absolute -left-6 top-0 flex flex-col h-full pointer-events-none">
            {displayRows.map((row) => (
              <div key={row} className="flex-1 flex items-center justify-center board-label" style={{ color: '#4A5568' }}>
                {row}
              </div>
            ))}
          </div>

          <div className="grid rounded-lg overflow-hidden" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
            {displayRows.flatMap((row) =>
              displayCols.map((col) => {
                const actualColIdx = COLS.indexOf(col)
                const square = col + row
                const light = isLightSquare(row, actualColIdx)
                const isSelected = !reviewMode && selectedSquare === square
                const isLegal = !reviewMode && (legalMoves || []).includes(square)
                
                const boardRow = activeBoard[row - 1]
                const piece = boardRow ? (boardRow[actualColIdx] ?? null) : null
                const isKingInCheck = square === kingSquare
                const isCapture = isLegal && piece !== null
                
                let isLastMove = false
                if (activeLastMove) {
                  const fromSq = String.fromCharCode(97 + activeLastMove.from[1]) + (activeLastMove.from[0] + 1)
                  const toSq = String.fromCharCode(97 + activeLastMove.to[1]) + (activeLastMove.to[0] + 1)
                  isLastMove = square === fromSq || square === toSq
                }

                return (
                  <Square
                    key={square}
                    square={square}
                    light={light}
                    isSelected={isSelected}
                    isLegal={isLegal}
                    isCapture={isCapture}
                    isKingInCheck={isKingInCheck}
                    isLastMove={isLastMove}
                    piece={piece}
                    theme={THEMES[boardTheme] || THEMES.classic}
                  />
                )
              })
            )}
          </div>

          <div className="flex mt-1">
            {displayCols.map((c) => (
              <div key={c} className="board-label" style={{ width: 'clamp(44px, 7vw, 64px)', textAlign: 'center', color: '#4A5568' }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SquareProps {
  square: string
  light: boolean
  isSelected: boolean
  isLegal: boolean
  isCapture: boolean
  isKingInCheck: boolean
  isLastMove: boolean
  piece: { type: string; color: string } | null
  theme: { light: string; dark: string }
}

function Square({ square, light, isSelected, isLegal, isCapture, isKingInCheck, isLastMove, piece, theme }: SquareProps) {
  const isSpectator = useGameStore(s => s.isSpectator)
  const handleClick = () => {
    if (!isSpectator) {
      useGameStore.getState().selectSquare(square)
    }
  }

  const bgColor = light ? theme.light : theme.dark

  return (
    <motion.div
      className={`sq relative ${isKingInCheck ? 'check-pulse' : ''}`}
      style={{
        width: 'clamp(56px, 8.5vw, 84px)',
        height: 'clamp(56px, 8.5vw, 84px)',
        backgroundColor: bgColor,
        outline: isSelected ? '2px solid #F5C518' : 'none',
        outlineOffset: '-2px',
        zIndex: isSelected ? 2 : 1,
      }}
      onClick={handleClick}
      whileHover={{ filter: 'brightness(1.12)' }}
      transition={{ duration: 0.1 }}
    >
      {isLastMove && !isSelected && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(245,197,24,0.12)' }} />
      )}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(245,197,24,0.18)' }} />
      )}
      {isLegal && !piece && (
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className="rounded-full" style={{ width: '30%', height: '30%', background: 'rgba(59,158,255,0.65)' }} />
        </motion.div>
      )}
      {isCapture && (
        <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: 0, boxShadow: 'inset 0 0 0 3px rgba(59,158,255,0.7)' }} />
      )}
      <AnimatePresence mode="popLayout">
        {piece && (
          <motion.div
            key={`${piece.type}-${piece.color}`}
            layoutId={`${piece.type}-${piece.color}-${piece.type==='P'||piece.type==='S' ? square : ''}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.1 } }}
          >
            <div className={piece.color === 'white' ? 'glow-white' : 'glow-cyan'} style={{ lineHeight: 0 }}>
              <PieceSvg type={piece.type} color={piece.color} size={72} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function findKingSquare(board: ({ type: string; color: string } | null)[][], color: string): string | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r]?.[c]
      if (p && p.type === 'K' && p.color === color) {
        return String.fromCharCode(97 + c) + (r + 1)
      }
    }
  }
  return null
}
