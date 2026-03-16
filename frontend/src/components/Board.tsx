import { motion } from 'framer-motion'
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
    <div className="w-1.5 sm:w-2 h-full bg-[#1E2D40] rounded-full overflow-hidden flex flex-col-reverse border border-white/5 relative mr-2 sm:mr-4">
      <motion.div 
        className="w-full bg-white shadow-[0_0:10px_rgba(255,255,255,0.3)]"
        animate={{ height: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      <div className="absolute inset-0 flex flex-col justify-between items-center py-2 pointer-events-none">
        <span className="text-[7px] sm:text-[8px] font-black text-black mix-blend-difference">
          {(evaluation || 0) > 0 ? `+${(evaluation || 0).toFixed(1)}` : (evaluation || 0).toFixed(1)}
        </span>
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
  const activeLastMove = (reviewMode && reviewBoardData) ? (reviewBoardData.last_move || game.last_move) : game.last_move;
  const inCheck = reviewMode ? false : game.in_check;
  const kingSquare = inCheck ? findKingSquare(activeBoard, activeTurn) : null

  const isFlipped = game.game_mode === 'Person' && user?.id === game.black_player_id
  
  const displayRows = isFlipped ? [...ROWS].reverse() : ROWS
  const displayCols = isFlipped ? [...COLS].reverse() : COLS

  return (
    <div className="flex flex-col items-center gap-2 select-none w-full max-w-4xl mx-auto px-1">
      {/* Board Wrapper */}
      <div className="flex items-stretch w-full aspect-[9/10] sm:aspect-square max-h-[85vh] justify-center relative">
        <EvalBar />
        
        {/* The Grid Container */}
        <div className="relative flex-1 max-w-[min(100%,700px)] aspect-[8/10] sm:aspect-[8/10] bg-[#1E2D40] rounded-sm sm:rounded-md shadow-2xl overflow-visible border border-white/5">
          
          {/* Numbers (Vertical Labels) */}
          <div className="absolute -left-4 sm:-left-7 top-0 h-full flex flex-col pointer-events-none">
            {displayRows.map((row) => (
              <div key={row} className="flex-1 flex items-center justify-center text-[9px] sm:text-xs font-bold text-gray-500">
                {row}
              </div>
            ))}
          </div>

          {/* Main 8x10 Grid */}
          <div className="grid grid-cols-8 grid-rows-10 h-full w-full overflow-hidden rounded-sm sm:rounded-md">
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

          {/* Letters (Horizontal Labels) */}
          <div className="absolute -bottom-5 sm:-bottom-7 left-0 w-full flex pointer-events-none">
            {displayCols.map((c) => (
              <div key={c} className="flex-1 text-center text-[9px] sm:text-xs font-bold text-gray-500">
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
    <div
      className={`relative aspect-square flex items-center justify-center cursor-pointer transition-colors duration-200 ${isKingInCheck ? 'check-pulse' : ''}`}
      style={{ backgroundColor: bgColor }}
      onClick={handleClick}
    >
      {/* Highlights */}
      {isLastMove && !isSelected && (
        <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none" />
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-yellow-400/30 border-2 border-yellow-400/60 z-10 pointer-events-none" />
      )}
      
      {/* Move Hints */}
      {isLegal && !piece && (
        <div className="w-[25%] h-[25%] rounded-full bg-blue-500/40 pointer-events-none z-10" />
      )}
      {isCapture && (
        <div className="absolute inset-0 border-[3px] border-blue-500/40 pointer-events-none z-10" />
      )}

      {/* Piece Render */}
      {piece && (
        <motion.div
          key={`${piece.color}-${piece.type}-${square}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full h-full flex items-center justify-center p-[10%] relative z-20"
        >
          <div className={piece.color === 'white' ? 'glow-white' : 'glow-cyan'} style={{ width: '100%', height: '100%' }}>
            <PieceSvg type={piece.type} color={piece.color} size="100%" />
          </div>
        </motion.div>
      )}
    </div>
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
