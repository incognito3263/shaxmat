import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
import type { Language } from './translations'
import Board from './components/Board'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import PromotionModal from './components/PromotionModal'
import { Avatar } from './components/Avatar'
import { AVATARS } from './data/avatars'
import { PlayerBadge } from './components/game/PlayerBadge'
import { PlayOpponentCard } from './components/arena/PlayOpponentCard'
import { SearchingModal } from './components/arena/SearchingModal'
import { HowToPlayModal } from './components/arena/HowToPlayModal'
import { EditProfileModal } from './components/EditProfileModal'
import { LobbySidebar } from './components/lobby/LobbySidebar'
import type { LobbyPage } from './components/lobby/LobbyPage'
import { HowToPlaySections } from './components/lobby/HowToPlayContent'
import { CountryFlag } from './components/game/CountryFlag'

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 24 : size === 'md' ? 32 : 48;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L26 10V22L16 28L6 22V10L16 4Z" stroke="var(--accent-green)" strokeWidth="2" />
      <path d="M16 10V22M10 13L22 19M22 13L10 19" stroke="var(--accent-green)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="16" r="4" fill="var(--accent-green)" fillOpacity="0.2" />
    </svg>
  )
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { login, signup, loading, authError, clearAuthError, t, uploadAvatar } = useGameStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    if (isLogin) login(username, password)
    else signup(username, password, avatar)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-[var(--bg)]">
      <div className="mb-8 flex gap-4"><LanguageSwitcher /><ThemeSwitcher /></div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl">
        <div className="text-center mb-10">
            <div className="flex justify-center mb-6"><Logo size="lg" /></div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight mb-1 uppercase">SHAXMAT PLUS</h1>
            <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">{t.subtitle}</p>
        </div>
        <div className="flex mb-10 bg-[var(--surface-3)] p-1 rounded-lg">
            <button onClick={() => { setIsLogin(true); clearAuthError(); }} className={`flex-1 py-3 rounded text-sm font-bold uppercase transition-all ${isLogin ? 'bg-[var(--surface-2)] text-[var(--text-main)] shadow-lg' : 'text-[var(--text-muted)]'}`}>{t.login}</button>
            <button onClick={() => { setIsLogin(false); clearAuthError(); }} className={`flex-1 py-3 rounded text-sm font-bold uppercase transition-all ${!isLogin ? 'bg-[var(--surface-2)] text-[var(--text-main)] shadow-lg' : 'text-[var(--text-muted)]'}`}>{t.signup}</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[var(--surface-3)] p-4 rounded-lg border border-[var(--border)]">
                  <Avatar src={avatar} size="md" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary flex-1 py-2 text-xs">{isUploading ? '...' : t.uploadPhoto}</button>
                  <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) setAvatar(url); setIsUploading(false); } }} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map(a => <button key={a} type="button" onClick={() => setAvatar(a)} className={`text-2xl p-2 rounded hover:bg-[var(--surface-hover)] ${avatar === a ? 'bg-[var(--surface-2)] scale-110 shadow-lg' : 'opacity-40'}`}>{a}</button>)}
                </div>
              </div>
            )}
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-lg px-5 py-4 text-[var(--text-main)] outline-none focus:border-[var(--accent-green)]" placeholder={t.username} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[var(--surface-3)] border border-[var(--border)] rounded-lg px-5 py-4 text-[var(--text-main)] outline-none focus:border-[var(--accent-green)]" placeholder={t.password} />
            {authError && <p className="text-[var(--check-red)] text-sm text-center font-bold">{authError}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-lg">{loading ? '...' : (isLogin ? t.signIn : t.createAccount)}</button>
        </form>
      </motion.div>
    </div>
  )
}

/** Compact primary CTA — fits lobby frame. */
const LOBBY_BTN =
  'rounded-md bg-[#81b64c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_2px_0_0_#457528] transition-all hover:brightness-110 active:translate-y-px active:shadow-none disabled:opacity-50 sm:px-4 sm:py-2 sm:text-xs'

