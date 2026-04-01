import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
import type { Language } from './translations'
import Board from './components/Board'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import PromotionModal from './components/PromotionModal'

function Avatar({ src, size = 'sm' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xl' : 
                    size === 'md' ? 'w-12 h-12 text-2xl' : 
                    size === 'lg' ? 'w-16 h-16 text-4xl' : 
                    'w-24 h-24 text-6xl';
  
  const isImage = src && (src.startsWith('/') || src.startsWith('http'));

  return (
    <div className={`${sizeClass} bg-[var(--surface-hover)] rounded-lg flex items-center justify-center border border-white/5 overflow-hidden shrink-0`}>
      {isImage ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{src || '👨‍🚀'}</span>
      )}
    </div>
  );
}

const AVATARS = ['👨‍🚀', '🥷', '🧙‍♂️', '🧛', '🧟', '🤖', '👾', '👽']

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 24 : size === 'md' ? 32 : 48;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(77,217,232,0.5)]">
      <circle cx="16" cy="6" r="2" fill="var(--accent-cyan)" />
      <circle cx="6" cy="16" r="2" fill="var(--accent-cyan)" />
      <circle cx="26" cy="16" r="2" fill="var(--accent-cyan)" />
      <circle cx="16" cy="26" r="2" fill="var(--accent-cyan)" />
      <path d="M16 6L6 16M16 6L26 16M6 16L16 26M26 16L16 26" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M16 10C14.5 10 13 11.5 13 13C13 14.5 14 15.5 15 16L12 22H20L17 16C18 15.5 19 14.5 19 13C19 11.5 17.5 10 16 10Z" fill="white" />
      <path d="M12 22L11 24H21L20 22H12Z" fill="white" />
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

  const handleGuestLogin = () => {
    const guestUser = {
      id: Date.now(),
      username: "Guest",
      public_id: String(Math.floor(10000000 + Math.random() * 90000000)),
      is_online: true,
      wins: 0,
      losses: 0,
      draws: 0,
      avatar: "👤",
    }
    useGameStore.setState({ user: guestUser, token: "guest-token" })
    localStorage.setItem("shaxmat_user", JSON.stringify(guestUser))
    localStorage.setItem("shaxmat_token", "guest-token")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const url = await uploadAvatar(file)
      if (url) setAvatar(url)
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    if (isLogin) login(username, password)
    else signup(username, password, avatar)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-[var(--bg)]">
      <div className="mb-8 flex gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-10 rounded-[2.5rem] border border-[var(--border)] shadow-2xl relative overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-40" />
        
        <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-[0.2em] mb-1 uppercase">SHAXMAT+</h1>
            <p className="text-[var(--text-muted)] text-[10px] tracking-[0.4em] uppercase font-bold">{t.subtitle}</p>
        </div>

        <div className="flex mb-10 bg-[var(--bg)] p-1.5 rounded-2xl border border-[var(--border)]">
            <button 
                onClick={() => { setIsLogin(true); clearAuthError(); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-[var(--accent-cyan)] text-black shadow-lg shadow-[var(--accent-cyan)]/20' : 'text-[var(--text-muted)]'}`}
            >
                {t.login}
            </button>
            <button 
                onClick={() => { setIsLogin(false); clearAuthError(); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-[var(--accent-cyan)] text-black shadow-lg shadow-[var(--accent-cyan)]/20' : 'text-[var(--text-muted)]'}`}
            >
                {t.signup}
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4">
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black ml-1">{t.chooseAvatar}</label>
                <div className="flex items-center gap-4 bg-[var(--bg)] p-4 rounded-2xl border border-[var(--border)]">
                  <Avatar src={avatar} size="md" />
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-[10px] font-black text-[var(--accent-cyan)] uppercase tracking-widest border border-[var(--accent-cyan)]/20 px-4 py-2.5 rounded-xl bg-[var(--accent-cyan)]/5 hover:bg-[var(--accent-cyan)]/10 transition-all w-full"
                    >
                      {isUploading ? t.uploading : t.uploadPhoto}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                </div>
                <div className="flex gap-2 justify-between bg-[var(--bg)] p-2.5 rounded-2xl border border-[var(--border)]">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`text-xl p-2 rounded-xl transition-all ${avatar === a ? 'bg-[var(--accent-cyan)]/20 scale-110' : 'opacity-40 hover:opacity-100'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black mb-2 ml-1">{t.username}</label>
                <input 
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)] transition-all"
                    placeholder={t.enterUsername}
                />
            </div>
            <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black mb-2 ml-1">{t.password}</label>
                <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)] transition-all"
                    placeholder="••••••••"
                />
            </div>
            
            {authError && <p className="text-[var(--check-red)] text-xs text-center font-bold bg-[var(--check-red)]/10 py-3 rounded-xl border border-[var(--check-red)]/20">{authError}</p>}

            <button 
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-5 bg-[var(--accent-cyan)] text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-xl shadow-[var(--accent-cyan)]/20"
            >
                {loading ? t.processing : (isLogin ? t.signIn : t.createAccount)}
            </button>
            <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-4 bg-transparent text-[var(--text-muted)] border border-[var(--border)] font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:text-[var(--text-main)] hover:border-[var(--text-muted)] transition-all"
            >
                Play As Guest
            </button>
        </form>
      </motion.div>
    </div>
  )
}

function FriendsList() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [fetchFriends, fetchFriendRequests])
  if (!friends || !Array.isArray(friends)) return null
  return (
    <div className="w-full h-full">
      <div className="rounded-[2rem] p-6 h-full flex flex-col" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-black text-[var(--text-main)] mb-6 uppercase tracking-widest flex items-center gap-3">
          <span className="text-[var(--accent-cyan)]">👥</span> {t.friends}
        </h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar" style={{ maxHeight: '400px' }}>
          {pendingRequests && pendingRequests.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="text-[9px] text-[var(--accent-cyan)] font-black uppercase tracking-[0.3em] mb-2">{t.friendRequest} ({pendingRequests.length})</div>
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-3 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.from_user.avatar} size="sm" />
                    <div className="text-xs font-bold text-[var(--text-main)] truncate max-w-[80px]">{req.from_user.username}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respondToFriendRequest(req.id, false)} className="p-1.5 rounded-lg bg-[var(--check-red)]/10 text-[var(--check-red)] hover:bg-[var(--check-red)] hover:text-white transition-all"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    <button onClick={() => respondToFriendRequest(req.id, true)} className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                  </div>
                </div>
              ))}
              <div className="border-b border-[var(--border)] pt-2" />
            </div>
          )}
          {friends.length === 0 ? ( <p className="text-center text-[var(--text-muted)] text-[10px] uppercase tracking-widest py-8">{t.noFriends}</p> ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-between group transition-all hover:border-[var(--accent-cyan)]/30">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar src={f.avatar} size="sm" />
                      {f.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-[var(--surface)]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-main)] truncate max-w-[100px]">{f.username}</div>
                      <div className="text-[9px] text-[var(--accent-cyan)] font-black uppercase tracking-tighter">{getUserTitle(f.wins, t)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    {f.is_online && ( <button onClick={() => sendInvite(f.public_id)} className="p-1.5 rounded-lg bg-[var(--accent-cyan)] text-black hover:brightness-110" title={t.inviteFriend}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button> )}
                    <button onClick={() => unfollowUser(f.public_id)} className="p-1.5 rounded-lg bg-[var(--check-red)]/10 text-[var(--check-red)] border border-[var(--check-red)]/20 hover:bg-[var(--check-red)] hover:text-white transition-all" title={t.unfollow}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
    <div className="w-full">
      <div className="rounded-[2rem] p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-black text-[var(--text-main)] mb-6 uppercase tracking-widest flex items-center gap-3">
          <span className="text-[var(--accent-cyan)]">📜</span> {t.matchHistory}
        </h3>
        <div className="space-y-2">
          {displayedHistory.map((m) => {
            const isWhite = m.white === user?.username;
            const didIWin = m.winner === (isWhite ? 'white' : 'black');
            const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement';
            return (
              <div key={m.id} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-between transition-all hover:border-[var(--accent-cyan)]/20">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <Avatar src={m.white_avatar} size="sm" />
                    <Avatar src={m.black_avatar} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text-main)] truncate max-w-[120px]">{m.white} <span className="opacity-40">vs</span> {m.black}</div>
                    <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{m.date}</div>
                  </div>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${isDraw ? 'text-[var(--text-muted)]' : (didIWin ? 'text-green-400' : 'text-[var(--check-red)]')}`}>
                  {isDraw ? t.draw : (didIWin ? t.victory : t.defeat)}
                </div>
              </div>
            );
          })}
        </div>
        {matchHistory.length > 5 && ( <button onClick={() => setShowAll(!showAll)} className="w-full mt-4 py-2 text-[9px] font-black text-[var(--accent-cyan)] uppercase tracking-[0.3em] bg-[var(--accent-cyan)]/5 rounded-lg border border-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/10 transition-all">{showAll ? t.showLess : t.showMore}</button> )}
      </div>
    </div>
  )
}

