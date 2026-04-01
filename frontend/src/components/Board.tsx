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
  default: { light: 'var(--board-light)', dark: 'var(--board-dark)' },
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
    <div className="w-1 h-full bg-[var(--surface-2)] rounded-full overflow-hidden flex flex-col-reverse relative mr-4">
      <motion.div className="w-full bg-[var(--accent-cyan)]" animate={{ height: `${percentage}%` }} transition={{ type: "spring", stiffness: 50, damping: 20 }} />
    </div>
  )
}

export default function Board() {
  const { game, selectedSquare, legalMoves, user, boardTheme, reviewMode, reviewBoardData, viewMode } = useGameStore()
  if (!game || !game.board) return <div className="h-96 flex items-center justify-center opacity-50 uppercase text-[10px] font-bold tracking-widest">Loading...</div>
  if (viewMode === '3d') return <Board3D />

  const activeBoard = (reviewMode && reviewBoardData) ? reviewBoardData.board : game.board;
  const activeTurn = (reviewMode && reviewBoardData) ? reviewBoardData.turn : game.turn;
  const activeLastMove = (reviewMode && reviewBoardData) ? (reviewBoardData.last_move || game.last_move) : game.last_move;
  const inCheck = reviewMode ? false : game.in_check;
  const kingSquare = inCheck ? findKingSquare(activeBoard, activeTurn) : null
  const isFlipped = game.game_mode === 'Person' && user?.id === game.black_player_id
  const displayRows = isFlipped ? [...ROWS].reverse() : ROWS
  const displayCols = isFlipped ? [...COLS].reverse() : COLS

  return (
    <div className="flex items-stretch aspect-[8/10] w-full max-w-[600px] relative">
      <EvalBar />
      <div className="relative flex-1 bg-[var(--board-dark)] rounded-sm border border-[var(--border)] overflow-visible">
        {/* Row Labels */}
        <div className="absolute -left-6 top-0 h-full flex flex-col pointer-events-none">
          {displayRows.map(r => <div key={r} className="flex-1 flex items-center justify-center text-[9px] font-bold opacity-30">{r}</div>)}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-8 grid-rows-10 h-full w-full overflow-hidden">
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
              return <Square key={square} square={square} light={light} isSelected={isSelected} isLegal={isLegal} isCapture={isCapture} isKingInCheck={isKingInCheck} isLastMove={isLastMove} piece={piece} theme={THEMES[boardTheme] || THEMES.default} />
            })
          )}
        </div>
        {/* Col Labels */}
        <div className="absolute -bottom-6 left-0 w-full flex pointer-events-none">
          {displayCols.map(c => <div key={c} className="flex-1 text-center text-[9px] font-bold opacity-30 uppercase">{c}</div>)}
        </div>
      </div>
    </div>
  )
}

function Square({ square, light, isSelected, isLegal, isCapture, isKingInCheck, isLastMove, piece, theme }: any) {
  const isSpectator = useGameStore(s => s.isSpectator)
  const bgColor = light ? theme.light : theme.dark
  return (
    <div className={`relative aspect-square flex items-center justify-center cursor-pointer ${isKingInCheck ? 'check-pulse' : ''}`} style={{ backgroundColor: bgColor }} onClick={() => !isSpectator && useGameStore.getState().selectSquare(square)}>
      {isLastMove && !isSelected && <div className="absolute inset-0 bg-[var(--accent-cyan)]/10 pointer-events-none" />}
      {isSelected && <div className="absolute inset-0 bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/40 z-10 pointer-events-none" />}
      {isLegal && !piece && <div className="w-[20%] h-[20%] rounded-full bg-[var(--accent-cyan)]/30 pointer-events-none z-10" />}
      {isCapture && <div className="absolute inset-0 border-2 border-[var(--accent-cyan)]/30 rounded-full scale-90 pointer-events-none z-10" />}
      {piece && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="w-full h-full flex items-center justify-center p-[6%] z-20">
          <PieceSvg type={piece.type} color={piece.color} size="100%" />
        </motion.div>
      )}
    </div>
  )
}

function findKingSquare(board: any, color: string): string | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r]?.[c]
      if (p && p.type === 'K' && p.color === color) return String.fromCharCode(97 + c) + (r + 1)
    }
  }
  return null
}
