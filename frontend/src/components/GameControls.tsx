import { motion } from 'framer-motion'
import { useGameStore } from '../store'

export default function GameControls() {
  const { game, goBackToMenu, resign, offerDraw, boardTheme, setTheme, t, reviewMode, reviewIndex, setReviewIndex, isSpectator } = useGameStore()

  const themes = [
    { id: 'default', label: t.default },
    { id: 'classic', label: t.classic },
    { id: 'wood', label: t.wood },
    { id: 'forest', label: t.forest },
    { id: 'ocean', label: t.ocean },
    { id: 'midnight', label: t.midnight },
  ]

  const statusText = () => {
    if (!game) return null
    if (reviewMode) {
      return <div className="text-accentCyan text-sm font-bold tracking-wider uppercase text-center">{t.reviewGame} ({reviewIndex}/{game.move_history.length})</div>
    }
    if (game.status === 'checkmate') {
      return (
        <div className="text-center">
          <div className="text-checkRed font-bold text-sm tracking-wider uppercase">{t.checkmate}</div>
          <div className="text-gray-400 text-xs mt-1">
            {game.winner === 'white' ? `⬜ ${t.white}` : `⬛ ${t.black}`}
          </div>
        </div>
      )
    }
    if (game.status === 'resigned') {
      return (
        <div className="text-center">
          <div className="text-checkRed font-bold text-sm tracking-wider uppercase">{t.resigned}</div>
          <div className="text-gray-400 text-xs mt-1">
            {game.winner === 'white' ? `⬜ ${t.white}` : `⬛ ${t.black}`}
          </div>
        </div>
      )
    }
    if (game.status === 'stalemate') {
      return <div className="text-accentCyan text-sm font-bold tracking-wider uppercase text-center">{t.stalemate}</div>
    }
    if (game.status === 'draw_agreement') {
      return <div className="text-accentCyan text-sm font-bold tracking-wider uppercase text-center">{t.draw} (🤝)</div>
    }
    if (game.status?.startsWith('draw')) {
      return (
        <div className="text-center">
          <div className="text-accentCyan text-sm font-bold tracking-wider uppercase">{t.draw}</div>
        </div>
      )
    }
    if (game.in_check) {
      return (
        <div className="text-center">
          <div className="text-checkRed font-bold text-sm tracking-wider uppercase animate-pulse">
            {t.check}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      {game && (
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: '#131820', border: '1px solid #252D3D' }}
        >
          {statusText() || (
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.turn}</div>
              <div
                className="text-sm font-bold tracking-wider"
                style={{ color: game.turn === 'white' ? '#DDE6EF' : '#4DD9E8' }}
              >
                {game.turn === 'white' ? `⬜ ${t.white}` : `⬛ ${t.black}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Move counter */}
      {game && !reviewMode && (
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: '#131820', border: '1px solid #252D3D' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 uppercase tracking-wider">{t.move}</span>
            <span className="text-sm font-mono text-gray-300">{game.fullmove_number}</span>
          </div>
        </div>
      )}

      {/* Review Controls */}
      {reviewMode && game && (
        <div className="flex gap-2">
          <button
            onClick={() => setReviewIndex(reviewIndex - 1)}
            disabled={reviewIndex <= 0}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← {t.prevMove}
          </button>
          <button
            onClick={() => setReviewIndex(reviewIndex + 1)}
            disabled={reviewIndex >= game.move_history.length}
            className="flex-1 py-3 rounded-xl bg-accentCyan text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {t.nextMove} →
          </button>
        </div>
      )}

      {/* New game button */}
      <div className="flex flex-col gap-2">
        {!isSpectator && game?.game_mode === 'Person' && game.status === 'active' && (
          <motion.button
            onClick={offerDraw}
            className="w-full py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #252D3D',
              color: '#94A3B8',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.06)' }}
          >
            🤝 {t.offerDraw}
          </motion.button>
        )}

        {!isSpectator && game?.game_mode === 'AI' && (
          <div
            className="w-full py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase text-center flex items-center justify-center gap-2"
            style={{
              background: 'rgba(77,217,232,0.05)',
              border: '1px solid rgba(77,217,232,0.2)',
              color: '#4DD9E8',
            }}
          >
            🤖 AI ENGINE ACTIVE
          </div>
        )}
        
        <motion.button
          onClick={() => {
            if (!isSpectator && game?.game_mode === 'Person' && game.status === 'active') {
              if (confirm(t.exitGame + '?')) resign()
            } else {
              goBackToMenu()
            }
          }}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #252D3D',
            color: '#DDE6EF',
          }}
          whileHover={{ background: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.97 }}
        >
          {t.exitGame}
        </motion.button>
      </div>

      {/* Theme Selector */}
      <div className="rounded-xl px-4 py-3" style={{ background: '#131820', border: '1px solid #252D3D' }}>
        <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">{t.theme}</div>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(th => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`py-1.5 rounded-lg text-[9px] font-bold transition-all border ${boardTheme === th.id ? 'bg-accentCyan/10 border-accentCyan text-accentCyan' : 'border-[#252D3D] text-gray-500 hover:border-gray-700'}`}
            >
              {th.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="rounded-xl px-4 py-3 space-y-2"
        style={{ background: '#131820', border: '1px solid #252D3D' }}
      >
        <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">{t.legend}</div>
        <LegendItem color="rgba(245,197,24,0.6)" label={t.selected} />
        <LegendItem color="rgba(59,158,255,0.65)" label={t.legalMove} circle />
        <LegendItem color="rgba(59,158,255,0.7)" label={t.capture} ring />
        <LegendItem color="rgba(255,59,59,0.7)" label={t.check} />
      </div>
    </div>
  )
}

function LegendItem({
  color, label, circle, ring
}: {
  color: string; label: string; circle?: boolean; ring?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="shrink-0"
        style={{
          width: 16,
          height: 16,
          borderRadius: circle ? '50%' : ring ? 0 : 3,
          background: ring ? 'transparent' : color,
          border: ring ? `2px solid ${color}` : 'none',
        }}
      />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
