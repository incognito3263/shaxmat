import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
import type { Language } from './translations'
import Board from './components/Board'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import PromotionModal from './components/PromotionModal'
import { PlayOpponentCard } from './components/arena/PlayOpponentCard'
import { HowToPlayModal } from './components/arena/HowToPlayModal'
import { EditProfileModal } from './components/EditProfileModal'
import { LobbySidebar } from './components/lobby/LobbySidebar'
import type { LobbyPage } from './components/lobby/LobbyPage'
import { HowToPlaySections } from './components/lobby/HowToPlayContent'

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
  const [avatar, setAvatar] = useState('👨‍🚀')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { login, signup, loading, authError, clearAuthError, t, uploadAvatar } = useGameStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    if (isLogin) login(username, password)
    else signup(username, password, avatar)
  }

  const AVATARS = ['👨‍🚀', '🥷', '🧙‍♂️', '🧛', '🤖', '👾', '👽', '🦊']

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

const LOBBY_BTN = 'rounded-md bg-[#81b64c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_2px_0_0_#457528] transition-all hover:brightness-110 active:translate-y-px active:shadow-none disabled:opacity-50 sm:px-4 sm:py-2 sm:text-xs'

function ModeSelection() {
  const [lobbyPage, setLobbyPage] = useState<LobbyPage>('home')
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const { createGame, user, searchUser, logout, sendInvite, t, fetchLeaderboard, startMatchmaking, setNotification, fetchFriendRequests, fetchNotifications, language, setLanguage, uiTheme, setUiTheme } = useGameStore()

  useEffect(() => { fetchLeaderboard(); fetchFriendRequests(); fetchNotifications(); }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])

  const totalGames = (user?.wins || 0) + (user?.losses || 0) + (user?.draws || 0)
  const winRate = totalGames > 0 ? Math.round(((user?.wins || 0) / totalGames) * 100) : 0

  const inviteById = async () => {
    if (opponentId.length !== 8) return
    if (opponentId === user?.public_id) { setNotification({ text: t.selfPlayError, type: 'error' }); return }
    const target = await searchUser(opponentId)
    if (target) sendInvite(target.public_id, timeLimit, timeIncrement)
    else setNotification({ text: t.userNotFound, type: 'error' })
  }

  if (!user) return null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)] text-[var(--text-main)]">
      <LobbySidebar user={user} activePage={lobbyPage} t={t as any} language={language} uiTheme={uiTheme} onNavigate={setLobbyPage} onEditProfile={() => setIsEditModalOpen(true)} onLogout={logout} onSetLanguage={setLanguage} onToggleTheme={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')} onCopyPublicId={() => { void navigator.clipboard.writeText(user.public_id); setNotification({ text: t.idCopied, type: 'success' }) }} />
      <div className="custom-scrollbar min-h-screen flex-1 overflow-y-auto pl-[var(--lobby-sidebar-w)]">
        <div className="p-8 lg:p-12">
          {lobbyPage === 'home' && (
            <div className="mx-auto max-w-5xl space-y-10">
              <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface)] to-[var(--bg)] p-10 shadow-2xl">
                <h2 className="text-3xl font-black tracking-tight">{t.lobbyBannerTitle}</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">{t.lobbyBannerSub}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"><div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t.winRate}</div><div className="mt-1 text-3xl font-black text-[#81b64c]">{winRate}%</div></div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"><div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t.totalGames}</div><div className="mt-1 text-3xl font-black">{totalGames}</div></div>
                <button onClick={() => setLobbyPage('play')} className="rounded-xl bg-[#81b64c] p-6 text-white shadow-lg hover:brightness-110 transition-all font-black uppercase text-sm">{t.lobbyNavPlay}</button>
                <button onClick={() => setLobbyPage('guide')} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text-main)] hover:bg-[var(--surface-2)] transition-all font-black uppercase text-sm">{t.howToPlayButton}</button>
              </div>
              <div className="grid gap-8 lg:grid-cols-2"><LiveGamesSection /><MatchHistorySection /></div>
            </div>
          )}
          {lobbyPage === 'play' && (
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t.timeControl}</div>
                <div className="mb-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {[{l:'1m',s:60,i:0},{l:'1+1',s:60,i:1},{l:'3m',s:180,i:0},{l:'3+2',s:180,i:2},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0},{l:'30m',s:1800,i:0}].map((tc) => (
                    <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i) }} className={`rounded-lg py-2 text-[10px] font-black transition-all ${timeLimit === tc.s && timeIncrement === tc.i ? 'bg-[#81b64c] text-white shadow-lg' : 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[#81b64c]/40'}`}>{tc.l.toUpperCase()}</button>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 shadow-inner">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-black uppercase tracking-widest">🤖 {t.singlePlayer}</span><div className="flex gap-1">{['easy', 'normal', 'hard'].map((d) => ( <button key={d} onClick={() => setDifficulty(d)} className={`rounded px-3 py-1 text-[10px] font-black uppercase transition-all ${difficulty === d ? 'bg-[#81b64c] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>{(t as any)[d]}</button> ))}</div></div>
                    <button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className={`${LOBBY_BTN} w-full py-3 text-sm`}>{t.lobbyBattleAi}</button>
                  </div>
                  <button onClick={startMatchmaking} className={`${LOBBY_BTN} flex w-full items-center justify-center gap-3 py-4 text-base shadow-xl`}><span className="text-2xl">🌍</span>{t.quickPlay}</button>
                  <PlayOpponentCard opponentId={opponentId} onOpponentIdChange={setOpponentId} onInviteById={inviteById} />
                </div>
              </div>
            </div>
          )}
          {lobbyPage === 'leaderboard' && <div className="mx-auto max-w-4xl"><LeaderboardSection /></div>}
          {lobbyPage === 'friends' && <div className="mx-auto max-w-5xl"><FriendsSection /></div>}
          {lobbyPage === 'guide' && <div className="mx-auto max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 shadow-2xl"><h1 className="text-2xl font-black uppercase tracking-widest">{t.howToPlayTitle}</h1><p className="mt-4 text-base text-[var(--text-muted)]">{t.howToPlayIntro}</p><div className="mt-8"><HowToPlaySections /></div><button onClick={() => setManualOpen(true)} className="btn-primary mt-10">{t.howToPlayButton} (Full Guide)</button></div>}
        </div>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <HowToPlayModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  )
}

function FriendsSection() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [fetchFriends, fetchFriendRequests])
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl h-fit">
        <h3 className="mb-8 text-lg font-black uppercase tracking-widest">👥 {t.friends}</h3>
        {pendingRequests?.length > 0 && (
          <div className="mb-8 space-y-3 border-b border-[var(--border)] pb-8">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between rounded-xl bg-[#81b64c]/5 p-4 border border-[#81b64c]/20">
                <div className="flex items-center gap-4"><Avatar src={req.from_user.avatar} size="sm" /><span className="text-base font-bold">{req.from_user.username}</span></div>
                <div className="flex gap-2"><button onClick={() => respondToFriendRequest(req.id, true)} className="rounded-lg bg-[#81b64c] p-2 text-white shadow-md"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button></div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          {friends?.length === 0 ? <p className="py-10 text-center text-[var(--text-muted)] italic">No friends yet.</p> : 
            friends?.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl p-4 transition-all hover:bg-[var(--surface-2)] group">
                <div className="flex items-center gap-4"><div className="relative"><Avatar src={f.avatar} size="sm" />{f.is_online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-green-500 shadow-lg" />}</div><div><div className="text-base font-bold">{f.username}</div><div className="text-[10px] uppercase font-bold text-[#81b64c]">{getUserTitle(f.wins, t)}</div></div></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => sendInvite(f.public_id)} className="text-[#81b64c] hover:bg-[#81b64c]/10 p-2 rounded transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button><button onClick={() => unfollowUser(f.public_id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>
              </div>
            ))
          }
        </div>
      </div>
      <MatchHistorySection />
    </div>
  )
}

function MatchHistorySection() {
  const { matchHistory, fetchMatchHistory, t, user } = useGameStore()
  const [showAll, setShowAll] = useState(false)
  useEffect(() => { fetchMatchHistory() }, [fetchMatchHistory])
  const history = matchHistory || []
  const displayed = showAll ? history : history.slice(0, 5)
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
      <h3 className="mb-8 text-lg font-black uppercase tracking-widest">📜 {t.matchHistory}</h3>
      <div className="space-y-3">
        {history.length === 0 ? <p className="py-10 text-center text-[var(--text-muted)] italic">No games yet.</p> : 
          displayed.map((m) => {
            const isWhite = m.white === user?.username; const didIWin = m.winner === (isWhite ? 'white' : 'black'); const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement';
            return ( <div key={m.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm"><div className="flex items-center gap-4"><div className="flex -space-x-2"><Avatar src={m.white_avatar} size="sm" /><Avatar src={m.black_avatar} size="sm" /></div><div className="font-bold text-[var(--text-main)] truncate max-w-[120px]">{m.white} vs {m.black}</div></div><div className={`font-black uppercase tracking-wider text-xs ${isDraw ? 'opacity-40' : didIWin ? 'text-green-500' : 'text-red-500'}`}>{isDraw ? t.draw : didIWin ? t.victory : t.defeat}</div></div> );
          })
        }
      </div>
      {history.length > 5 && <button onClick={() => setShowAll(!showAll)} className="mt-6 w-full text-xs font-bold text-[#81b64c] uppercase tracking-widest hover:brightness-110 transition-all">{showAll ? t.showLess : t.showMore}</button>}
    </div>
  )
}

function LiveGamesSection() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  const games = liveGames || []
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
      <div className="mb-8 flex items-center justify-between"><h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> {t.liveGames}</h3><span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black text-red-500 uppercase">{games.length} Live</span></div>
      <div className="space-y-4">
        {games.length === 0 ? <p className="py-10 text-center text-[var(--text-muted)] italic">No matches right now.</p> : 
          games.map((g) => ( <div key={g.game_id} onClick={() => spectateGame(g.game_id)} className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition-all hover:border-[#81b64c] group shadow-sm"><div className="flex items-center gap-6 text-[var(--text-main)]"><div className="flex -space-x-2"><Avatar src={g.white_avatar} size="sm" /><Avatar src={g.black_avatar} size="sm" /></div><div className="text-lg font-bold truncate max-w-[150px]">{g.white} vs {g.black}</div></div><div className="text-sm font-black text-[#81b64c] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Watch</div></div> ))}</div></div>
  )
}

function LeaderboardSection() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || [])
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-10 py-8"><h3 className="text-xl font-black uppercase tracking-widest">🏆 {t.leaderboard}</h3></div>
      <div className="overflow-x-auto text-[var(--text-main)]"><table className="w-full text-left min-w-[500px] text-[var(--text-main)]"><thead className="bg-[var(--surface-3)] text-[10px] uppercase tracking-widest text-[var(--text-muted)]"><tr><th className="px-10 py-5 w-12">#</th><th className="px-10 py-5">Player</th><th className="px-10 py-5 text-center">Wins</th><th className="px-10 py-5 text-right">Action</th></tr></thead><tbody className="divide-y divide-[var(--border)] font-bold">{leaderboard.map((u, index) => { const isMe = u.id === user?.id; const isFollowing = friendIds.has(u.public_id); return ( <tr key={u.id} className={`transition-colors hover:bg-[var(--surface-hover)] ${isMe ? 'bg-[#81b64c]/5' : ''}`}><td className="py-6 px-4 opacity-30 font-mono">{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</td><td className="py-6 px-4 flex items-center gap-6"><div className="relative"><Avatar src={u.avatar} size="sm" />{u.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--surface)]" />}</div><div><div className="flex items-center gap-3 text-lg">{u.username}{isMe && <span className="text-[10px] text-[#81b64c] border border-[#81b64c]/30 px-2 py-0.5 rounded">YOU</span>}</div><div className="text-xs text-[#81b64c] uppercase tracking-widest mt-1">{getUserTitle(u.wins, t)}</div></div></td><td className="py-6 px-4 text-center font-mono text-green-500 text-2xl">{u.wins}</td><td className="py-6 px-4 text-right">{!isMe && !isFollowing && <button onClick={() => { sendFriendRequest(u.public_id); setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' }); }} className="text-[#81b64c] hover:bg-[#81b64c]/10 p-3 rounded transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>}</td></tr> ); })}</tbody></table></div>
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
    <div className="flex flex-col h-[350px] rounded-[2rem] overflow-hidden border border-[#403d39] bg-[#262421] shadow-2xl">
      <div className="px-6 py-4 border-b border-[#403d39] bg-[#211f1d] flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest opacity-50 text-[var(--text-main)]">Live Chat</span><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /></div>
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
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
  const langs = [{ id: 'uz', label: 'UZ' }, { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }]
  return (
    <div className="flex p-1 rounded-lg bg-[#211f1d] border border-[#403d3a]">{langs.map(l => ( <button key={l.id} onClick={() => setLanguage(l.id as any)} className={`px-4 py-2 rounded text-sm font-black transition-all ${language === l.id ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30 hover:opacity-100'}`}>{l.label}</button> ))}</div>
  )
}

function ThemeSwitcher() {
  const { uiTheme, setUiTheme } = useGameStore()
  const isDark = uiTheme === 'dark'
  return (
    <div className="flex items-center p-1 rounded-lg bg-[#211f1d] border border-[#403d3a] cursor-pointer" onClick={() => setUiTheme(isDark ? 'light' : 'dark')}><div className={`px-4 py-2 rounded text-sm font-black transition-all ${isDark ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30'}`}>DARK</div><div className={`px-4 py-2 rounded text-sm font-black transition-all ${!isDark ? 'bg-white text-black shadow-lg' : 'opacity-30'}`}>LIGHT</div></div>
  )
}

function ViewSwitcher() {
  const { viewMode, setViewMode, t, setNotification } = useGameStore()
  return (
    <div className="flex p-1 rounded-lg bg-[#211f1d] border border-[#403d3a]"><button onClick={() => setViewMode('2d')} className={`px-4 py-2 rounded text-sm font-black transition-all ${viewMode === '2d' ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30 hover:opacity-100'}`}>2D</button><button onClick={() => setNotification({ text: t.comingSoon, type: 'info' })} className={`px-4 py-2 rounded text-sm font-black opacity-20 flex items-center gap-2`}>3D <span className="w-1.5 h-1.5 bg-[#81b64c] rounded-full animate-pulse" /></button></div>
  )
}

function PlayerBadge({ color, isActive }: { color: 'white' | 'black'; isActive: boolean }) {
  const { t, game } = useGameStore()
  const isWhite = color === 'white'; const avatar = isWhite ? game?.white_avatar : game?.black_avatar; const timeLeft = isWhite ? (game?.white_time_left || 0) : (game?.black_time_left || 0);
  const formatTime = (s: number) => { const mins = Math.floor(s / 60); const secs = s % 60; return `${mins}:${secs.toString().padStart(2, '0')}` }
  return (
    <div className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${isActive ? 'bg-[#3c3a37]/50 shadow-inner border border-[#403d39]' : ''}`}>
      <div className="flex items-center gap-6"><Avatar src={avatar || ''} size="md" /><div><div className="text-xl font-black uppercase tracking-wider text-[var(--text-main)]" style={{ color: isWhite ? 'var(--text-main)' : 'var(--text-muted)' }}>{isWhite ? t.white : t.black}</div><div className="flex gap-1.5 mt-1.5 opacity-40">{game?.captured_pieces?.[color]?.map((p, i) => <span key={i} className="text-base font-bold">{p}</span>)}</div></div></div>
      <div className={`px-8 py-3 rounded-xl font-mono text-3xl font-black tracking-tighter shadow-2xl ${isActive ? (timeLeft < 30 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#3c3a37] text-white') : 'bg-[#211f1d] text-[#bababa] opacity-50'}`}>{formatTime(timeLeft)}</div>
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  return ( <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} onClick={() => setNotification(null)} className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-xl text-black font-black text-sm uppercase tracking-widest shadow-2xl cursor-pointer ${notification.type === 'error' ? 'bg-red-500' : 'bg-[#81b64c]'}`}>{notification.text}<button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button></motion.div> )
}

function InviteModal() {
  const { inviteRequest, respondToInvite, t } = useGameStore()
  if (!inviteRequest) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-12 bg-[#262421] border border-[#403d39] rounded-[2.5rem] text-center shadow-[0_40px_120px_rgba(0,0,0,1)]"><div className="text-6xl mb-8">🎮</div><h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Challenge</h2><p className="text-[#bababa] text-base mb-10 font-black uppercase tracking-widest"><span className="text-[#81b64c]">{inviteRequest.from_username}</span> wants to play!</p><div className="flex gap-5"><button onClick={() => respondToInvite(false)} className="btn-secondary flex-1 py-4 text-base">Decline</button><button onClick={() => respondToInvite(true)} className="btn-primary flex-1 py-4 text-base shadow-2xl">{t.accept}</button></div></motion.div></div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, matchedOpponent, acceptMatchOffer, t } = useGameStore()
  if (!isSearching) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl text-center">
      {!matchedOpponent ? ( <div className="space-y-10"><div className="mx-auto h-32 w-32 rounded-full border-[6px] border-t-[#81b64c] border-white/5 animate-spin shadow-[0_0_50px_rgba(129,182,76,0.2)]" /><h2 className="text-5xl font-black text-white uppercase tracking-tighter">Searching...</h2><p className="text-[#81b64c] uppercase tracking-[0.5em] text-sm font-black animate-pulse">Regional Grandmaster Arena</p><button onClick={cancelMatchmaking} className="btn-secondary mt-10 !py-5 !px-12 text-base shadow-2xl">Cancel Queue</button></div> ) : (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-lg w-full p-16 bg-[var(--surface)] border border-[#81b64c]/20 rounded-[3rem] shadow-[0_60px_180px_rgba(0,0,0,1)]"><div className="text-sm font-black text-[#81b64c] uppercase tracking-[0.7em] mb-12">Match Found</div><div className="flex items-center justify-center gap-16 py-12 bg-[#211f1d] rounded-2xl border border-[#403d3a] shadow-inner"><div className="flex flex-col items-center gap-6"><Avatar src={useGameStore.getState().user?.avatar || ''} size="lg" /><span className="text-sm text-[#bababa] uppercase font-black tracking-widest">{t.player}</span></div><div className="text-6xl font-black text-[#81b64c] animate-pulse">VS</div><div className="flex flex-col items-center gap-6"><Avatar src={matchedOpponent.avatar} size="lg" /><span className="text-sm text-[#bababa] uppercase font-black tracking-widest truncate max-w-[120px]">{matchedOpponent.username}</span></div></div><button onClick={acceptMatchOffer} className="btn-primary w-full py-6 text-xl shadow-2xl mt-12">{t.acceptAndStart}</button></motion.div>
      )}
    </div>
  )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-16 rounded-[2rem] text-center border border-[#403d3a] bg-[#262421] shadow-[0_50px_150px_rgba(0,0,0,1)]"><div className="text-9xl mb-10">{isWinner ? '🏆' : '🏁'}</div><h2 className="text-5xl font-black uppercase mb-4 text-white tracking-tighter">{isWinner ? t.victory : t.gameOver}</h2><p className="text-[#bababa] text-base mb-12 uppercase font-black tracking-widest">{game.status === 'resigned' ? t.opponentLeft.replace('{name}', opponentResignedName || '') : t.betterLuck}</p><div className="flex flex-col gap-5"><button onClick={() => useGameStore.getState().startReview()} className="btn-primary w-full py-5 text-lg shadow-2xl">{t.reviewGame}</button><button onClick={goBackToMenu} className="btn-secondary w-full py-5 text-lg shadow-xl">{t.backToMenu}</button></div></motion.div></div>
  )
}

export default function App() {
  const { user, gameId, game, fetchGame, error, initSocket, goBackToMenu, setLanguage, uiTheme, t } = useGameStore()
  useEffect(() => { document.documentElement.setAttribute('data-theme', uiTheme); const saved = localStorage.getItem('shaxmat_user'); const token = localStorage.getItem('shaxmat_token'); const savedLang = localStorage.getItem('shaxmat_lang') as Language; if (savedLang) setLanguage(savedLang); if (saved && token && !user) { const u = JSON.parse(saved); useGameStore.setState({ user: u, token }); initSocket(u.public_id) } }, [user, initSocket, setLanguage, uiTheme])
  useEffect(() => { if (gameId) { fetchGame(); const interval = setInterval(() => { if (useGameStore.getState().game?.status === 'active') fetchGame() }, 5000); return () => clearInterval(interval) } }, [gameId, fetchGame])
  useEffect(() => { if (!gameId) return; const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev } }, [gameId])
  if (error && !gameId) return <div className="flex min-h-screen items-center justify-center p-6 text-center bg-[var(--bg)] text-white"><div className="rounded-[2.5rem] bg-[var(--surface)] border border-[var(--border)] p-16 max-w-md shadow-2xl"><h2 className="text-3xl font-black mb-6">⚠️ Arena Error</h2><p className="text-[var(--text-muted)] mb-10 text-lg leading-relaxed">{error}</p><button onClick={() => { localStorage.clear(); window.location.reload() }} className="btn-primary px-12">Restart Application</button></div></div>
  if (!user) return <div className="min-h-screen flex flex-col"><AuthScreen /><AnimatePresence><NotificationToast /></AnimatePresence></div>
  if (!gameId) return <div className="min-h-screen flex flex-col bg-[var(--bg)]"><ModeSelection /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /></div>
  const isGameOver = game && game.status !== 'active'; const isFlipped = game?.game_mode === 'Person' && user?.id === game?.black_player_id
  return (
    <div className="flex h-screen w-full flex-col bg-[var(--bg)] overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-10 py-8 shadow-2xl relative z-50">
        <div className="flex cursor-pointer items-center gap-8 group" onClick={goBackToMenu}><Logo size="md" /><div className="flex flex-col"><span className="text-3xl font-black tracking-tight text-[var(--text-main)] group-hover:text-[#81b64c] transition-colors leading-none">SHAXMAT+</span><span className="text-[11px] font-black tracking-[0.5em] text-[#81b64c] mt-2 leading-none uppercase">Arena</span></div></div>
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end leading-none"><span className="text-sm text-[var(--text-muted)] uppercase font-black mb-1.5 tracking-widest text-[var(--text-main)]">{user.username}</span><span className="text-sm font-mono text-[#81b64c] font-black opacity-70 tracking-widest">ID: {user.public_id}</span></div>
          <button onClick={goBackToMenu} className="btn-secondary !py-2.5 !px-6 text-xs shadow-md">Exit Arena</button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden p-8 gap-12 max-w-[1800px] mx-auto w-full items-stretch">
        <section className="flex flex-1 flex-col items-center justify-center overflow-hidden">
          <div className="flex w-full max-w-[650px] flex-col gap-6">
            <PlayerBadge color={isFlipped ? "white" : "black"} isActive={game?.turn === (isFlipped ? "white" : "black") && !isGameOver} />
            <div className="rounded-2xl bg-[var(--surface-3)] p-1.5 md:p-2 rounded border border-[var(--border)] shadow-[0_40px_120px_rgba(0,0,0,0.9)]"><Board /></div>
            <PlayerBadge color={isFlipped ? "black" : "white"} isActive={game?.turn === (isFlipped ? "black" : "white") && !isGameOver} />
          </div>
        </section>
        <aside className="flex w-[450px] flex-col gap-8 overflow-hidden shrink-0">
          <GameControls />
          <div className="flex flex-1 flex-col gap-8 overflow-hidden"><MoveHistory />{game?.game_mode === 'Person' && <Chat />}</div>
        </aside>
      </main>
      <PromotionModal /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><SearchingModal /><GameOverModal />
    </div>
  )
}
