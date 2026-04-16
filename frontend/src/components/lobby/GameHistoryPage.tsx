import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../store'
import type { Language } from '../../translations'
import { Avatar } from '../Avatar'
import { CountryFlag } from '../game/CountryFlag'

const TABS = ['recent', 'daily', 'live', 'bot', 'coach'] as const
type ApiTab = (typeof TABS)[number]

function localeFor(lang: Language): string {
  if (lang === 'uz') return 'uz-UZ'
  if (lang === 'ru') return 'ru-RU'
  return 'en-US'
}

export function GameHistoryPage() {
  const { t, language, fetchGameHistoryFull, gameHistoryFull } = useGameStore()
  const [apiTab, setApiTab] = useState<ApiTab>('recent')
  const [resultFilter, setResultFilter] = useState<'any' | 'win' | 'loss' | 'draw'>('any')
  const [opponentQ, setOpponentQ] = useState('')
  const [searchOpponent, setSearchOpponent] = useState('')

  const tabParam = useMemo(() => {
    if (apiTab === 'coach') return 'recent'
    return apiTab
  }, [apiTab])

  useEffect(() => {
    void fetchGameHistoryFull({
      tab: tabParam,
      result: resultFilter,
      opponent: searchOpponent,
      limit: 80,
      offset: 0,
    })
  }, [fetchGameHistoryFull, tabParam, resultFilter, searchOpponent])

  const games = gameHistoryFull?.games ?? []
  const count = games.length

  const tabLabel = (k: ApiTab) => {
    if (k === 'recent') return t.ghTabRecent
    if (k === 'daily') return t.ghTabDaily
    if (k === 'live') return t.ghTabLive
    if (k === 'bot') return t.ghTabBot
    return t.ghTabCoach
  }

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString(localeFor(language), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  const accuracyCell = (row: (typeof games)[0], side: 'white' | 'black') => {
    const v = side === 'white' ? row.accuracy_white : row.accuracy_black
    if (v == null) return '—'
    return `${v.toFixed(1)}%`
  }

  return (
    <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-6">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-3">
          <span className="text-lg text-[var(--text-muted)]" aria-hidden>
            📁
          </span>
          <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">
            {t.gameHistoryTitle} ({count})
          </h1>
        </div>

        <div className="mb-4 flex flex-wrap gap-0 border-b border-[var(--border)]">
          {TABS.map((tab) => {
            const active = apiTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setApiTab(tab)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wide ${
                  active
                    ? 'border-b-2 border-[var(--text-main)] text-[var(--text-main)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {tabLabel(tab)}
              </button>
            )
          })}
        </div>

        <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-3 py-3">{t.ghColPlayers}</th>
                <th className="px-3 py-3">{t.ghColResult}</th>
                <th className="px-3 py-3">{t.ghColAccuracy}</th>
                <th className="px-3 py-3">{t.ghColMoves}</th>
                <th className="px-3 py-3">{t.ghColDate}</th>
              </tr>
            </thead>
            <tbody>
              {games.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]">
                    {t.noHistory ?? '—'}
                  </td>
                </tr>
              ) : (
                games.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/40">
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-[var(--text-muted)]" title={row.time_control_label}>
                          ⏱
                        </span>
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar src={row.white.avatar} size="sm" />
                            <div className="min-w-0">
                              <div className="truncate font-bold text-[var(--text-main)]">{row.white.username}</div>
                              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                                <span>{row.white.rating ?? '—'}</span>
                                <CountryFlag code={row.white.country_code} />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar src={row.black.avatar} size="sm" />
                            <div className="min-w-0">
                              <div className="truncate font-bold text-[var(--text-main)]">{row.black.username}</div>
                              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                                <span>{row.black.rating ?? '—'}</span>
                                <CountryFlag code={row.black.country_code} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle font-semibold text-[var(--text-main)]">
                      <span className="inline-flex items-center gap-1">
                        {row.result_symbol}
                        <span className="text-base opacity-60">♟</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 align-middle text-[var(--text-muted)]">
                      <div className="text-xs">{accuracyCell(row, 'white')}</div>
                      <div className="text-xs">{accuracyCell(row, 'black')}</div>
                    </td>
                    <td className="px-3 py-3 align-middle font-mono text-[var(--text-main)]">{row.move_count}</td>
                    <td className="px-3 py-3 align-middle text-[var(--text-muted)]">{fmtDate(row.ended_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-center">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[#81b64c]">
            ^ {t.ghTop}
          </button>
        </div>
      </div>

      <aside className="w-full shrink-0 border border-[var(--border)] bg-[var(--surface-2)] p-4 lg:w-[280px]">
        <div className="mb-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">{t.gameHistoryTitle}</div>
        <ul className="mb-6 space-y-2 text-sm text-[var(--text-muted)]">
          <li className="flex justify-between">
            <span>{t.ghSidebarMyGames}</span>
            <span>→</span>
          </li>
          <li className="flex justify-between">
            <span>{t.ghSidebarExplore}</span>
            <span>→</span>
          </li>
          <li className="flex justify-between">
            <span>{t.ghSidebarDb}</span>
            <span>→</span>
          </li>
          <li className="flex justify-between">
            <span>{t.ghSidebarCollections}</span>
            <span>→</span>
          </li>
          <li className="flex justify-between">
            <span>{t.ghSidebarSaved}</span>
            <span>→</span>
          </li>
        </ul>

        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.ghFilterScope}</label>
          <select className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-[var(--text-main)]" defaultValue="my">
            <option value="my">{t.ghFilterScope}</option>
          </select>

          <label className="block text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.ghFilterRecent}</label>
          <select
            className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-[var(--text-main)]"
            value={apiTab === 'coach' ? 'recent' : apiTab}
            onChange={(e) => setApiTab(e.target.value as ApiTab)}
          >
            <option value="recent">{t.ghTabRecent}</option>
            <option value="daily">{t.ghTabDaily}</option>
            <option value="live">{t.ghTabLive}</option>
            <option value="bot">{t.ghTabBot}</option>
          </select>

          <label className="block text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.ghFilterResult}</label>
          <select
            className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-[var(--text-main)]"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as typeof resultFilter)}
          >
            <option value="any">{t.ghFilterResult}</option>
            <option value="win">{t.ghFilterWin}</option>
            <option value="loss">{t.ghFilterLoss}</option>
            <option value="draw">{t.ghFilterDraw}</option>
          </select>

          <input
            type="text"
            value={opponentQ}
            onChange={(e) => setOpponentQ(e.target.value)}
            placeholder={t.ghOpponentPlaceholder}
            className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSearchOpponent(opponentQ.trim())}
              className="flex-1 bg-[#81b64c] px-3 py-2 text-sm font-bold uppercase tracking-wide text-white hover:brightness-110"
            >
              {t.ghSearch}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpponentQ('')
                setSearchOpponent('')
                setResultFilter('any')
                setApiTab('recent')
              }}
              className="flex-1 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold uppercase tracking-wide text-[var(--text-main)] hover:bg-[var(--surface-2)]"
            >
              {t.ghReset}
            </button>
          </div>

          <button type="button" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]">
            {t.ghAdvanced} ▾
          </button>
        </div>
      </aside>
    </div>
  )
}