function ModeSelection() {
  const [lobbyPage, setLobbyPage] = useState<LobbyPage>('home')
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const {
    createGame,
    user,
    searchUser,
    logout,
    sendInvite,
    t,
    fetchLeaderboard,
    startMatchmaking,
    setNotification,
    fetchFriendRequests,
    fetchNotifications,
    language,
    setLanguage,
    uiTheme,
    setUiTheme,
  } = useGameStore()

  useEffect(() => { fetchLeaderboard(); fetchFriendRequests(); fetchNotifications(); }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])

  const totalGames = user ? (user.wins + user.losses + user.draws) : 0
  const winRate = totalGames > 0 ? Math.round((user!.wins / totalGames) * 100) : 0

  const inviteById = async () => {
    if (opponentId.length !== 8) return
    if (opponentId === user?.public_id) {
      setNotification({ text: t.selfPlayError, type: 'error' })
      return
    }
    const target = await searchUser(opponentId)
    if (target) sendInvite(target.public_id, timeLimit, timeIncrement)
    else setNotification({ text: t.userNotFound, type: 'error' })
  }

  const pageHeading =
    lobbyPage === 'home'
      ? t.lobbyNavHome
      : lobbyPage === 'play'
        ? t.lobbyNavPlay
        : lobbyPage === 'leaderboard'
          ? t.leaderboard
          : lobbyPage === 'friends'
            ? t.friends
            : t.lobbyNavLearn

  if (!user) return null

  const timePresets = [
    { l: '1m', s: 60, i: 0 },
    { l: '1+1', s: 60, i: 1 },
    { l: '3m', s: 180, i: 0 },
    { l: '3+2', s: 180, i: 2 },
    { l: '5m', s: 300, i: 0 },
    { l: '10m', s: 600, i: 0 },
    { l: '30m', s: 1800, i: 0 },
  ]

  const playPanel = (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card)] p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.timeControl}</div>
      <div className="mb-4 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {timePresets.map((tc) => (
          <button
            key={tc.l}
            type="button"
            onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i) }}
            className={`rounded py-1.5 text-[10px] font-black transition-all sm:text-[11px] ${
              timeLimit === tc.s && timeIncrement === tc.i
                ? 'bg-[#81b64c] text-white'
                : 'border border-[var(--border)] bg-[var(--lobby-card-inner)] text-[var(--text-muted)] hover:border-[#81b64c]/40'
            }`}
          >
            {tc.l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card-inner)] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider">🤖 {t.singlePlayer}</span>
            <div className="flex gap-1">
              {(['easy', 'normal', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded px-2 py-0.5 text-[9px] font-black uppercase sm:text-[10px] ${
                    difficulty === d ? 'bg-[var(--surface-2)] text-[#81b64c]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {t[d]}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className={`${LOBBY_BTN} w-full`}>
            {t.lobbyBattleAi}
          </button>
        </div>
        <button type="button" onClick={startMatchmaking} className={`${LOBBY_BTN} flex w-full items-center justify-center gap-2`}>
          <span className="text-base leading-none">🌍</span>
          {t.quickPlay}
        </button>
        <PlayOpponentCard opponentId={opponentId} onOpponentIdChange={setOpponentId} onInviteById={inviteById} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen w-full bg-[var(--lobby-main)] text-[var(--text-main)]">
      <LobbySidebar
        user={user}
        activePage={lobbyPage}
        t={t as Record<string, string>}
        language={language}
        uiTheme={uiTheme}
        onNavigate={setLobbyPage}
        onEditProfile={() => setIsEditModalOpen(true)}
        onLogout={logout}
        onSetLanguage={setLanguage}
        onToggleTheme={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
      />
      <div
        className="custom-scrollbar min-h-screen overflow-y-auto pl-[var(--lobby-sidebar-w)]"
        style={{ minHeight: '100dvh' }}
      >
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--lobby-main)]/95 px-4 py-2.5 backdrop-blur-md sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar src={user.avatar || '👤'} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold sm:text-[15px]">{user.username}</span>
                <CountryFlag code={user.country_code} />
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                <span>{getUserTitle(user.wins, t)}</span>
                <span className="hidden opacity-60 sm:inline">·</span>
                <span className="font-semibold text-[var(--accent-green)]">{pageHeading}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(user.public_id)
              setNotification({ text: t.idCopied, type: 'success' })
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--lobby-card)] px-2.5 py-1.5 text-[10px] font-mono font-bold text-[#81b64c] hover:bg-[var(--lobby-card-inner)] sm:text-xs"
          >
            {t.copyID}
            <span className="tracking-widest">{user.public_id}</span>
          </button>
        </header>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {lobbyPage === 'home' && (
            <>
              <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)] bg-gradient-to-r from-[var(--lobby-card)] to-[var(--lobby-main)] p-4 sm:p-5">
                <h2 className="text-base font-black tracking-tight sm:text-lg">{t.lobbyBannerTitle}</h2>
                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">{t.lobbyBannerSub}</p>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card)] px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.winRate}</div>
                  <div className="text-lg font-black text-[#81b64c] sm:text-xl">{winRate}%</div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card)] px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.totalGames}</div>
                  <div className="text-lg font-black sm:text-xl">{totalGames}</div>
                </div>
                <button type="button" onClick={() => setLobbyPage('play')} className={`${LOBBY_BTN} flex flex-col items-start gap-0.5 !normal-case`}>
                  <span className="text-[9px] opacity-90">{t.lobbyNavPlay}</span>
                  <span>{t.lobbyBattleAi}</span>
                </button>
                <button type="button" onClick={() => setLobbyPage('guide')} className="rounded-md border border-[var(--border)] bg-[var(--lobby-card)] px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide hover:bg-[var(--lobby-card-inner)] sm:py-2 sm:text-xs">
                  <span className="block text-[9px] font-bold normal-case text-[var(--text-muted)]">{t.lobbyNavLearn}</span>
                  {t.howToPlayButton}
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <button type="button" onClick={() => setLobbyPage('play')} className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card)] px-3 py-3 text-left text-sm font-bold hover:border-[#81b64c]/50">
                  {t.lobbyNavPlay}
                </button>
                <button type="button" onClick={() => setLobbyPage('leaderboard')} className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card)] px-3 py-3 text-left text-sm font-bold hover:border-[#81b64c]/50">
                  {t.leaderboard}
                </button>
                <button type="button" onClick={() => setLobbyPage('friends')} className="rounded-lg border border-[var(--border)] bg-[var(--lobby-card)] px-3 py-3 text-left text-sm font-bold hover:border-[#81b64c]/50 sm:col-span-2 lg:col-span-1">
                  {t.friends}
                </button>
              </div>
              <div className="mt-5 max-w-4xl">
                <LiveGames compact />
              </div>
            </>
          )}

          {lobbyPage === 'play' && <div className="max-w-3xl">{playPanel}</div>}

          {lobbyPage === 'leaderboard' && (
            <div className="max-w-4xl">
              <Leaderboard />
            </div>
          )}

          {lobbyPage === 'friends' && (
            <div className="grid max-w-5xl gap-4 md:grid-cols-2">
              <FriendsList />
              <MatchHistory />
            </div>
          )}

          {lobbyPage === 'guide' && (
            <div className="max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
              <h1 className="text-lg font-black uppercase tracking-wide text-[var(--text-main)] sm:text-xl">{t.howToPlayTitle}</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{t.howToPlayIntro}</p>
              <div className="mt-6">
                <HowToPlaySections />
              </div>
              <button type="button" onClick={() => setManualOpen(true)} className={`${LOBBY_BTN} mt-6`}>
                {t.howToPlayButton} ({t.arenaSubtitle})
              </button>
            </div>
          )}
        </div>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <HowToPlayModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  )
}

