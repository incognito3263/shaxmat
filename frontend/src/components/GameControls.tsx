import { useGameStore } from '../store'

export default function GameControls() {
  const { game, goBackToMenu, resign, offerDraw, boardTheme, setTheme, t, reviewMode, reviewIndex, setReviewIndex, isSpectator } = useGameStore()
  const themes = [ { id: 'default', label: t.default }, { id: 'classic', label: t.classic }, { id: 'wood', label: t.wood }, { id: 'forest', label: t.forest }, { id: 'ocean', label: t.ocean }, { id: 'midnight', label: t.midnight } ]

  const Status = () => {
    if (!game) return null
    if (reviewMode) return <div className="text-[var(--accent-cyan)] text-[10px] font-bold uppercase tracking-widest text-center">Reviewing ({reviewIndex}/{game.move_history.length})</div>
    const color = game.turn === 'white' ? 'var(--accent-white)' : 'var(--accent-cyan)'
    const label = game.turn === 'white' ? t.white : t.black
    return (
      <div className="text-center">
        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t.turn}</div>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 shadow-sm"><Status /></div>
      
      {reviewMode && game && (
        <div className="flex gap-2">
          <button onClick={() => setReviewIndex(reviewIndex - 1)} disabled={reviewIndex <= 0} className="flex-1 py-2 rounded-md bg-[var(--surface-2)] text-[var(--text-main)] border border-[var(--border)] font-bold text-[9px] uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-30 transition-all">Prev</button>
          <button onClick={() => setReviewIndex(reviewIndex + 1)} disabled={reviewIndex >= game.move_history.length} className="flex-1 py-2 rounded-md bg-[var(--accent-cyan)] text-black font-bold text-[9px] uppercase tracking-widest hover:brightness-105 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!isSpectator && game?.game_mode === 'Person' && game.status === 'active' && (
          <button onClick={offerDraw} className="w-full py-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-[10px] uppercase tracking-widest transition-all">🤝 {t.offerDraw}</button>
        )}
        <button onClick={() => { if (!isSpectator && game?.game_mode === 'Person' && game.status === 'active') { if (confirm(t.exitGame + '?')) resign() } else { goBackToMenu() } }} className="w-full py-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-main)] font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-all">{t.exitGame}</button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 space-y-6 shadow-sm">
        <div className="space-y-3">
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest text-center">{t.theme}</div>
          <div className="grid grid-cols-3 gap-1">
            {themes.map(th => (
              <button key={th.id} onClick={() => setTheme(th.id)} className={`py-1.5 rounded text-[8px] font-bold transition-all ${boardTheme === th.id ? 'bg-[var(--accent-cyan)] text-black' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'}`}>{th.label.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest text-center">{t.sounds}</div>
          <div className="grid grid-cols-2 gap-2">
            {(['move', 'capture', 'check', 'end'] as const).map(s => {
              const { setSoundSettings } = useGameStore.getState(); const isActive = useGameStore(state => state.soundSettings[s]);
              return ( <button key={s} onClick={() => setSoundSettings({ [s]: !isActive })} className={`py-1.5 rounded text-[8px] font-bold border transition-all ${isActive ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{s.toUpperCase()}</button> )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
