import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'

export default function MoveHistory() {
  const { game, t, setNotification } = useGameStore()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [game?.move_history?.length])

  if (!game) return null

  const moves = game.move_history ?? []
  const pairs: [string?, string?][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]])
  }

  const copyPGN = () => {
    if (!game) return
    const pgn = moves.join(' ')
    navigator.clipboard.writeText(pgn)
    setNotification({ text: "PGN copied to clipboard!", type: 'success' })
  }

  return (
    <div
      className="rounded-xl flex flex-col"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        height: '100%',
        minHeight: 200,
        maxHeight: 520,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          {t.history}
        </h3>
        <div className="flex items-center gap-3">
          {moves.length > 0 && (
            <button 
              onClick={copyPGN}
              className="text-[10px] font-black text-accentCyan hover:brightness-110 uppercase tracking-widest border border-accentCyan/30 px-2 py-1 rounded-md bg-accentCyan/5 transition-all"
            >
              Export PGN
            </button>
          )}
          <span className="text-xs text-gray-600 font-mono">
            {moves.length > 0 ? `${Math.ceil(moves.length / 2)} ${t.move.toLowerCase()}s` : '—'}
          </span>
        </div>
      </div>

      {/* Moves list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-sm scroll-smooth">
        {pairs.length === 0 ? (
          <p className="text-gray-700 text-xs text-center py-6">No moves yet</p>
        ) : (
          pairs.map(([w, b], idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 py-0.5 rounded"
              style={{
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}
            >
              <span className="w-7 text-right text-gray-600 text-xs shrink-0">
                {idx + 1}.
              </span>
              <span
                className="flex-1 px-2 py-0.5 rounded text-xs"
                style={{
                  color: w ? 'var(--accent-white)' : 'var(--text-muted)',
                  background: w ? 'rgba(221,230,239,0.06)' : 'transparent',
                }}
              >
                {w ?? '—'}
              </span>
              <span
                className="flex-1 px-2 py-0.5 rounded text-xs"
                style={{
                  color: b ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  background: b ? 'rgba(77,217,232,0.06)' : 'transparent',
                }}
              >
                {b ?? '—'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
