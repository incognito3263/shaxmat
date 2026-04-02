import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
import type { Language } from './translations'
import Board from './components/Board'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import PromotionModal from './components/PromotionModal'

// --- Reusable UI Components ---

function Avatar({ src, size = 'sm' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 text-3xl',
    xl: 'w-28 h-28 text-5xl',
  }[size]

  const isImage = src && (src.startsWith('/') || src.startsWith('http'))

  return (
    <div className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] shadow-inner`}>
      {isImage ? <img src={src} alt="avatar" className="h-full w-full object-cover" /> : <span>{src || '👤'}</span>}
    </div>
  )
}

function StatCard({ label, value, colorClass = 'text-[var(--text-main)]' }: { label: string; value: string | number; colorClass?: string }) {
  return (
    <div className="arena-card p-4 text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</div>
      <div className={`mt-1 text-2xl font-black ${colorClass}`}>{value}</div>
    </div>
  )
}

// --- Main Application Sections ---

function Lobby() {
  const [activeTab, setActivePage] = useState<'home' | 'arena' | 'friends' | 'leaderboard'>('home')
  const { user, logout, t, uiTheme, setUiTheme, setLanguage, language, setNotification } = useGameStore()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (!user) return null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)]">
      {/* Sidebar Nav */}
      <aside className="flex w-[var(--lobby-sidebar-w)] flex-col border-r border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-10 flex items-center gap-3">
          <Logo size="md" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none text-[var(--text-main)]">SHAXMAT+</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-green)]">Arena</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'home', label: t.backToMenu, icon: '🏠' },
            { id: 'arena', label: t.quickPlay, icon: '⚔️' },
            { id: 'leaderboard', label: t.leaderboard, icon: '🏆' },
            { id: 'friends', label: t.friends, icon: '👥' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                activeTab === item.id ? 'bg-[var(--accent-green)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <Avatar src={user.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-[var(--text-main)]">{user.username}</div>
              <div className="truncate text-[9px] font-bold uppercase tracking-wider text-[var(--accent-green)]">{getUserTitle(user.wins, t)}</div>
            </div>
            <button onClick={() => setIsEditModalOpen(true)} className="text-xs opacity-40 hover:opacity-100">⚙️</button>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher compact />
            <button
              onClick={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border)]"
            >
              {uiTheme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>

          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
            🚪 {t.logout}
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="custom-scrollbar flex-1 overflow-y-auto p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <LobbyHome user={user} t={t} onPlay={() => setActivePage('arena')} />}
            {activeTab === 'arena' && <ArenaSetup />}
            {activeTab === 'leaderboard' && <LeaderboardSection />}
            {activeTab === 'friends' && <FriendsSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <NotificationToast />
    </div>
  )
}

function LobbyHome({ user, t, onPlay }: { user: any; t: any; onPlay: () => void }) {
  const totalGames = user.wins + user.losses + user.draws
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end">
        <Avatar src={user.avatar} size="xl" />
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-main)] sm:text-5xl">{user.username}</h1>
          <p className="mt-2 text-sm font-medium text-[var(--text-muted)] uppercase tracking-[0.3em]">{getUserTitle(user.wins, t)}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onPlay} className="btn-primary flex items-center gap-3">
              <span className="text-xl">⚔️</span> {t.quickPlay}
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(user.public_id)
                useGameStore.getState().setNotification({ text: t.idCopied, type: 'success' })
              }}
              className="btn-secondary flex items-center gap-3"
            >
              🆔 {user.public_id}
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.winRate} value={`${winRate}%`} colorClass="text-green-500" />
        <StatCard label={t.wins} value={user.wins} colorClass="text-green-500" />
        <StatCard label={t.losses} value={user.losses} colorClass="text-red-500" />
        <StatCard label={t.totalGames} value={totalGames} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <LiveGamesSection />
        <MatchHistorySection />
      </div>
    </div>
  )
}

function ArenaSetup() {
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const { createGame, startMatchmaking, searchUser, sendInvite, user, t, setNotification } = useGameStore()

  const handleInvite = async () => {
    if (opponentId.length !== 8) return
    if (opponentId === user?.public_id) {
      setNotification({ text: t.selfPlayError, type: 'error' })
      return
    }
    const target = await searchUser(opponentId)
    if (target) sendInvite(target.public_id, timeLimit, timeIncrement)
    else setNotification({ text: t.userNotFound, type: 'error' })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="arena-card p-8">
        <h2 className="mb-8 text-xl font-black uppercase tracking-widest text-[var(--text-main)]">⚙️ {t.timeControl}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {[
            { l: '1m', s: 60, i: 0 }, { l: '1+1', s: 60, i: 1 },
            { l: '3m', s: 180, i: 0 }, { l: '3+2', s: 180, i: 2 },
            { l: '5m', s: 300, i: 0 }, { l: '10m', s: 600, i: 0 },
            { l: '30m', s: 1800, i: 0 },
          ].map((tc) => (
            <button
              key={tc.l}
              onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i) }}
              className={`rounded-lg py-3 text-[11px] font-black transition-all border ${
                timeLimit === tc.s && timeIncrement === tc.i
                  ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)] shadow-lg'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-main)]'
              }`}
            >
              {tc.l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="arena-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black uppercase tracking-widest text-sm">🤖 {t.singlePlayer}</h3>
            <div className="flex gap-1">
              {['easy', 'normal', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`rounded px-2 py-1 text-[10px] font-black uppercase transition-all ${
                    difficulty === d ? 'bg-[var(--accent-green)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {(t as any)[d]}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className="btn-primary w-full">
            Start Training
          </button>
        </div>

        <button onClick={startMatchmaking} className="btn-primary flex h-full flex-col items-center justify-center gap-4 text-center">
          <span className="text-4xl">🌍</span>
          <div className="flex flex-col">
            <span className="text-lg">{t.quickPlay}</span>
            <span className="text-[10px] font-medium opacity-80">Find a random opponent</span>
          </div>
        </button>
      </div>

      <div className="arena-card p-8">
        <h3 className="mb-6 font-black uppercase tracking-widest text-sm">👤 {t.multiplayer}</h3>
        <div className="flex gap-3">
          <input
            type="text"
            maxLength={8}
            value={opponentId}
            onChange={e => setOpponentId(e.target.value.replace(/\D/g, ''))}
            placeholder={t.opponentID}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-6 py-4 font-mono text-xl tracking-[0.3em] outline-none focus:border-[var(--accent-green)] transition-all"
          />
          <button onClick={handleInvite} className="btn-primary px-10">
            {t.go}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Specialized Page Components ---

function LeaderboardSection() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || [])

  return (
    <div className="arena-card overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-8 py-6">
        <h3 className="text-lg font-black uppercase tracking-widest">🏆 {t.leaderboard}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[var(--surface-3)] text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            <tr>
              <th className="px-8 py-4 w-20">Rank</th>
              <th className="px-8 py-4">Player</th>
              <th className="px-8 py-4 text-center">Win Rate</th>
              <th className="px-8 py-4 text-center">Wins</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-bold">
            {leaderboard.map((u, index) => {
              const isMe = u.id === user?.id
              const isFollowing = friendIds.has(u.public_id)
              const total = u.wins + u.losses + u.draws
              const rate = total > 0 ? Math.round((u.wins / total) * 100) : 0
              
              return (
                <tr key={u.id} className={`transition-colors hover:bg-[var(--surface-hover)] ${isMe ? 'bg-[var(--accent-green)]/5' : ''}`}>
                  <td className="px-8 py-5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                      index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-orange-500 text-black' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar src={u.avatar} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-black flex items-center gap-2">
                          {u.username}
                          {isMe && <span className="rounded bg-[var(--accent-green)] px-1 py-0.5 text-[8px] uppercase text-white">You</span>}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-green)]">{getUserTitle(u.wins, t)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center font-mono text-green-500">{rate}%</td>
                  <td className="px-8 py-5 text-center font-mono">{u.wins}</td>
                  <td className="px-8 py-5 text-right">
                    {!isMe && !isFollowing && (
                      <button 
                        onClick={() => {
                          sendFriendRequest(u.public_id)
                          setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' })
                        }}
                        className="text-[var(--accent-green)] hover:underline text-xs"
                      >
                        Follow
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FriendsSection() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [])

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="arena-card p-8 h-fit">
        <h3 className="mb-8 text-lg font-black uppercase tracking-widest flex items-center gap-3">👥 {t.friends}</h3>
        
        {pendingRequests?.length > 0 && (
          <div className="mb-8 space-y-3 border-b border-[var(--border)] pb-8">
            <div className="text-[10px] font-black uppercase text-[var(--accent-green)] tracking-widest mb-4">Pending Requests</div>
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between rounded-xl bg-[var(--accent-green)]/5 p-4 border border-[var(--accent-green)]/20">
                <div className="flex items-center gap-3">
                  <Avatar src={req.from_user.avatar} size="sm" />
                  <span className="text-sm font-black">{req.from_user.username}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respondToFriendRequest(req.id, true)} className="rounded-lg bg-[var(--accent-green)] p-2 text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                  <button onClick={() => respondToFriendRequest(req.id, false)} className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-white transition-all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {friends?.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--text-muted)] italic">No friends yet. Follow players from the leaderboard!</div>
          ) : (
            friends?.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl p-4 transition-all hover:bg-[var(--surface-hover)] group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar src={f.avatar} size="sm" />
                    {f.is_online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-green-500 shadow-lg" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black">{f.username}</span>
                    <span className="text-[10px] uppercase font-bold text-[var(--accent-green)]">{getUserTitle(f.wins, t)}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {f.is_online && (
                    <button onClick={() => sendInvite(f.public_id)} className="btn-secondary !py-2 !px-4 text-[10px]">{t.inviteFriend}</button>
                  )}
                  <button onClick={() => unfollowUser(f.public_id)} className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <MatchHistorySection />
    </div>
  )
}

function LiveGamesSection() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [])

  return (
    <div className="arena-card p-8">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> {t.liveGames}
        </h3>
        <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black text-red-500 uppercase">{liveGames?.length || 0} Live</span>
      </div>
      
      <div className="space-y-4">
        {liveGames?.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)] italic">Quiet arena... No matches right now.</div>
        ) : (
          liveGames?.map((g) => (
            <div key={g.game_id} onClick={() => spectateGame(g.game_id)} className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition-all hover:border-[var(--accent-green)] group shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  <Avatar src={g.white_avatar} size="sm" />
                  <Avatar src={g.black_avatar} size="sm" />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-black">{g.white} vs {g.black}</div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{g.move_count} moves • {g.game_mode}</div>
                </div>
              </div>
              <span className="text-xs font-black uppercase text-[var(--accent-green)] opacity-0 group-hover:opacity-100 transition-all">Watch Arena →</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MatchHistorySection() {
  const { matchHistory, fetchMatchHistory, t, user } = useGameStore()
  const [showAll, setShowAll] = useState(false)
  useEffect(() => { fetchMatchHistory() }, [])

  if (!matchHistory || matchHistory.length === 0) return null
  const displayed = showAll ? matchHistory : matchHistory.slice(0, 5)

  return (
    <div className="arena-card p-8">
      <h3 className="mb-8 text-lg font-black uppercase tracking-widest flex items-center gap-3">📜 {t.matchHistory}</h3>
      <div className="space-y-3">
        {displayed.map((m) => {
          const isWhite = m.white === user?.username
          const didIWin = m.winner === (isWhite ? 'white' : 'black')
          const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement'
          
          return (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <Avatar src={m.white_avatar} size="sm" />
                  <Avatar src={m.black_avatar} size="sm" />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs font-black truncate max-w-[120px]">{m.white} vs {m.black}</div>
                  <div className="text-[9px] font-bold text-[var(--text-muted)]">{m.date}</div>
                </div>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-wider ${isDraw ? 'text-[var(--text-muted)]' : didIWin ? 'text-green-500' : 'text-red-500'}`}>
                {isDraw ? t.draw : didIWin ? t.victory : t.defeat}
              </div>
            </div>
          )
        })}
      </div>
      {matchHistory.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} className="mt-6 w-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-green)] hover:underline">
          {showAll ? t.showLess : t.showMore}
        </button>
      )}
    </div>
  )
}

// --- Utils & Shared Layout ---

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useGameStore()
  const langs: { id: Language; label: string; flag: string }[] = [
    { id: 'uz', label: 'UZ', flag: '🇺🇿' },
    { id: 'ru', label: 'RU', flag: '🇷🇺' },
    { id: 'en', label: 'EN', flag: '🇺🇸' },
  ]

  if (compact) {
    return (
      <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
        {langs.map(l => (
          <button
            key={l.id}
            onClick={() => setLanguage(l.id)}
            className={`px-2 py-1 text-[9px] font-black transition-all ${language === l.id ? 'bg-[var(--accent-green)] text-white rounded' : 'text-[var(--text-muted)]'}`}
          >
            {l.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
      {langs.map(l => (
        <button
          key={l.id}
          onClick={() => setLanguage(l.id)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all ${
            language === l.id ? 'bg-[var(--accent-green)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <span>{l.flag}</span> {l.label}
        </button>
      ))}
    </div>
  )
}

function ThemeSwitcher() {
  const { uiTheme, setUiTheme, t } = useGameStore()
  const isDark = uiTheme === 'dark'
  return (
    <button
      onClick={() => setUiTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-xs font-black transition-all hover:bg-[var(--surface-2)] shadow-lg"
    >
      <span>{isDark ? '🌙' : '☀️'}</span>
      <span className="uppercase tracking-widest text-[var(--text-muted)]">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  const bg = {
    success: 'bg-[var(--accent-green)]',
    error: 'bg-red-500',
    info: 'bg-[var(--accent-cyan)]',
  }[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className={`fixed bottom-10 left-1/2 z-[200] flex items-center gap-3 rounded-2xl px-8 py-4 text-white shadow-2xl ${bg}`}
    >
      <span className="text-sm font-black uppercase tracking-widest">{notification.text}</span>
      <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white">✕</button>
    </motion.div>
  )
}

// --- Main App Logic ---

export default function App() {
  const { user, gameId, game, fetchGame, error, initSocket, goBackToMenu, setLanguage, uiTheme, t } = useGameStore()
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme)
    const saved = localStorage.getItem('shaxmat_user')
    const token = localStorage.getItem('shaxmat_token')
    const savedLang = localStorage.getItem('shaxmat_lang') as Language
    
    if (savedLang) setLanguage(savedLang)
    if (saved && token && !user) {
      const u = JSON.parse(saved)
      useGameStore.setState({ user: u, token })
      initSocket(u.public_id)
    }
  }, [user, initSocket, setLanguage, uiTheme])

  useEffect(() => {
    if (gameId) {
      fetchGame()
      const interval = setInterval(() => {
        if (useGameStore.getState().game?.status === 'active') fetchGame()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [gameId, fetchGame])

  if (error && !gameId) return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="arena-card p-12 max-w-md">
        <h2 className="text-2xl font-black mb-4">⚠️ Arena Error</h2>
        <p className="text-[var(--text-muted)] mb-8">{error}</p>
        <button onClick={() => { localStorage.clear(); window.location.reload() }} className="btn-primary">Restart Application</button>
      </div>
    </div>
  )

  if (!user) return <AuthScreen />
  if (!gameId) return <Lobby />

  const isGameOver = game && game.status !== 'active'
  const isFlipped = game?.game_mode === 'Person' && user?.id === game?.black_player_id
  
  return (
    <div className="flex h-screen w-full flex-col bg-[var(--bg)] overflow-hidden">
      {/* Game Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-8 py-4 shadow-xl">
        <div className="flex cursor-pointer items-center gap-4 group" onClick={goBackToMenu}>
          <Logo size="sm" />
          <span className="text-xl font-black tracking-tight text-white transition-colors group-hover:text-[var(--accent-green)]">SHAXMAT+</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end leading-none">
            <span className="text-xs font-black uppercase text-[var(--text-muted)]">{user.username}</span>
            <span className="text-[10px] font-mono font-bold text-[var(--accent-green)]">ID: {user.public_id}</span>
          </div>
          <button onClick={goBackToMenu} className="btn-secondary !py-2 !px-4 text-[10px]">Exit Arena</button>
        </div>
      </header>

      {/* Game Layout */}
      <main className="flex flex-1 overflow-hidden p-6 gap-8">
        <section className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-[650px] flex-col gap-4">
            <PlayerBadge 
              color={isFlipped ? "white" : "black"} 
              isActive={game?.turn === (isFlipped ? "white" : "black") && !isGameOver} 
            />
            <div className="rounded-xl bg-[var(--surface-3)] p-2 shadow-2xl border border-[var(--border)] overflow-hidden">
              <Board />
            </div>
            <PlayerBadge 
              color={isFlipped ? "black" : "white"} 
              isActive={game?.turn === (isFlipped ? "black" : "white") && !isGameOver} 
            />
          </div>
        </section>

        <aside className="flex w-[400px] flex-col gap-6">
          <GameControls />
          <div className="flex flex-1 flex-col gap-6 overflow-hidden">
            <MoveHistory />
            {game?.game_mode === 'Person' && <Chat />}
          </div>
        </aside>
      </main>

      <PromotionModal />
      <AnimatePresence><NotificationToast /></AnimatePresence>
      <InviteModal />
      <SearchingModal />
      <GameOverModal />
    </div>
  )
}

function PlayerBadge({ color, isActive }: { color: 'white' | 'black'; isActive: boolean }) {
  const { t, game } = useGameStore()
  if (!game) return null
  
  const isWhite = color === 'white'
  const capturedPieces = game.captured_pieces?.[color] || []
  const avatar = isWhite ? game.white_avatar : game.black_avatar
  const timeLeft = isWhite ? game.white_time_left : game.black_time_left
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center justify-between rounded-xl p-3 transition-all ${isActive ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30' : 'bg-[var(--surface)] opacity-60'}`}>
      <div className="flex items-center gap-4">
        <Avatar src={avatar || ''} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase text-white">{isWhite ? t.white : t.black}</span>
          <div className="flex gap-0.5 mt-1">
            {capturedPieces.map((p, i) => <span key={i} className="text-[10px] opacity-40">{p}</span>)}
          </div>
        </div>
      </div>
      <div className={`rounded-lg px-4 py-2 font-mono text-2xl font-black ${isActive ? (timeLeft < 30 ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--surface-2)] text-white') : 'text-[var(--text-muted)]'}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  )
}

// --- Modals (Simplified versions for App.tsx integration) ---

function InviteModal() {
  const { inviteRequest, respondToInvite, t } = useGameStore()
  if (!inviteRequest) return null
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="arena-card p-10 max-w-sm w-full text-center">
        <div className="text-5xl mb-6">🎮</div>
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Game Challenge</h2>
        <p className="text-[var(--text-muted)] mb-8"><span className="text-[var(--accent-green)]">{inviteRequest.from_username}</span> invited you to a match!</p>
        <div className="flex gap-4">
          <button onClick={() => respondToInvite(false)} className="btn-secondary flex-1">Decline</button>
          <button onClick={() => respondToInvite(true)} className="btn-primary flex-1">Accept</button>
        </div>
      </motion.div>
    </div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, matchedOpponent, matchOffer, acceptMatchOffer, t } = useGameStore()
  if (!isSearching) return null
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
      <div className="max-w-md w-full">
        {!matchedOpponent ? (
          <div className="space-y-8">
            <div className="mx-auto h-24 w-24 rounded-full border-4 border-t-[var(--accent-green)] border-white/5 animate-spin" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Searching...</h2>
            <p className="text-[var(--text-muted)] uppercase tracking-[0.3em] text-xs">Entering the Global Arena</p>
            <button onClick={cancelMatchmaking} className="btn-secondary !py-4">Cancel Queue</button>
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="arena-card p-10">
            <div className="mb-10 text-xs font-black text-[var(--accent-green)] uppercase tracking-[0.5em]">Opponent Found</div>
            <div className="flex items-center justify-center gap-10 mb-10">
              <Avatar src={useGameStore.getState().user?.avatar || ''} size="lg" />
              <div className="text-4xl font-black text-[var(--accent-green)] animate-pulse">VS</div>
              <Avatar src={matchedOpponent.avatar} size="lg" />
            </div>
            <button onClick={acceptMatchOffer} className="btn-primary w-full text-xl py-6">Accept Battle</button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu } = useGameStore()
  if (!game || game.status === 'active') return null
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="arena-card p-12 max-w-md w-full text-center">
        <div className="text-8xl mb-8">{isWinner ? '🏆' : '🏁'}</div>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{isWinner ? t.victory : t.gameOver}</h2>
        <p className="text-[var(--text-muted)] mb-10 uppercase tracking-widest text-xs">{t.betterLuck}</p>
        <button onClick={goBackToMenu} className="btn-primary w-full">Return to Lobby</button>
      </motion.div>
    </div>
  )
}
