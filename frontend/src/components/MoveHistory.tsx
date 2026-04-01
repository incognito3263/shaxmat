import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'

export default function MoveHistory() {
  const { game, t, setNotification } = useGameStore()
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [game?.move_history?.length])
  if (!game) return null
  const moves = game.move_history ?? []
  const pairs: [string?, string?][] = []
  for (let i = 0; i < moves.length; i += 2) pairs.push([moves[i], moves[i + 1]])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t.history}</h3>
        <button onClick={() => { navigator.clipboard.writeText(moves.join(' ')); setNotification({ text: "PGN copied!", type: 'success' }) }} className="text-[8px] font-bold text-[var(--accent-cyan)] uppercase border border-[var(--accent-cyan)]/30 px-2 py-1 rounded hover:bg-[var(--accent-cyan)]/5 transition-all">PGN</button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {pairs.length === 0 ? <p className="text-[10px] text-[var(--text-muted)] text-center py-8 uppercase opacity-50">No moves</p> : 
          pairs.map(([w, b], idx) => (
            <div key={idx} className={`flex items-center gap-1 py-1 rounded text-[11px] ${idx % 2 === 0 ? 'bg-[var(--bg)]/50' : ''}`}>
              <span className="w-6 text-right opacity-30 font-mono text-[9px]">{idx + 1}.</span>
              <span className="flex-1 px-2 font-bold text-[var(--accent-white)]">{w}</span>
              <span className="flex-1 px-2 font-bold text-[var(--accent-cyan)]">{b ?? ''}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