function FriendsList() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [fetchFriends, fetchFriendRequests])
  const list = friends ?? []
  return (
    <div className="flex w-full flex-col rounded-xl border border-[#403d39] bg-[#312e2b] p-6 shadow-lg">
      <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">👤 {t.friends}</h3>
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar" style={{ maxHeight: '400px' }}>
        {pendingRequests?.map((req) => (
          <div key={req.id} className="flex items-center justify-between rounded-lg border border-[#81b64c]/25 bg-[#81b64c]/10 p-3">
            <div className="flex items-center gap-3"><Avatar src={req.from_user.avatar} size="sm" /><div className="text-sm font-bold">{req.from_user.username}</div></div>
            <button onClick={() => respondToFriendRequest(req.id, true)} className="bg-[var(--accent-green)] text-white p-2 rounded shadow-lg hover:brightness-110"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
          </div>
        ))}
        {list.length === 0 && (!pendingRequests || pendingRequests.length === 0) ? (
          <p className="py-8 text-center text-sm text-[#bababa]">{t.noFriends}</p>
        ) : (
          list.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg p-3 text-white transition-all hover:bg-white/[0.06] group">
              <div className="flex items-center gap-4"><div className="relative"><Avatar src={f.avatar} size="sm" />{f.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--surface)]" />}</div><div><div className="text-base font-bold">{f.username}</div><div className="text-xs text-[var(--accent-green)] font-black uppercase tracking-wider">{getUserTitle(f.wins, t)}</div></div></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => sendInvite(f.public_id)} className="text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 p-2 rounded"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>
                <button onClick={() => unfollowUser(f.public_id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MatchHistory() {
  const { matchHistory, fetchMatchHistory, t, user } = useGameStore()
  const [showAll, setShowAll] = useState(false)
  useEffect(() => { fetchMatchHistory() }, [fetchMatchHistory])
  const history = matchHistory ?? []
  const displayedHistory = showAll ? history : history.slice(0, 5)
  return (
    <div className="w-full rounded-xl border border-[#403d39] bg-[#312e2b] p-6 shadow-lg">
      <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">📜 {t.matchHistory}</h3>
      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#bababa]">{t.noHistory}</p>
      ) : (
        <>
          <div className="space-y-2">
            {displayedHistory.map((m) => {
              const isWhite = m.white === user?.username
              const didIWin = m.winner === (isWhite ? 'white' : 'black')
              const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement'
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-[#403d39] bg-[#2a2825] p-3 text-sm text-white">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex -space-x-2 shrink-0">
                      <Avatar src={m.white_avatar} size="sm" />
                      <Avatar src={m.black_avatar} size="sm" />
                    </div>
                    <div className="truncate font-bold">{m.white} vs {m.black}</div>
                  </div>
                  <div className={`shrink-0 font-black uppercase tracking-wider ${isDraw ? 'text-[#9b9b9b]' : didIWin ? 'text-[#81b64c]' : 'text-red-400'}`}>
                    {isDraw ? t.draw : didIWin ? t.victory : t.defeat}
                  </div>
                </div>
              )
            })}
          </div>
          {history.length > 5 && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="mt-4 w-full text-xs font-bold uppercase tracking-widest text-[#81b64c] hover:brightness-110">
              {showAll ? t.showLess : t.showMore}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function Leaderboard({ compact }: { compact?: boolean }) {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  const rows = leaderboard || []
  const friendIds = new Set(friends?.map(f => f.public_id) || [])
  const pad = compact ? 'p-4' : 'p-10'
  const titleCls = compact ? 'text-sm mb-4' : 'text-lg mb-10'
  return (
    <div className={`w-full rounded-xl border border-[#403d39] bg-[#312e2b] shadow-lg ${pad}`}>
      <h3 className={`font-black uppercase tracking-widest flex items-center gap-2 text-white ${titleCls}`}>🏆 {t.leaderboard}</h3>
      {rows.length === 0 ? (
        <p className="text-sm leading-relaxed text-[#bababa]">{t.leaderboardEmptyHint}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-white ${compact ? 'min-w-[280px] text-sm' : 'min-w-[500px] text-base'}`}>
            <thead className="border-b border-[#403d39] text-[10px] uppercase tracking-widest text-[#9b9b9b]">
              <tr>
                <th className={`${compact ? 'pb-2 pl-0 pr-2' : 'pb-6 px-4'} w-10`}>#</th>
                <th className={compact ? 'pb-2 pr-2' : 'pb-6 px-4'}>{t.player}</th>
                <th className={`${compact ? 'pb-2' : 'pb-6 px-4'} text-center`}>{t.wins}</th>
                <th className={compact ? 'pb-2 w-8' : 'pb-6 px-4'} />
              </tr>
            </thead>
            <tbody className="font-bold">
              {rows.map((u, index) => {
                const isMe = u.id === user?.id
                const isFollowing = friendIds.has(u.public_id)
                const cellY = compact ? 'py-2.5' : 'py-6 px-4'
                return (
                  <tr key={u.id} className={`border-b border-[#403d39]/60 transition-colors ${isMe ? 'bg-[#81b64c]/10' : ''} hover:bg-white/[0.04]`}>
                    <td className={`${cellY} font-mono opacity-50`}>{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</td>
                    <td className={`${cellY} flex items-center gap-3`}>
                      <div className="relative shrink-0">
                        <Avatar src={u.avatar} size="sm" />
                        {u.is_online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#312e2b] bg-green-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`flex items-center gap-2 truncate ${compact ? 'text-sm' : 'text-lg'}`}>
                          {u.username}
                          {isMe && <span className="shrink-0 rounded border border-[#81b64c]/40 px-1.5 py-0.5 text-[9px] text-[#81b64c]">YOU</span>}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#81b64c]">{getUserTitle(u.wins, t)}</div>
                      </div>
                    </td>
                    <td className={`${cellY} text-center font-mono text-[#81b64c] ${compact ? 'text-lg' : 'text-2xl'}`}>{u.wins}</td>
                    <td className={`${cellY} text-right`}>
                      {!isMe && !isFollowing && (
                        <button
                          type="button"
                          onClick={() => {
                            sendFriendRequest(u.public_id)
                            setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' })
                          }}
                          className="rounded p-2 text-[#81b64c] transition-colors hover:bg-[#81b64c]/15"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LiveGames({ compact }: { compact?: boolean }) {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  const games = liveGames || []
  const pad = compact ? 'p-4' : 'p-8'
  return (
    <div className={`w-full rounded-xl border border-[#403d39] bg-[#312e2b] shadow-lg ${pad}`}>
      <h3 className={`mb-4 flex items-center gap-2 font-bold uppercase tracking-widest text-white ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> {t.liveGames}
      </h3>
      {games.length === 0 ? (
        <p className="text-sm text-[#bababa]">{t.liveEmptyHint}</p>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
          {games.map((g) => (
            <button
              key={g.game_id}
              type="button"
              onClick={() => spectateGame(g.game_id)}
              className="flex w-full items-center justify-between rounded-xl border border-[#403d39] bg-[#2a2825] p-4 text-left transition-all hover:border-[#81b64c]/60"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  <Avatar src={g.white_avatar} size="sm" />
                  <Avatar src={g.black_avatar} size="sm" />
                </div>
                <div className="truncate font-bold text-white">{g.white} vs {g.black}</div>
              </div>
              <span className="shrink-0 text-xs font-black uppercase tracking-wider text-[#81b64c]">{t.spectate}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Chat() {
  const { chatMessages, sendChatMessage, user } = useGameStore()
  const [text, setText] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [chatMessages])
  const handleSend = (e: React.FormEvent) => { e.preventDefault(); if (text.trim()) { sendChatMessage(text); setText('') } }
  return (
    <div className="flex min-h-0 max-h-[min(32dvh,260px)] shrink-0 flex-col overflow-hidden rounded-xl border border-[#403d39] bg-[#262421] shadow-xl xl:max-h-[min(38dvh,280px)] xl:shrink-0 xl:rounded-2xl">
      <div className="px-6 py-4 border-b border-[#403d39] bg-[#211f1d] flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest opacity-50 text-[var(--text-main)]">Live Chat</span><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /></div>
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-[var(--text-main)]">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === user?.username ? 'items-end' : 'items-start'}`}><span className="text-[10px] opacity-40 mb-1.5 px-1 font-bold uppercase tracking-wider text-[var(--text-main)]">{msg.from}</span><div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.from === user?.username ? 'bg-[#81b64c] text-white shadow-lg' : 'bg-[#3c3a37] text-white border border-[#403d39]'}`}>{msg.text}</div></div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 bg-[#211f1d] border-t border-[#403d39] flex gap-3"><input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="..." className="flex-1 bg-[#2d2b28] border border-[#403d39] rounded-xl px-5 py-3 text-base text-white outline-none focus:border-[#81b64c] shadow-inner" /><button type="submit" className="bg-[#81b64c] text-white p-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></form>
    </div>
  )
}

function LanguageSwitcher() {
  const { language, setLanguage } = useGameStore()
  const langs: { id: Language; label: string }[] = [{ id: 'uz', label: 'UZ' }, { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }]
  return (
    <div className="flex p-1 rounded-lg bg-[var(--surface-3)] border border-[var(--border)]">{langs.map(l => ( <button key={l.id} onClick={() => setLanguage(l.id)} className={`px-4 py-2 rounded text-sm font-black transition-all ${language === l.id ? 'bg-[var(--surface-2)] text-[var(--accent-green)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>{l.label}</button> ))}</div>
  )
}

function ThemeSwitcher() {
  const { uiTheme, setUiTheme } = useGameStore()
  const isDark = uiTheme === 'dark'
  return (
    <div className="flex items-center p-1 rounded-lg bg-[var(--surface-3)] border border-[var(--border)] cursor-pointer" onClick={() => setUiTheme(isDark ? 'light' : 'dark')}><div className={`px-4 py-2 rounded text-sm font-black transition-all ${isDark ? 'bg-[var(--surface-2)] text-[var(--accent-green)] shadow-lg' : 'text-[var(--text-muted)]'}`}>DARK</div><div className={`px-4 py-2 rounded text-sm font-black transition-all ${!isDark ? 'bg-white text-black shadow-lg' : 'text-[var(--text-muted)]'}`}>LIGHT</div></div>
  )
}

function ViewSwitcher() {
  const { viewMode, setViewMode, t, setNotification } = useGameStore()
  return (
    <div className="flex p-1 rounded-lg bg-[var(--surface-3)] border border-[var(--border)]"><button onClick={() => setViewMode('2d')} className={`px-4 py-2 rounded text-sm font-black transition-all ${viewMode === '2d' ? 'bg-[var(--surface-2)] text-[var(--accent-green)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>2D</button><button onClick={() => setNotification({ text: t.comingSoon, type: 'info' })} className={`px-4 py-2 rounded text-sm font-black opacity-20 flex items-center gap-2`}>3D <span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-pulse" /></button></div>
  )
}

export default function App() {
  const { user, gameId, game, fetchGame, error, initSocket, goBackToMenu, setLanguage, isSpectator, uiTheme, t } = useGameStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme)
    const saved = localStorage.getItem('shaxmat_user'), token = localStorage.getItem('shaxmat_token'), savedGameId = localStorage.getItem('shaxmat_game_id'), savedIsSpectator = localStorage.getItem('shaxmat_spectator') === 'true', savedLang = localStorage.getItem('shaxmat_lang') as Language
    if (savedLang) setLanguage(savedLang)
    if (saved && token && !user) { const u = JSON.parse(saved); useGameStore.setState({ user: u, token: token, isSpectator: savedIsSpectator }); initSocket(u.public_id)
      if (savedGameId) { const gid = parseInt(savedGameId, 10); useGameStore.setState({ gameId: gid }) }
    }
  }, [user, initSocket, setLanguage, uiTheme])
  useEffect(() => { if (gameId) { fetchGame(); const interval = setInterval(() => { if (useGameStore.getState().game?.status === 'active') fetchGame() }, 5000); return () => clearInterval(interval) } }, [gameId, fetchGame])
  useEffect(() => {
    if (!gameId) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [gameId])
  if (error && !gameId) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text-main)]"><div className="text-center bg-[var(--surface)] border border-[var(--border)] p-12 rounded-[2rem] shadow-2xl"><h2 className="text-3xl font-black mb-8 tracking-tight">Error: {error}</h2><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-primary py-4 px-10">Reset Application</button></div></div>
  if (!user) return <div className="min-h-screen flex flex-col"><AuthScreen /><AnimatePresence><NotificationToast /></AnimatePresence></div>
  if (!gameId) return <div className="min-h-screen flex flex-col bg-[var(--bg)]"><ModeSelection /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><SearchingModal /></div>
  const isGameOver = game && game.status !== 'active'
  const isFlipped = game?.game_mode === 'Person' && user?.id === game?.black_player_id
  const topColor: 'white' | 'black' = isFlipped ? 'white' : 'black'
  const bottomColor: 'white' | 'black' = isFlipped ? 'black' : 'white'
  const nameFor = (c: 'white' | 'black') => {
    if (!game) return ''
    const n = c === 'white' ? game.white_username : game.black_username
    return (n && String(n).trim()) || (game.game_mode === 'AI' ? t.aiOpponent : t.waitingOpponent)
  }
  const countryFor = (c: 'white' | 'black') => {
    if (!game) return null
    const code = c === 'white' ? game.white_country_code : game.black_country_code
    return (code && String(code).trim()) || null
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden overscroll-none bg-[var(--bg)]">
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:px-8 md:py-4"><div className="flex cursor-pointer items-center gap-4 group" onClick={goBackToMenu}><Logo size="sm" /><div className="flex flex-col"><span className="text-base font-bold tracking-tight text-[var(--accent-white)] transition-colors group-hover:text-[var(--accent-cyan)]">SHAXMAT+</span></div></div><div className="flex items-center gap-3 md:gap-6"><ViewSwitcher /><LanguageSwitcher /><ThemeSwitcher /><div className="flex flex-col items-end leading-none"><span className="mb-1 max-w-[8rem] truncate text-right text-[10px] font-bold uppercase text-[var(--text-muted)] sm:max-w-none">{user.username}</span><span className="text-[10px] font-mono font-bold text-[var(--accent-cyan)] opacity-70">ID: {user.public_id}</span></div></div></header>
      <main className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col gap-2 overflow-hidden px-2 py-1 md:gap-3 md:px-4 md:py-2 xl:flex-row xl:items-stretch xl:gap-5">
        <section className="order-1 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden xl:py-0">
          <div className="flex min-h-0 w-full max-w-[min(96vw,calc((100dvh-9.5rem)*(8/10)))] flex-1 flex-col items-center justify-center">
            {game && (
              <PlayerBadge
                color={topColor}
                displayName={nameFor(topColor)}
                countryCode={countryFor(topColor)}
                isActive={game.turn === topColor && !isGameOver}
              />
            )}
            <div className="my-1 flex min-h-0 w-full flex-1 items-center justify-center md:my-2">
              <div className="h-full max-h-[calc(100dvh-10rem)] w-full max-w-full overflow-hidden">
                <Board />
              </div>
            </div>
            {game && (
              <PlayerBadge
                color={bottomColor}
                displayName={nameFor(bottomColor)}
                countryCode={countryFor(bottomColor)}
                isActive={game.turn === bottomColor && !isGameOver}
              />
            )}
          </div>
        </section>

        <aside className="order-2 flex min-h-0 w-full min-w-0 flex-none flex-col gap-2 overflow-hidden md:gap-3 xl:w-[380px] xl:max-w-[380px] xl:shrink-0">
          <GameControls />
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:gap-3">
            <MoveHistory />
            {game?.game_mode === 'Person' && !isSpectator && <Chat />}
          </div>
        </aside>
      </main>
      <PromotionModal /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><GameOverModal />
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  return ( <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} onClick={() => setNotification(null)} className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-xl text-black font-black text-sm uppercase tracking-widest shadow-2xl cursor-pointer ${notification.type === 'error' ? 'bg-red-500' : 'bg-[var(--accent-green)]'}`}>{notification.text}</motion.div> )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-16 rounded-[2rem] text-center border border-[var(--border)] bg-[var(--surface)] shadow-[0_50px_150px_rgba(0,0,0,1)]"><div className="text-9xl mb-10">{isWinner ? '🏆' : '🏁'}</div><h2 className="text-5xl font-black uppercase mb-4 text-[var(--text-main)] tracking-tighter">{isWinner ? t.victory : t.gameOver}</h2><p className="text-[var(--text-muted)] text-base mb-12 uppercase font-black tracking-widest">{game.status === 'resigned' ? t.opponentLeft.replace('{name}', opponentResignedName || '') : t.betterLuck}</p><div className="flex flex-col gap-5"><button onClick={() => useGameStore.getState().startReview()} className="btn-primary w-full py-5 text-lg shadow-2xl">{t.reviewGame}</button><button onClick={goBackToMenu} className="btn-secondary w-full py-5 text-lg shadow-xl">{t.backToMenu}</button></div></motion.div></div>
  )
}

function InviteModal() {
  const { inviteRequest, respondToInvite, t } = useGameStore()
  if (!inviteRequest) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-12 bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] text-center shadow-[0_40px_120px_rgba(0,0,0,1)]"><div className="text-6xl mb-8">🎮</div><h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Challenge</h2><p className="text-[var(--text-muted)] text-base mb-10 font-black uppercase tracking-widest"><span className="text-[var(--accent-green)]">{inviteRequest.from_username}</span> wants to play!</p><div className="flex gap-5"><button onClick={() => respondToInvite(false)} className="btn-secondary flex-1 py-4 text-base">{t.decline}</button><button onClick={() => respondToInvite(true)} className="btn-primary flex-1 py-4 text-base shadow-2xl">{t.accept}</button></div></motion.div></div>
  )
}

