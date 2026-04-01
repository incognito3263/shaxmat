import { useGameStore } from '../../store'

type PlayOpponentCardProps = {
  opponentId: string
  onOpponentIdChange: (id: string) => void
  onInviteById: () => void | Promise<void>
}

export function PlayOpponentCard({ opponentId, onOpponentIdChange, onInviteById }: PlayOpponentCardProps) {
  const { t } = useGameStore()

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-3)] p-6 shadow-inner">
      <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-[var(--text-main)]">👤 {t.multiplayer}</h3>
      <p className="mb-4 text-xs leading-relaxed text-[var(--text-muted)]">{t.enterID}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={opponentId}
          onChange={(e) => onOpponentIdChange(e.target.value.replace(/\D/g, ''))}
          placeholder={t.opponentID}
          className="min-h-[48px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 text-center font-mono text-[var(--text-main)] outline-none transition-colors focus:border-[var(--accent-green)] sm:text-lg"
          aria-label={t.enterID}
        />
        <button type="button" onClick={() => void onInviteById()} className="btn-primary shrink-0 rounded-lg px-6 py-3 text-sm font-black sm:min-w-[5.5rem]">
          {t.go}
        </button>
      </div>
    </div>
  )
}
