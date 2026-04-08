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
  classic: { light: '#ebecd0', dark: '#739552' },
  wood: { light: '#f0d9b5', dark: '#b58863' },
  forest: { light: '#eeeed2', dark: '#769656' }, 
  ocean: { light: '#dee3e6', dark: '#8ca2ad' },
  midnight: { light: '#c3c6be', dark: '#727fa2' },
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
    <div className="hidden sm:flex w-2 md:w-3 shrink-0 self-stretch bg-[#262421] rounded-l-md overflow-hidden flex-col-reverse relative border-y border-l border-[#403d3a]">
      <motion.div className="w-full bg-[#ffffff] shadow-[0_0_10px_rgba(255,255,255,0.8)]" animate={{ height: `${percentage}%` }} transition={{ type: "spring", stiffness: 50, damping: 20 }} />
      <div className="absolute inset-0 flex flex-col justify-between items-center py-2 pointer-events-none">
        <span className="text-[9px] font-black text-black mix-blend-difference">{(evaluation || 0) > 0 ? `+${(evaluation || 0).toFixed(1)}` : (evaluation || 0).toFixed(1)}</span>
      </div>
    </div>
  )
}

export default function Board() {
  const { game, selectedSquare, legalMoves, user, boardTheme, reviewMode, reviewBoardData, viewMode } = useGameStore()
  
  if (viewMode === '3d') return <Board3D />
  
  if (!game || !game.board) return (
    <div className="w-full aspect-[8/10] flex items-center justify-center opacity-50 uppercase text-xs font-bold tracking-widest bg-[#262421] rounded-md border border-[#403d3a]">
      Loading Board...
    </div>
  )

  const activeBoard = (reviewMode && reviewBoardData) ? reviewBoardData.board : game.board;
  const activeTurn = (reviewMode && reviewBoardData) ? reviewBoardData.turn : game.turn;
  const activeLastMove = (reviewMode && reviewBoardData) ? (reviewBoardData.last_move || game.last_move) : game.last_move;
  const inCheck = reviewMode ? false : game.in_check;
  const kingSquare = inCheck ? findKingSquare(activeBoard, activeTurn) : null
  const isFlipped = game.game_mode === 'Person' && user?.id === game.black_player_id
  const displayRows = isFlipped ? [...ROWS].reverse() : ROWS
  const displayCols = isFlipped ? [...COLS].reverse() : COLS

  return (
    <div className="flex h-full w-full flex-col lg:flex-row items-center justify-center gap-1 md:gap-3 p-1 sm:p-2 overflow-hidden">
      <EvalBar />
      <div className="relative w-full max-w-[95vw] sm:max-w-[80vw] lg:max-w-[calc((100vh-120px)*0.85)] max-h-[55vh] lg:max-h-none bg-[#2a2420] rounded-lg overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)] lg:shadow-[0_40px_150px_rgba(0,0,0,1)] aspect-[8/10] flex-shrink-0 flex flex-col">
        <div className="grid grid-cols-8 grid-rows-10 h-full w-full flex-1">
          {displayRows.flatMap((row, rIndex) =>
            displayCols.map((col, cIndex) => {
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
              const isBottomEdge = rIndex === 9
              const isLeftEdge = cIndex === 0

              return (
                <Square 
                  key={square} square={square} light={light} isSelected={isSelected} isLegal={isLegal} 
                  isCapture={isCapture} isKingInCheck={isKingInCheck} isLastMove={isLastMove} piece={piece} 
                  theme={THEMES[boardTheme] || THEMES.classic} col={col} row={row} 
                  showCol={isBottomEdge} showRow={isLeftEdge} 
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function Square({ square, light, isSelected, isLegal, isCapture, isKingInCheck, isLastMove, piece, theme, col, row, showCol, showRow }: any) {
  const isSpectator = useGameStore(s => s.isSpectator)
  const bgColor = light ? theme.light : theme.dark
  const textColor = light ? theme.dark : theme.light

  return (
    <div className={`relative aspect-square flex items-center justify-center cursor-pointer ${isKingInCheck ? 'check-pulse' : ''}`} style={{ backgroundColor: bgColor }} onClick={() => !isSpectator && useGameStore.getState().selectSquare(square)}>
      {showRow && <div className="absolute top-0.5 left-1 text-[10px] font-bold opacity-80" style={{ color: textColor }}>{row}</div>}
      {showCol && <div className="absolute bottom-0 right-1 text-[10px] font-bold opacity-80" style={{ color: textColor }}>{col}</div>}
      {isLastMove && !isSelected && <div className="absolute inset-0 pointer-events-none bg-yellow-500/30" />}
      {isSelected && <div className="absolute inset-0 pointer-events-none bg-yellow-500/50" />}
      {isLegal && !piece && <div className="w-[30%] h-[30%] rounded-full pointer-events-none z-10 bg-black/15" />}
      {isCapture && <div className="absolute inset-0 border-[6px] border-black/15 rounded-full scale-100 pointer-events-none z-10" />}
      {piece && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="w-full h-full flex items-center justify-center p-[2%] z-20">
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
