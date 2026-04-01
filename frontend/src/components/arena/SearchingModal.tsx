import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store'
import { Avatar } from '../Avatar'
import { CountryFlag } from '../game/CountryFlag'

const MATCH_TIME_PRESETS: { label: string; seconds: number; increment: number }[] = [
  { label: '1m', seconds: 60, increment: 0 },
  { label: '3m', seconds: 180, increment: 0 },
  { label: '5m', seconds: 300, increment: 0 },
  { label: '10m', seconds: 600, increment: 0 },
]

function MatchVsRow({
  selfAvatar,
  selfName,
  selfCountryCode,
  opponentAvatar,
  opponentName,
  opponentCountryCode,
}: {
  selfAvatar: string
  selfName: string
  selfCountryCode?: string | null
  opponentAvatar: string
  opponentName: string
  opponentCountryCode?: string | null
}) {
  return (
    <div className="flex items-center justify-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-8 shadow-inner sm:gap-10 sm:py-10 md:gap-14">
      <div className="flex min-w-0 max-w-[40%] flex-col items-center gap-2">
        <Avatar src={selfAvatar} size="sm" />
        <div className="flex max-w-full items-center justify-center gap-1.5">
          <span className="truncate text-center text-xs font-bold text-[var(--text-main)] sm:text-sm">{selfName}</span>
          <CountryFlag code={selfCountryCode} />
        </div>
      </div>
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="shrink-0 text-3xl font-black text-[var(--accent-green)] drop-shadow-[0_0_12px_rgba(129,182,76,0.5)] sm:text-5xl"
      >
        VS
      </motion.span>
      <div className="flex min-w-0 max-w-[40%] flex-col items-center gap-2">
        <Avatar src={opponentAvatar} size="sm" />
        <div className="flex max-w-full items-center justify-center gap-1.5">
          <span className="truncate text-center text-xs font-bold text-[var(--text-main)] sm:text-sm">{opponentName}</span>
          <CountryFlag code={opponentCountryCode} />
        </div>
      </div>
    </div>
  )
}

export function SearchingModal() {
  const {
    isSearching,
    cancelMatchmaking,
    matchedOpponent,
    matchOffer,
    sendMatchStart,
    acceptMatchOffer,
    user,
    t,
  } = useGameStore()
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)

  if (!isSearching) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[var(--accent-green)]/20 bg-[var(--surface)] p-8 text-center shadow-[0_60px_180px_rgba(0,0,0,1)] sm:p-12 sm:rounded-[3rem]"
      >
        {!matchedOpponent ? (
          <>
            <div className="relative mx-auto mb-10 h-28 w-28 sm:mb-12 sm:h-32 sm:w-32">
              <motion.div className="absolute inset-0 rounded-full border-4 border-[var(--accent-green)]/10" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-t-[var(--accent-green)] border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl">🌍</div>
            </div>
            <h2 className="mb-3 text-2xl font-black uppercase tracking-tight text-[var(--text-main)] sm:text-4xl">{t.searching}</h2>
            <p className="mb-6 text-xs font-black uppercase tracking-[0.35em] text-[var(--accent-green)] animate-pulse sm:text-sm sm:tracking-[0.5em]">
              {t.arenaSubtitle}
            </p>
          </>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            <div className="text-xs font-black uppercase tracking-[0.35em] text-[var(--accent-green)] sm:text-sm sm:tracking-[0.5em]">{t.matchFound}</div>
            <MatchVsRow
              selfAvatar={user?.avatar || '👤'}
              selfName={user?.username || t.player}
              selfCountryCode={user?.country_code}
              opponentAvatar={matchedOpponent.avatar}
              opponentName={matchedOpponent.username}
              opponentCountryCode={matchedOpponent.country_code}
            />
            {matchOffer ? (
              <div className="rounded-[2rem] border border-[var(--accent-green)]/20 bg-[var(--accent-green)]/10 p-8 shadow-inner sm:p-10">
                <div className="mb-6 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] sm:text-sm">{t.opponentProposed}</div>
                <div className="mb-8 text-3xl font-black tracking-widest text-[var(--text-main)] sm:text-5xl">
                  {matchOffer.time_limit / 60}
                  {matchOffer.time_increment ? ` + ${matchOffer.time_increment}` : ' min'}
                </div>
                <button type="button" onClick={acceptMatchOffer} className="btn-primary w-full py-5 text-lg shadow-2xl sm:py-6 sm:text-xl">
                  {t.acceptAndStart}
                </button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] opacity-80">{t.timeControl}</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {MATCH_TIME_PRESETS.map((tc) => (
                    <button
                      key={tc.label}
                      type="button"
                      onClick={() => {
                        setTimeLimit(tc.seconds)
                        setTimeIncrement(tc.increment)
                      }}
                      className={`rounded-lg border py-3 text-xs font-black transition-all sm:py-4 sm:text-sm ${
                        timeLimit === tc.seconds && timeIncrement === tc.increment
                          ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-white shadow-xl'
                          : 'border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-muted)]'
                      }`}
                    >
                      {tc.label.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => sendMatchStart(matchedOpponent.public_id, timeLimit, timeIncrement)}
                  className="btn-primary w-full py-5 text-lg shadow-2xl sm:py-6 sm:text-xl"
                >
                  {t.challengeOpponent}
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={cancelMatchmaking}
          className="mt-8 w-full py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40 transition-all hover:text-[var(--text-main)] hover:opacity-100 sm:mt-10"
        >
          {t.cancel}
        </button>
      </motion.div>
    </div>
  )
}
