import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'

export default function MoveHistory() {
  const { game, t, setNotification } = useGameStore()
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [game?.move_history?.length])
  if (!game) return null
  const moves = game.move_history ?? []
  const pairs: [string?, string?][] = []
  for (let i = 0; i < (moves.length); i += 2) pairs.push([moves[i], moves[i + 1]])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl ring-1 ring-white/5">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#81b64c]" />
          <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{t.history}</h3>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(moves.join(' ')); setNotification({ text: "PGN copied!", type: 'success' }) }} className="text-[9px] font-black text-[#81b64c] uppercase border border-[#81b64c]/30 px-3 py-1.5 rounded-lg hover:bg-[#81b64c]/10 transition-all active:scale-95 shadow-sm">{t.copyPGN}</button>
      </div>
      
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1">
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-20">
            <div className="text-4xl mb-4">📜</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">{t.noMovesYet}</p>
          </div>
        ) : (
          pairs.map(([w, b], idx) => (
            <div key={idx} className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${idx % 2 === 0 ? 'bg-[var(--surface-2)]/40' : 'hover:bg-[var(--surface-2)]/20'}`}>
              <span className="w-8 text-right opacity-30 font-mono text-[10px] font-bold text-[var(--text-main)]">{(idx + 1)}.</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="flex-1 px-2 font-black text-sm text-[var(--text-main)]">{w}</span>
                <span className="flex-1 px-2 font-black text-sm text-[#81b64c]">{b ?? '...'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-[var(--surface-2)] border-t border-[var(--border)] flex justify-between items-center opacity-40">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t.totalMoves}</span>
        <span className="text-[10px] font-black text-[var(--text-main)]">{moves.length}</span>
      </div>
    </div>
  )
}