function LiveGames() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  if (!liveGames || liveGames.length === 0) return null
  return (
    <div className="w-full">
      <div className="rounded-[2rem] p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-black text-[var(--text-main)] mb-6 uppercase tracking-widest flex items-center gap-3">
          <span className="text-[var(--check-red)] animate-pulse">●</span> {t.liveGames}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {liveGames.map((g) => (
            <motion.div key={g.game_id} whileHover={{ scale: 1.02 }} onClick={() => spectateGame(g.game_id)} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer flex items-center justify-between group transition-all hover:border-[var(--accent-cyan)]/40">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  <Avatar src={g.white_avatar} size="sm" />
                  <Avatar src={g.black_avatar} size="sm" />
                </div>
                <div>
                  <div className="text-xs text-[var(--text-main)] font-bold">{g.white} vs {g.black}</div>
                  <div className="text-[var(--text-muted)] uppercase tracking-widest text-[9px]">{g.move_count} {t.move}s</div>
                </div>
              </div>
              <div className="text-[10px] font-black text-[var(--accent-cyan)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">{t.spectate}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Leaderboard() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || []);
  return (
    <div className="w-full">
      <div className="rounded-[2rem] p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-black text-[var(--text-main)] mb-6 uppercase tracking-widest flex items-center gap-3">
          <span className="text-[var(--accent-cyan)]">🏆</span> {t.leaderboard}
        </h3>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm text-left min-w-[450px]">
            <thead className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="py-3 w-12">{t.rank}</th>
                <th className="py-3">{t.player}</th>
                <th className="py-3 text-center">{t.wins}</th>
                <th className="py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, index) => {
                const isMe = u.id === user?.id;
                const isFollowing = friendIds.has(u.public_id);
                return (
                  <tr key={u.id} className={`border-b border-[var(--border)]/30 transition-colors ${isMe ? 'bg-[var(--accent-cyan)]/5' : 'hover:bg-[var(--surface-hover)]'}`}>
                    <td className="py-3 font-mono font-bold text-[var(--text-main)] text-xs">{index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}</td>
                    <td className="py-3 flex items-center gap-3">
                      <div className="relative">
                        <Avatar src={u.avatar} size="sm" />
                        {u.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-[var(--surface)]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--text-main)] text-xs flex items-center gap-2 truncate">
                          {u.username}
                          {isMe && <span className="text-[8px] px-1 py-0.5 rounded bg-[var(--accent-cyan)] text-black font-black uppercase">YOU</span>}
                        </div>
                        <div className="text-[9px] text-[var(--accent-cyan)] font-black uppercase tracking-widest">{getUserTitle(u.wins, t)}</div>
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono text-green-400 text-xs font-bold">{u.wins}</td>
                    <td className="py-3 text-right">
                      {!isMe && !isFollowing && ( <button onClick={() => { sendFriendRequest(u.public_id); setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' }); }} className="p-1.5 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)] hover:text-black transition-all"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button> )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const TIME_CONTROLS = [
  { label: '1 min', seconds: 60, increment: 0 },
  { label: '1+1', seconds: 60, increment: 1 },
  { label: '3 min', seconds: 180, increment: 0 },
  { label: '3+2', seconds: 180, increment: 2 },
  { label: '5 min', seconds: 300, increment: 0 },
  { label: '10 min', seconds: 600, increment: 0 },
  { label: '30 min', seconds: 1800, increment: 0 },
]

function TimeSelector({ value, onChange }: { value: number; onChange: (s: number, i: number) => void }) {
  const current = TIME_CONTROLS.find(t => t.seconds === value) || TIME_CONTROLS[5]
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
      {TIME_CONTROLS.map((t) => (
        <button
          key={t.label}
          onClick={() => onChange(t.seconds, t.increment)}
          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            current.label === t.label 
              ? 'bg-[var(--accent-cyan)] text-black border-[var(--accent-cyan)] shadow-[0_4px_12px_rgba(77,217,232,0.3)]' 
              : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function ModeSelection() {
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [foundUser, setFoundUser] = useState<any>(null)
  const { createGame, user, searchUser, logout, sendInvite, t, fetchLeaderboard, startMatchmaking, setNotification, fetchFriendRequests, fetchNotifications } = useGameStore()

  useEffect(() => { fetchLeaderboard(); fetchFriendRequests(); fetchNotifications(); }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])

  const totalGames = user ? (user.wins + user.losses + user.draws) : 0;
  const winRate = totalGames > 0 ? Math.round((user!.wins / totalGames) * 100) : 0;

  const handleSearch = async () => {
    if (opponentId.length === 8) {
      if (opponentId === user?.public_id) { setNotification({ text: t.selfPlayError, type: 'error' }); return }
      const target = await searchUser(opponentId)
      if (target) setFoundUser(target)
      else { setNotification({ text: t.userNotFound, type: 'error' }); setFoundUser(null) }
    }
  }

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
      <div className="flex justify-center mb-10 gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile & Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-30" />
            <div className="relative group mx-auto w-fit mb-6 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
              <Avatar src={user?.avatar || '👨‍🚀'} size="xl" />
              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all border border-[var(--accent-cyan)]/30"><span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">Edit</span></div>
            </div>
            <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.4em] mb-1 font-black">{t.welcome}</div>
            <div className="text-3xl font-black text-[var(--text-main)] uppercase tracking-wider mb-2">{user?.username}</div>
            <div className="inline-block text-[var(--accent-cyan)] text-[11px] uppercase tracking-widest font-black mb-8 bg-[var(--accent-cyan)]/10 px-5 py-2 rounded-full border border-[var(--accent-cyan)]/20">{user ? getUserTitle(user.wins, t) : ''}</div>
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.3em] mb-3">{t.yourID}</span>
                <div className="flex items-center gap-4 px-8 py-3 rounded-2xl border border-[var(--accent-cyan)]/20 bg-[var(--bg)] cursor-pointer hover:bg-[var(--surface-hover)] transition-all shadow-inner" onClick={() => { navigator.clipboard.writeText(user?.public_id || ''); setNotification({ text: t.idCopied, type: 'success' }); }}>
                  <span className="text-[var(--accent-cyan)] font-mono text-2xl font-black tracking-widest">{user?.public_id}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 text-center shadow-inner">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1 font-black">{t.winRate}</div>
                  <div className="text-2xl font-black text-[var(--accent-cyan)]">{winRate}%</div>
                </div>
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 text-center shadow-inner">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1 font-black">{t.totalGames}</div>
                  <div className="text-2xl font-black text-[var(--text-main)]">{totalGames}</div>
                </div>
              </div>
              <button onClick={logout} className="text-[var(--text-muted)] text-[10px] hover:text-[var(--check-red)] uppercase tracking-[0.3em] font-black border-b border-transparent hover:border-[var(--check-red)] pb-1 transition-all">{t.logout}</button>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] shadow-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="mb-10">
              <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-[var(--border)]" />{t.timeControl}<span className="flex-1 h-[1px] bg-[var(--border)]" />
              </div>
              <TimeSelector value={timeLimit} onChange={(s, i) => { setTimeLimit(s); setTimeIncrement(i); }} />
            </div>
            <div className="space-y-5">
              <div className="p-6 rounded-[2rem] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent-cyan)]/30 transition-all shadow-inner">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-[var(--accent-cyan)]/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[var(--accent-cyan)]/10">🤖</div>
                  <div className="flex-1 text-left">
                    <div className="text-xl font-black text-[var(--text-main)] uppercase tracking-widest leading-none mb-1">{t.singlePlayer}</div>
                    <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-black">{t.practiceAI}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2 bg-[var(--surface)] p-1.5 rounded-xl border border-[var(--border)]">
                    {['easy', 'normal', 'hard'].map(d => (
                      <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-[var(--accent-cyan)] text-black shadow-lg shadow-[var(--accent-cyan)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>{(t as any)[d]}</button>
                    ))}
                  </div>
                  <button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className="w-full py-4 bg-[var(--accent-cyan)] text-black font-black rounded-xl uppercase tracking-[0.2em] text-[10px] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[var(--accent-cyan)]/20">Start AI Battle</button>
                </div>
              </div>
              <button onClick={startMatchmaking} className="w-full p-6 rounded-[2rem] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent-cyan)]/30 transition-all flex items-center gap-5 group shadow-inner">
                <div className="w-14 h-14 bg-[var(--accent-cyan)]/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-[var(--accent-cyan)]/10">🌍</div>
                <div className="text-left flex-1">
                  <div className="text-xl font-black text-[var(--text-main)] uppercase tracking-widest leading-none mb-1">{t.quickPlay}</div>
                  <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-black">{t.searching}</div>
                </div>
                <div className="text-[var(--accent-cyan)] text-2xl font-black group-hover:translate-x-1 transition-transform">→</div>
              </button>
              <div className="p-6 rounded-[2rem] bg-[var(--bg)] border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-[var(--accent-cyan)]/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[var(--accent-cyan)]/10">👤</div>
                  <div className="flex-1 text-left">
                    <div className="text-xl font-black text-[var(--text-main)] uppercase tracking-widest leading-none mb-1">{t.multiplayer}</div>
                    <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-black">{t.playPerson}</div>
                  </div>
                </div>
                {!foundUser ? (
                  <div className="flex gap-2">
                    <input type="text" maxLength={8} value={opponentId} onChange={e => setOpponentId(e.target.value.replace(/\D/g, ''))} placeholder={t.opponentID} className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-center font-mono text-sm outline-none focus:border-[var(--accent-cyan)] tracking-[0.2em] shadow-inner" />
                    <button onClick={handleSearch} className="bg-[var(--accent-cyan)] text-black px-8 py-4 rounded-xl font-black uppercase hover:brightness-110 active:scale-95 transition-all text-[10px] shadow-lg shadow-[var(--accent-cyan)]/20">{t.go}</button>
                  </div>
                ) : (
                  <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--accent-cyan)]/30 shadow-inner">
                    <div className="flex items-center gap-4 mb-5">
                      <Avatar src={foundUser.avatar} size="md" />
                      <div className="text-left"><div className="text-sm font-bold text-[var(--text-main)]">{foundUser.username}</div><div className="text-[10px] text-[var(--text-muted)] font-mono uppercase font-black">ID: {foundUser.public_id}</div></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => sendInvite(foundUser.public_id, timeLimit, timeIncrement)} className="flex-1 py-3.5 bg-[var(--accent-cyan)] text-black font-black text-[10px] uppercase rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-cyan)]/20">{t.inviteFriend}</button>
                      <button onClick={() => { setFoundUser(null); setOpponentId(''); }} className="p-3.5 bg-[var(--check-red)]/10 text-[var(--check-red)] rounded-xl hover:bg-[var(--check-red)] hover:text-white transition-all">✕</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Social & Lists */}
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
    </div>
  )
}

function ViewSwitcher() {
  const { viewMode, setViewMode, t, setNotification } = useGameStore()
  return (
    <div className="flex p-1 rounded-full bg-[var(--surface-hover)] border border-white/5 relative">
      <div className="absolute h-[calc(100%-8px)] rounded-full bg-white shadow-lg transition-all duration-300" style={{ width: 'calc(50% - 4px)', left: viewMode === '2d' ? '4px' : 'calc(50%)', display: viewMode === '2d' ? 'block' : 'none' }} />
      <button onClick={() => setViewMode('2d')} className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${viewMode === '2d' ? 'text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>2D</button>
      <button onClick={() => setNotification({ text: t.comingSoon, type: 'info' })} className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-black transition-all text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1`}>3D<span className="w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full animate-pulse" /></button>
    </div>
  )
}

function LanguageSwitcher() {
  const { language, setLanguage } = useGameStore()
  const langs: { id: Language; label: string; flag: string }[] = [{ id: 'uz', label: 'UZ', flag: '🇺🇿' }, { id: 'ru', label: 'RU', flag: '🇷🇺' }, { id: 'en', label: 'EN', flag: '🇺🇸' }]
  const activeIdx = langs.findIndex(l => l.id === language)
  return (
    <div className="flex p-1.5 rounded-full bg-[var(--surface-hover)] border border-white/5 relative">
      <motion.div className="absolute h-[calc(100%-12px)] rounded-full bg-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/30" animate={{ x: activeIdx * 56, width: 56 }} style={{ left: '6px' }} />
      {langs.map(l => (
        <button key={l.id} onClick={() => setLanguage(l.id)} className={`relative z-10 w-14 py-2 rounded-full text-[10px] font-black transition-colors flex items-center justify-center gap-1.5 ${language === l.id ? 'text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><span className="text-sm">{l.flag}</span>{l.label}</button>
      ))}
    </div>
  )
}

function CapturedPieces({ pieces, color }: { pieces: string[]; color: 'white' | 'black' }) {
  if (!pieces || pieces.length === 0) return null;
  return ( <div className="flex flex-wrap gap-1 mt-1 opacity-60">{pieces.map((p, i) => ( <span key={i} className={`text-xs ${color === 'white' ? 'text-[var(--text-main)]' : 'text-[var(--accent-cyan)]'}`}>{p}</span> ))}</div> );
}

function ChessClock({ timeLeft, isActive, color }: { timeLeft: number; isActive: boolean; color: 'white' | 'black' }) {
  const [seconds, setSeconds] = useState(timeLeft)
  const isWhite = color === 'white'
  useEffect(() => { setSeconds(timeLeft) }, [timeLeft])
  useEffect(() => {
    let interval: any = null
    if (isActive && seconds > 0) {
      interval = setInterval(() => { setSeconds(s => { if (s <= 1) { useGameStore.getState().fetchGame(); return 0 }; return s - 1 }) }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, seconds])
  const formatTime = (s: number) => { const mins = Math.floor(s / 60); const secs = s % 60; return `${mins}:${secs.toString().padStart(2, '0')}` }
  const isLowTime = seconds < 30
  return (
    <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-black transition-all duration-300 flex items-center gap-2 ${isActive ? (isLowTime ? 'bg-[var(--check-red)] text-white animate-pulse' : (isWhite ? 'bg-white text-black' : 'bg-[var(--accent-cyan)] text-black')) : 'bg-[var(--surface-hover)] text-[var(--text-muted)] border border-white/5'}`}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>{formatTime(seconds)}</div>
  )
}

function PlayerBadge({ color, isActive }: { color: 'white' | 'black'; isActive: boolean }) {
  const { t, game } = useGameStore()
  const isWhite = color === 'white'
  const capturedPieces = game?.captured_pieces?.[color] || []
  const avatar = isWhite ? game?.white_avatar : game?.black_avatar
  const timeLeft = isWhite ? (game?.white_time_left || 0) : (game?.black_time_left || 0)
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 shadow-inner" style={{ background: isActive ? (isWhite ? 'rgba(255,255,255,0.08)' : 'rgba(77,217,232,0.08)') : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? (isWhite ? 'rgba(255,255,255,0.2)' : 'rgba(77,217,232,0.2)') : 'rgba(255,255,255,0.05)'}` }}>
      <Avatar src={avatar || (isWhite ? '♔' : '♚')} size="sm" />
      <div className="flex-1 min-w-0"><div className="text-sm font-black uppercase tracking-widest truncate" style={{ color: isWhite ? 'var(--text-main)' : 'var(--accent-cyan)' }}>{isWhite ? t.white : t.black}</div><CapturedPieces pieces={capturedPieces} color={color} /></div>
      <ChessClock timeLeft={timeLeft} isActive={isActive} color={color} />
    </div>
  )
}

function InviteModal() {
  const inviteRequest = useGameStore(s => s.inviteRequest)
  const respondToInvite = useGameStore(s => s.respondToInvite)
  const t = useGameStore(s => s.t)
  if (!inviteRequest) return null
  const formatTC = (s?: number, i?: number) => { if (!s) return '10 min'; const mins = s / 60; return i ? `${mins}+${i}` : `${mins} min` }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full p-10 rounded-[3rem] text-center border border-[var(--accent-cyan)]/30 shadow-2xl shadow-[var(--accent-cyan)]/10" style={{ background: 'var(--surface)' }}>
        <div className="text-5xl mb-6">🎮</div>
        <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-3">Game invitation</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4"><span className="text-[var(--accent-cyan)] font-black uppercase">{inviteRequest.from_username}</span> challenged you!</p>
        <div className="mb-8 px-6 py-3 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 rounded-2xl inline-block shadow-inner"><span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mr-3 font-black">Time:</span><span className="text-sm font-black text-[var(--accent-cyan)] uppercase">{formatTC(inviteRequest.time_limit, inviteRequest.time_increment)}</span></div>
        <div className="flex gap-4"><button onClick={() => respondToInvite(false)} className="flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all">{t.decline}</button><button onClick={() => respondToInvite(true)} className="flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--accent-cyan)] text-black hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-cyan)]/20">{t.accept}</button></div>
      </motion.div>
    </div>
  )
}

function Chat() {
  const { chatMessages, sendChatMessage, user } = useGameStore()
  const [text, setText] = useState('')
  const chatListRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (chatListRef.current) chatListRef.current.scrollTop = chatListRef.current.scrollHeight }, [chatMessages])
  const handleSend = (e: React.FormEvent) => { e.preventDefault(); if (text.trim()) { sendChatMessage(text); setText('') } }
  return (
    <div className="flex flex-col h-[350px] rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-2xl" style={{ background: 'var(--surface)' }}>
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)] shadow-sm"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Live Chat</span><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /></div>
      <div ref={chatListRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth custom-scrollbar">
        {chatMessages.length === 0 ? ( <div className="h-full flex items-center justify-center text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black text-center px-6 leading-relaxed">No messages yet. Say hi!</div> ) : (
          chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.from === user?.username ? 'items-end' : 'items-start'}`}><span className="text-[9px] text-[var(--text-muted)] mb-1.5 px-2 font-black uppercase tracking-widest">{msg.from}</span><div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs shadow-sm ${msg.from === user?.username ? 'bg-[var(--accent-cyan)] text-black font-bold rounded-tr-none' : 'bg-[var(--surface-2)] text-[var(--text-main)] rounded-tl-none border border-[var(--border)] shadow-inner'}`}>{msg.text}</div></div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} className="p-4 bg-[var(--bg)] border-t border-[var(--border)] flex gap-3 shadow-inner"><input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type message..." className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)] transition-all shadow-inner" /><button type="submit" className="bg-[var(--accent-cyan)] text-black p-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--accent-cyan)]/20"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></form>
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  const bg = notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-[var(--check-red)]' : 'bg-[var(--accent-cyan)]';
  return ( <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} onClick={() => setNotification(null)} className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl text-black font-black text-xs uppercase tracking-widest shadow-2xl cursor-pointer shadow-black/50 ${bg}`}>{notification.text}</motion.div> )
}

function NotificationCenter() {
  const { notifications, unreadCount, fetchNotifications, markNotificationRead, t } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => { fetchNotifications(); const interval = setInterval(fetchNotifications, 30000); return () => clearInterval(interval); }, [fetchNotifications])
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2.5 rounded-xl bg-[var(--surface-hover)] border border-white/5 hover:bg-[var(--surface-2)] transition-all group"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>{unreadCount > 0 && ( <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--check-red)] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg)] shadow-lg">{unreadCount}</span> )}</button>
      <AnimatePresence>{isOpen && ( <> <div className="fixed inset-0 z-[140]" onClick={() => setIsOpen(false)} /> <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }} className="absolute right-0 mt-4 w-85 max-h-[450px] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[150]"><div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)] shadow-sm"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{t.notifications}</span>{unreadCount > 0 && <span className="text-[9px] text-[var(--accent-cyan)] font-black uppercase">{unreadCount} new</span>}</div><div className="overflow-y-auto max-h-[380px] custom-scrollbar">{notifications.length === 0 ? ( <div className="p-12 text-center text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black">No messages</div> ) : ( notifications.map((n) => ( <div key={n.id} onClick={() => !n.is_read && markNotificationRead(n.id)} className={`p-5 border-b border-[var(--border)]/50 cursor-pointer transition-all ${!n.is_read ? 'bg-[var(--accent-cyan)]/5' : 'opacity-50 hover:opacity-100'}`}><div className="text-xs text-[var(--text-main)] mb-2 leading-relaxed">{n.text}</div><div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-black">{new Date(n.created_at).toLocaleString()}</div></div> )) )}</div></motion.div> </> )}</AnimatePresence>
    </div>
  )
}

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, t, uploadAvatar, updateProfile } = useGameStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  if (!isOpen || !user) return null
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setIsUploading(true); const url = await uploadAvatar(file); if (url) await updateProfile(url); setIsUploading(false) }
  }
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 rounded-[3rem] border border-[var(--border)] bg-[var(--surface)] relative shadow-2xl"><button onClick={onClose} className="absolute top-8 right-8 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">✕</button><h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-10 text-center">{t.editProfile}</h2><div className="flex flex-col items-center gap-8"><Avatar src={user.avatar} size="xl" /><div className="w-full space-y-5"><button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full py-4 bg-[var(--accent-cyan)] text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-cyan)]/20">{isUploading ? '...' : t.chooseAvatar}</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" /><div className="grid grid-cols-4 gap-3">{AVATARS.map(a => ( <button key={a} onClick={() => updateProfile(a)} className={`text-2xl p-4 rounded-2xl bg-[var(--bg)] border ${user.avatar === a ? 'border-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/10' : 'border-[var(--border)]'} hover:border-[var(--text-muted)] transition-all shadow-inner`}>{a}</button> ))}</div></div></div></motion.div>
    </div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, matchedOpponent, matchOffer, sendMatchStart, acceptMatchOffer, t } = useGameStore()
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const [sentOffer, setSentOffer] = useState(false)
  if (!isSearching) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full p-12 rounded-[3rem] text-center border border-[var(--accent-cyan)]/20 bg-[var(--surface)] shadow-[0_20px_80px_rgba(0,0,0,0.8)] shadow-[var(--accent-cyan)]/5">
        {!matchedOpponent ? ( <> <div className="relative w-28 h-24 mx-auto mb-10"><motion.div className="absolute inset-0 rounded-full border-4 border-[var(--accent-cyan)]/10" /><motion.div className="absolute inset-0 rounded-full border-4 border-t-[var(--accent-cyan)] border-r-transparent border-b-transparent border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} /><div className="absolute inset-0 flex items-center justify-center text-4xl shadow-inner">🌍</div></div> <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-3">{t.searching}</h2> <p className="text-[var(--text-muted)] text-[10px] mb-10 uppercase tracking-[0.4em] font-black">Global Arena</p> </> ) : (
          <div className="space-y-8">
            <div className="text-[10px] font-black text-[var(--accent-cyan)] uppercase tracking-[0.5em] mb-6">{t.matchFound}</div>
            <div className="flex items-center justify-center gap-8 py-6 bg-[var(--bg)] rounded-[2rem] shadow-inner border border-[var(--border)]">
              <div className="flex flex-col items-center gap-3"><Avatar src={useGameStore.getState().user?.avatar || '👨‍🚀'} size="lg" /><span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">{t.player}</span></div>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl font-black text-[var(--accent-cyan)] drop-shadow-[0_0_10px_rgba(77,217,232,0.5)]">VS</motion.div>
              <div className="flex flex-col items-center gap-3"><Avatar src={matchedOpponent.avatar} size="lg" /><span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest truncate max-w-[80px]">{matchedOpponent.username}</span></div>
            </div>
            {matchOffer ? (
              <div className="bg-[var(--accent-cyan)]/10 p-8 rounded-[2rem] border border-[var(--accent-cyan)]/20 shadow-inner">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-4 font-black">{t.opponentProposed}</div>
                <div className="text-3xl font-black text-[var(--text-main)] mb-8 tracking-widest">{matchOffer.time_limit / 60}{matchOffer.time_increment ? ` + ${matchOffer.time_increment}` : ' min'}</div>
                <button onClick={acceptMatchOffer} className="w-full py-5 bg-[var(--accent-cyan)] text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[var(--accent-cyan)]/20">{t.acceptAndStart}</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] mb-2">{t.timeControl}</div>
                <TimeSelector value={timeLimit} onChange={(s, i) => { setTimeLimit(s); setTimeIncrement(i); }} />
                <button onClick={() => { sendMatchStart(matchedOpponent.public_id, timeLimit, timeIncrement); setSentOffer(true); }} disabled={sentOffer} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl ${sentOffer ? 'bg-[var(--surface-hover)] text-[var(--text-muted)]' : 'bg-[var(--accent-cyan)] text-black shadow-[var(--accent-cyan)]/20'}`}>{sentOffer ? t.waitingResponse : t.challengeOpponent}</button>
              </div>
            )}
          </div>
        )}
        <button onClick={() => { cancelMatchmaking(); setSentOffer(false); }} className="w-full mt-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all">{t.cancel}</button>
      </motion.div>
    </div>
  )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode, isSpectator } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null
  const isDraw = game.status.startsWith('draw') || game.status === 'stalemate' || game.status === 'draw_agreement'
  if (isSpectator) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="max-w-md w-full p-12 rounded-[3rem] text-center border border-white/10 bg-[var(--surface)] shadow-2xl">
          <div className="text-8xl mb-8 shadow-inner">{isDraw ? '🤝' : '🏁'}</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-3 text-[var(--text-main)]">{isDraw ? t.draw : t.gameOver}</h2>
          <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed uppercase tracking-widest font-black">{isDraw ? t.stalemate : (game.winner === 'white' ? (game.white_avatar + ' ' + t.white) : (game.black_avatar + ' ' + t.black)) + ' ' + t.victory.toLowerCase()}</p>
          <button onClick={goBackToMenu} className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all active:scale-95 shadow-xl">{t.backToMenu}</button>
        </motion.div>
      </div>
    )
  }
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  let message = isWinner ? t.congratulations : (isDraw ? t.stalemate : t.betterLuck)
  if (game.status === 'resigned') message = t.opponentLeft.replace('{name}', opponentResignedName || '')
  else if (game.status === 'timeout') message = game.winner === 'white' ? 'White won by timeout' : 'Black won by timeout'
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.8, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="max-w-md w-full p-12 rounded-[3rem] text-center relative overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,0.8)]" style={{ background: 'var(--surface)', border: `2px solid ${isWinner ? 'var(--accent-cyan)' : (isDraw ? 'var(--text-muted)' : 'var(--check-red)')}` }}>
        {isWinner && ( <div className="absolute inset-0 pointer-events-none opacity-50"> {[...Array(15)].map((_, i) => ( <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-[var(--accent-cyan)]" initial={{ x: '50%', y: '50%', opacity: 1 }} animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0, scale: 0.5 }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }} /> ))} </div> )}
        <div className="text-8xl mb-8 drop-shadow-2xl">{isWinner ? '🏆' : (isDraw ? '🤝' : '💀')}</div>
        <h2 className={`text-5xl font-black uppercase tracking-tighter mb-3 ${isWinner ? 'text-[var(--accent-cyan)]' : (isDraw ? 'text-gray-300' : 'text-[var(--check-red)]')}`}>{isWinner ? t.victory : (isDraw ? t.draw : t.defeat)}</h2>
        <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed font-black uppercase tracking-widest px-6">{message}</p>
        <div className="flex flex-col gap-4 relative z-10">
          <button onClick={() => useGameStore.getState().startReview()} className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-[var(--accent-cyan)] text-black hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-[var(--accent-cyan)]/20">{t.reviewGame}</button>
          <button onClick={goBackToMenu} className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-[var(--surface-hover)] text-[var(--text-main)] hover:bg-[var(--surface-2)] transition-all active:scale-95 border border-white/5">{t.backToMenu}</button>
        </div>
      </motion.div>
    </div>
  )
}

function GameInfo() {
  const { game, user, t, isSpectator } = useGameStore()
  if (!game || !user) return null
  if (isSpectator) return ( <div className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center mb-4 shadow-inner"><span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mr-3 font-black">{t.watching}</span><span className="text-xs font-black text-red-500 uppercase tracking-widest animate-pulse">LIVE</span></div> )
  let userColor = (game.game_mode === 'AI') ? t.white : (user.id === game.white_player_id ? t.white : t.black)
  return ( <div className="px-6 py-3 rounded-2xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/20 text-center mb-4 shadow-inner"><span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mr-3 font-black">{t.playingAs}</span><span className="text-xs font-black text-[var(--accent-cyan)] uppercase tracking-widest">{userColor}</span></div> )
}

function ThemeSwitcher() {
  const { uiTheme, setUiTheme, t } = useGameStore()
  const isDark = uiTheme === 'dark'
  return (
    <div className="flex items-center p-1.5 rounded-full bg-[var(--surface-hover)] border border-white/5 relative w-24 h-12 cursor-pointer group shadow-inner" onClick={() => setUiTheme(isDark ? 'light' : 'dark')} title={isDark ? t.lightMode : t.darkMode}>
      <motion.div className="absolute w-9 h-9 rounded-full bg-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/40 flex items-center justify-center z-10" animate={{ x: isDark ? 0 : 48 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>{isDark ? ( <svg width="18" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> ) : ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> )}</motion.div>
      <div className="flex justify-between w-full px-3 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg></div>
    </div>
  )
}

export default function App() {
  const { user, gameId, game, fetchGame, error, initSocket, goBackToMenu, t, setLanguage, isSpectator, uiTheme } = useGameStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme)
    const saved = localStorage.getItem('shaxmat_user'), token = localStorage.getItem('shaxmat_token'), savedGameId = localStorage.getItem('shaxmat_game_id'), savedIsSpectator = localStorage.getItem('shaxmat_spectator') === 'true', savedLang = localStorage.getItem('shaxmat_lang') as Language
    if (savedLang) setLanguage(savedLang)
    if (saved && token && !user) {
      const u = JSON.parse(saved); useGameStore.setState({ user: u, token: token, isSpectator: savedIsSpectator }); initSocket(u.public_id)
      if (savedGameId) { const gid = parseInt(savedGameId, 10); useGameStore.setState({ gameId: gid }) }
    }
  }, [user, initSocket, setLanguage, uiTheme])
  useEffect(() => { if (gameId) { fetchGame(); const interval = setInterval(() => { if (useGameStore.getState().game?.status === 'active') fetchGame() }, 15000); return () => clearInterval(interval) } }, [gameId, fetchGame])
  if (error && !gameId) return ( <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]"><div className="max-w-md w-full p-10 rounded-[2.5rem] bg-[var(--check-red)]/10 border border-[var(--check-red)]/20 text-center shadow-2xl"><div className="text-6xl mb-6 drop-shadow-lg">⚠️</div><h2 className="text-2xl font-black text-[var(--text-main)] mb-3 uppercase tracking-[0.2em]">Error</h2><p className="text-[var(--check-red)] text-sm mb-8 leading-relaxed font-bold uppercase tracking-widest">{error}</p><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-[0.2em] text-xs shadow-xl">Reset App</button></div></div> )
  if (!user) return ( <div className="min-h-screen flex flex-col"><AuthScreen /><InviteModal /><NotificationToast /></div> )
  if (!gameId) return ( <div className="min-h-screen flex flex-col bg-[var(--bg)]"><ModeSelection /><InviteModal /><NotificationToast /></div> )
  const isGameOver = game && game.status !== 'active'
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="flex items-center justify-between px-10 py-6 border-b border-[var(--surface-2)] shadow-sm bg-[var(--surface)]">
        <div className="flex items-center gap-4"><div className="flex items-center gap-4 px-6 py-3 rounded-2xl cursor-pointer hover:bg-[var(--surface-hover)] transition-all group border border-transparent hover:border-[var(--accent-cyan)]/20 shadow-inner" onClick={goBackToMenu}><Logo size="sm" /><div className="flex flex-col"><span className="text-base font-black tracking-[0.3em] uppercase text-[var(--text-main)] group-hover:text-[var(--accent-cyan)] transition-colors leading-none">SHAXMAT+</span><span className="text-[10px] font-black tracking-[0.4em] uppercase text-[var(--accent-cyan)] mt-1.5 leading-none">ARENA</span></div></div></div>
        <div className="flex items-center gap-8">
          <ViewSwitcher /><LanguageSwitcher /><ThemeSwitcher /><NotificationCenter />
          <div className="flex flex-col items-end leading-none"><span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black mb-1.5">{user.username}</span><span className="text-xs font-mono text-[var(--accent-cyan)] font-black tracking-widest">ID: {user.public_id}</span></div>
          {game && ( <div className="text-[10px] px-6 py-2.5 rounded-full font-black tracking-[0.3em] uppercase shadow-lg shadow-black/20" style={{ background: isGameOver ? 'rgba(255,59,59,0.1)' : 'rgba(77,217,232,0.1)', border: `1px solid ${isGameOver ? 'rgba(255,59,59,0.2)' : 'rgba(77,217,232,0.2)'}`, color: isGameOver ? 'var(--check-red)' : 'var(--accent-cyan)' }}>{isGameOver ? game.status.replace('_', ' ') : (game.game_mode === 'AI' ? `AI (${game.ai_difficulty})` : 'PVP')}</div> )}
        </div>
      </header>
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-10 max-w-[1700px] mx-auto w-full items-start">
        <aside className="w-full lg:w-72 flex flex-col gap-6 order-2 lg:order-1">{game && ( <div className="flex flex-col gap-4"> <PlayerBadge color="black" isActive={game.turn === 'black' && !isGameOver} /> <PlayerBadge color="white" isActive={game.turn === 'white' && !isGameOver} /> </div> )}<GameInfo /><GameControls /></aside>
        <section className="flex-1 flex items-start justify-center order-1 lg:order-2 shadow-2xl rounded-[3rem] p-4 bg-[var(--surface-hover)] border border-white/5"><Board /></section>
        <aside className="w-full lg:w-80 order-3 flex flex-col gap-6"><MoveHistory /><div className="rounded-[2rem] px-6 py-5 bg-[var(--surface)] border border-[var(--border)] shadow-2xl shadow-black/20"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] font-black mb-5 ml-1">Piece Symbols</div><div className="grid grid-cols-2 gap-y-4 text-[11px] text-[var(--text-muted)] font-black uppercase tracking-widest">{[ ['K', 'King'], ['Q', 'Queen'], ['R', 'Rook'], ['B', 'Bishop'], ['N', 'Knight'], ['P', 'Pawn'], ['S', 'Supplier'], ].map(([tcode, name]) => ( <div key={tcode} className="flex items-center gap-3"><span className={`w-5 ${tcode === 'S' ? 'text-[var(--accent-cyan)] font-black' : ''}`}>{tcode}</span><span className={tcode === 'S' ? 'text-[var(--accent-cyan)]' : ''}>{name}</span></div> ))}</div></div>{game && game.game_mode === 'Person' && !isSpectator && <Chat />}</aside>
      </main>
      <PromotionModal /><InviteModal /><GameOverModal /><SearchingModal /><NotificationToast />
    </div>
  )
}
