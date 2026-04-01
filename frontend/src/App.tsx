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

function ModeSelection() {
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const { createGame, user, searchUser, logout, sendInvite, t, fetchLeaderboard, startMatchmaking, setNotification, fetchFriendRequests, fetchNotifications } = useGameStore()

  useEffect(() => { fetchLeaderboard(); fetchFriendRequests(); fetchNotifications(); }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])

  const totalGames = user ? (user.wins + user.losses + user.draws) : 0;
  const winRate = totalGames > 0 ? Math.round((user!.wins / totalGames) * 100) : 0;

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

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 text-[var(--text-main)]">
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--accent-green)] transition-all hover:bg-[var(--surface-2)]"
        >
          {t.howToPlayButton}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="p-10 rounded-[2rem] text-center relative overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-2xl">
            <div className="relative group mx-auto w-fit mb-6 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
              <Avatar src={user?.avatar || '👤'} size="xl" />
              <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><span className="text-[10px] font-black text-white uppercase tracking-widest">Edit</span></div>
            </div>
            <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.4em] mb-1 font-bold">{t.welcome}</div>
            <div className="text-3xl font-black text-[var(--text-main)] uppercase tracking-wider mb-2">{user?.username}</div>
            <div className="inline-block text-[var(--accent-green)] text-[11px] uppercase tracking-widest font-black mb-8 bg-[var(--accent-green)]/10 px-5 py-2 rounded-full border border-[var(--accent-green)]/20">{user ? getUserTitle(user.wins, t) : ''}</div>
            <div className="flex flex-col items-center gap-6">
              <div 
                className="flex items-center gap-4 px-8 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] cursor-pointer hover:bg-[var(--surface-2)] transition-all shadow-inner"
                onClick={() => { navigator.clipboard.writeText(user?.public_id || ''); setNotification({ text: t.idCopied, type: 'success' }); }}
              >
                <span className="text-[var(--accent-green)] font-mono text-2xl font-black tracking-widest">{user?.public_id}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3" className="opacity-50"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-[var(--surface-3)] border border-[var(--border)] rounded-2xl p-5 shadow-inner">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1 font-bold">Win Rate</div>
                  <div className="text-2xl font-black text-green-500">{winRate}%</div>
                </div>
                <div className="bg-[var(--surface-3)] border border-[var(--border)] rounded-2xl p-5 shadow-inner">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1 font-bold">Games</div>
                  <div className="text-2xl font-black text-[var(--text-main)]">{totalGames}</div>
                </div>
              </div>
              <button onClick={logout} className="text-[var(--text-muted)] text-[10px] hover:text-red-500 uppercase tracking-[0.3em] font-black transition-all">{t.logout}</button>
            </div>
          </div>

          <div className="p-10 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] shadow-2xl">
            <div className="mb-10">
              <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-[var(--border)]" />{t.timeControl}<span className="flex-1 h-[1px] bg-[var(--border)]" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[{l:'1m',s:60,i:0},{l:'1+1',s:60,i:1},{l:'3m',s:180,i:0},{l:'3+2',s:180,i:2},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0},{l:'30m',s:1800,i:0}].map(tc => (
                  <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i); }} className={`py-3 rounded text-xs font-black transition-all border ${timeLimit === tc.s && timeIncrement === tc.i ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)] shadow-lg' : 'bg-[var(--surface-3)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-main)]'}`}>{tc.l.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[var(--surface-3)] border border-[var(--border)] shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-black uppercase tracking-widest">🤖 {t.singlePlayer}</span>
                  <div className="flex gap-2">
                    {['easy', 'normal', 'hard'].map(d => <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${difficulty === d ? 'bg-[var(--surface-2)] text-[var(--accent-green)] shadow-sm' : 'opacity-30 hover:opacity-100'}`}>{d}</button>)}
                  </div>
                </div>
                <button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className="btn-primary w-full py-4 rounded-lg">Battle AI</button>
              </div>
              <button onClick={startMatchmaking} className="btn-primary w-full py-6 rounded-lg flex items-center justify-center gap-4 shadow-xl"><span className="text-2xl">🌍</span><span className="text-xl">{t.quickPlay}</span></button>
              <PlayOpponentCard opponentId={opponentId} onOpponentIdChange={setOpponentId} onInviteById={inviteById} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <Leaderboard />
          <LiveGames />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <FriendsList />
            <MatchHistory />
          </div>
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
  if (!friends || !Array.isArray(friends)) return null
  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 flex flex-col shadow-2xl">
      <h3 className="text-sm font-bold text-[var(--text-main)] mb-8 uppercase tracking-widest flex items-center gap-3">👤 {t.friends}</h3>
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar" style={{ maxHeight: '400px' }}>
        {pendingRequests?.map((req) => (
          <div key={req.id} className="p-4 rounded bg-green-500/5 border border-green-500/20 flex items-center justify-between">
            <div className="flex items-center gap-4"><Avatar src={req.from_user.avatar} size="sm" /><div className="text-base font-bold text-[var(--text-main)]">{req.from_user.username}</div></div>
            <button onClick={() => respondToFriendRequest(req.id, true)} className="bg-[var(--accent-green)] text-white p-2 rounded shadow-lg hover:brightness-110"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
          </div>
        ))}
        {friends.length === 0 ? <p className="text-center text-[var(--text-muted)] text-xs uppercase py-10 opacity-30">{t.noFriends}</p> : 
          friends.map((f) => (
            <div key={f.id} className="p-4 rounded hover:bg-[var(--surface-hover)] flex items-center justify-between group transition-all text-[var(--text-main)]">
              <div className="flex items-center gap-4"><div className="relative"><Avatar src={f.avatar} size="sm" />{f.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--surface)]" />}</div><div><div className="text-base font-bold">{f.username}</div><div className="text-xs text-[var(--accent-green)] font-black uppercase tracking-wider">{getUserTitle(f.wins, t)}</div></div></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => sendInvite(f.public_id)} className="text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 p-2 rounded"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>
                <button onClick={() => unfollowUser(f.public_id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function MatchHistory() {
  const { matchHistory, fetchMatchHistory, t, user } = useGameStore()
  const [showAll, setShowAll] = useState(false)
  useEffect(() => { fetchMatchHistory() }, [fetchMatchHistory])
  if (!matchHistory || matchHistory.length === 0) return null
  const displayedHistory = showAll ? matchHistory : matchHistory.slice(0, 5)
  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-2xl">
      <h3 className="text-sm font-bold text-[var(--text-main)] mb-8 uppercase tracking-widest flex items-center gap-3">📜 {t.matchHistory}</h3>
      <div className="space-y-3">{displayedHistory.map((m) => { const isWhite = m.white === user?.username; const didIWin = m.winner === (isWhite ? 'white' : 'black'); const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement'; return ( <div key={m.id} className="p-3 rounded bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-between text-sm"><div className="flex items-center gap-4"><div className="flex -space-x-2"><Avatar src={m.white_avatar} size="sm" /><Avatar src={m.black_avatar} size="sm" /></div><div className="font-bold text-[var(--text-main)] truncate max-w-[100px]">{m.white} vs {m.black}</div></div><div className={`font-black uppercase tracking-wider ${isDraw ? 'opacity-40' : (didIWin ? 'text-green-500' : 'text-red-500')}`}>{isDraw ? t.draw : (didIWin ? t.victory : t.defeat)}</div></div> ); })}</div>
      {matchHistory.length > 5 && <button onClick={() => setShowAll(!showAll)} className="w-full mt-6 text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest hover:brightness-110">{showAll ? t.showLess : t.showMore}</button>}
    </div>
  )
}

function Leaderboard() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || []);
  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-10 shadow-2xl">
      <h3 className="text-lg font-black text-[var(--text-main)] mb-10 uppercase tracking-widest flex items-center gap-3">🏆 {t.leaderboard}</h3>
      <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px] text-[var(--text-main)]"><thead className="text-xs uppercase tracking-widest opacity-40 border-b border-[var(--border)]"><tr><th className="pb-6 px-4 w-12">#</th><th className="pb-6 px-4">{t.player}</th><th className="pb-6 px-4 text-center">{t.wins}</th><th className="pb-6 px-4"></th></tr></thead><tbody className="text-base font-bold">{leaderboard.map((u, index) => { const isMe = u.id === user?.id; const isFollowing = friendIds.has(u.public_id); return ( <tr key={u.id} className={`border-b border-[var(--border)]/50 hover:bg-[var(--surface-hover)] transition-colors ${isMe ? 'bg-[var(--accent-green)]/5' : ''}`}><td className="py-6 px-4 opacity-30 font-mono">{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</td><td className="py-6 px-4 flex items-center gap-6"><div className="relative"><Avatar src={u.avatar} size="sm" />{u.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--surface)]" />}</div><div><div className="flex items-center gap-3 text-lg">{u.username}{isMe && <span className="text-[10px] text-[var(--accent-green)] border border-[var(--accent-green)]/30 px-2 py-0.5 rounded">YOU</span>}</div><div className="text-xs text-[var(--accent-green)] uppercase tracking-widest mt-1">{getUserTitle(u.wins, t)}</div></div></td><td className="py-6 px-4 text-center font-mono text-green-500 text-2xl">{u.wins}</td><td className="py-6 px-4 text-right">{!isMe && !isFollowing && <button onClick={() => { sendFriendRequest(u.public_id); setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' }); }} className="text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 p-3 rounded transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>}</td></tr> ); })}</tbody></table></div>
    </div>
  )
}

function LiveGames() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  if (!liveGames || liveGames.length === 0) return null
  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-2xl"><h3 className="text-sm font-bold text-[var(--text-main)] mb-8 uppercase tracking-widest flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /> {t.liveGames}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{liveGames.map((g) => ( <div key={g.game_id} onClick={() => spectateGame(g.game_id)} className="p-5 rounded-2xl bg-[var(--surface-3)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent-green)] transition-all flex items-center justify-between group shadow-xl"><div className="flex items-center gap-5 text-[var(--text-main)]"><div className="flex -space-x-2"><Avatar src={g.white_avatar} size="sm" /><Avatar src={g.black_avatar} size="sm" /></div><div className="text-lg font-bold truncate max-w-[150px]">{g.white} vs {g.black}</div></div><div className="text-sm font-black text-[var(--accent-green)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Watch</div></div> ))}</div></div>
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
  useEffect(() => { if (gameId) { fetchGame(); const interval = setInterval(() => { if (useGameStore.getState().game?.status === 'active') fetchGame() }, 15000); return () => clearInterval(interval) } }, [gameId, fetchGame])
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

