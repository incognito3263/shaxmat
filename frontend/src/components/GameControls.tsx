import { useGameStore } from '../store'

export default function GameControls() {
  const { game, goBackToMenu, resign, offerDraw, boardTheme, setTheme, uiTheme, setUiTheme, t, reviewMode, reviewIndex, setReviewIndex, isSpectator } = useGameStore()
  const themes = [ { id: 'wood', label: t.wood }, { id: 'forest', label: t.forest }, { id: 'ocean', label: t.ocean }, { id: 'midnight', label: t.midnight } ]
  const isDark = uiTheme === 'dark'

  return (
    <div className="flex shrink-0 flex-col gap-4">
      {/* Top: Theme Switcher (Replaces Turn Status) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 shadow-xl ring-1 ring-white/5 relative h-14 flex items-center transition-colors">
        <div 
          className={`absolute inset-1.5 w-[calc(50%-6px)] bg-[#81b64c] rounded-lg transition-all duration-300 ease-out shadow-[0_0_15px_rgba(129,182,76,0.3)] ${isDark ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`}
        />
        <button 
          onClick={() => setUiTheme('dark')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-colors duration-300 ${isDark ? 'text-white' : 'text-[var(--text-muted)]'}`}
        >
          <span className="text-sm">🌙</span> {t.darkMode?.toUpperCase() || 'DARK'}
        </button>
        <button 
          onClick={() => setUiTheme('light')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-colors duration-300 ${!isDark ? 'text-white' : 'text-[var(--text-muted)]'}`}
        >
          {t.lightMode?.toUpperCase() || 'LIGHT'} <span className="text-sm">☀️</span>
        </button>
      </div>
      
      {reviewMode && game && (
        <div className="flex gap-2 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <button onClick={() => setReviewIndex(reviewIndex - 1)} disabled={reviewIndex <= 0} className="flex-1 py-3 rounded-lg bg-[var(--surface-2)] text-[var(--text-main)] border border-[var(--border)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--surface-3)] disabled:opacity-20 transition-all">← {t.prevMove}</button>
          <button onClick={() => setReviewIndex(reviewIndex + 1)} disabled={reviewIndex >= game.move_history.length} className="flex-1 py-3 rounded-lg bg-[#81b64c] text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 disabled:opacity-20 transition-all">{t.nextMove} →</button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {!isSpectator && game?.game_mode === 'Person' && game.status === 'active' && (
          <button onClick={offerDraw} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-main)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--surface-3)] transition-all shadow-lg active:scale-95">🤝 {t.offerDraw}</button>
        )}
        <button onClick={() => { if (!isSpectator && game?.game_mode === 'Person' && game.status === 'active') { if (confirm(t.exitGame + '?')) resign() } else { goBackToMenu() } }} className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[var(--border)] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${!isSpectator && game?.game_mode === 'Person' && game.status === 'active' ? 'bg-[var(--surface-2)] text-[var(--text-main)] hover:bg-[var(--surface-3)]' : 'bg-[#81b64c] text-white hover:brightness-110 col-span-2'}`}>🚪 {t.exitGame}</button>
      </div>

      {/* Settings Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-6 shadow-xl ring-1 ring-white/5 transition-colors">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-1 rounded-full bg-[#81b64c]" />
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{t.theme}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(th => (
              <button key={th.id} onClick={() => setTheme(th.id)} className={`py-2.5 rounded-lg text-[9px] font-black transition-all border ${boardTheme === th.id ? 'bg-[#81b64c] border-[#81b64c] text-white shadow-lg shadow-[#81b64c]/20' : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>{th.label.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-1 rounded-full bg-[#81b64c]" />
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{t.sounds}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['move', 'capture', 'check', 'end'] as const).map(s => {
              const { setSoundSettings } = useGameStore.getState(); const isActive = useGameStore(state => state.soundSettings[s]);
              return ( 
                <button key={s} onClick={() => setSoundSettings({ [s]: !isActive })} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[9px] font-black border transition-all ${isActive ? 'bg-[#81b64c]/10 border-[#81b64c]/40 text-[#81b64c]' : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]'}`}>
                  {s.toUpperCase()}
                  <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#81b64c] shadow-[0_0_5px_#81b64c]' : 'bg-[var(--border)]'}`} />
                </button> 
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
