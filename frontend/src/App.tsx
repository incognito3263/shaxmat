import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
import type { Language } from './translations'
import Board from './components/Board'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import PromotionModal from './components/PromotionModal'

function Avatar({ src, size = 'sm' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-lg' : 
                    size === 'md' ? 'w-12 h-12 text-xl' : 
                    size === 'lg' ? 'w-16 h-16 text-3xl' : 
                    'w-20 h-24 text-5xl';
  const isImage = src && (src.startsWith('/') || src.startsWith('http'));
  return (
    <div className={`${sizeClass} bg-[var(--surface-2)] rounded-md flex items-center justify-center border border-[var(--border)] overflow-hidden shrink-0`}>
      {isImage ? <img src={src} alt="avatar" className="w-full h-full object-cover" /> : <span>{src || '👤'}</span>}
    </div>
  );
}

const AVATARS = ['👨‍🚀', '🥷', '🧙‍♂️', '🧛', '🤖', '👾', '👽', '🦊']

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L26 10V22L16 28L6 22V10L16 4Z" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 10V22M10 13L22 19M22 13L10 19" stroke="var(--accent-cyan)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="16" r="4" fill="var(--accent-cyan)" fillOpacity="0.2" />
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-[var(--bg)]">
      <div className="mb-12 flex gap-4"><LanguageSwitcher /><ThemeSwitcher /></div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><Logo size="lg" /></div>
            <h1 className="text-2xl font-bold text-[var(--accent-white)] tracking-tight mb-1 uppercase">SHAXMAT PLUS</h1>
            <p className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase font-medium">{t.subtitle}</p>
        </div>
        <div className="flex mb-8 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)]">
            <button onClick={() => { setIsLogin(true); clearAuthError(); }} className={`flex-1 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${isLogin ? 'bg-[var(--surface-2)] text-[var(--accent-cyan)] border border-[var(--border)]' : 'text-[var(--text-muted)]'}`}>{t.login}</button>
            <button onClick={() => { setIsLogin(false); clearAuthError(); }} className={`flex-1 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${!isLogin ? 'bg-[var(--surface-2)] text-[var(--accent-cyan)] border border-[var(--border)]' : 'text-[var(--text-muted)]'}`}>{t.signup}</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)]">
                  <Avatar src={avatar} size="md" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex-1 py-2 text-[10px] font-bold text-[var(--text-main)] uppercase border border-[var(--border)] rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all">{isUploading ? '...' : t.uploadPhoto}</button>
                  <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) setAvatar(url); setIsUploading(false); } }} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-4 gap-2 p-2 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
                  {AVATARS.map(a => <button key={a} type="button" onClick={() => setAvatar(a)} className={`text-lg p-1.5 rounded-md transition-all ${avatar === a ? 'bg-[var(--surface-hover)] scale-105' : 'opacity-40 hover:opacity-100'}`}>{a}</button>)}
                </div>
              </div>
            )}
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)]" placeholder={t.username} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)]" placeholder={t.password} />
            {authError && <p className="text-[var(--check-red)] text-[10px] text-center font-bold bg-[var(--check-red)]/5 py-2.5 rounded-md border border-[var(--check-red)]/10">{authError}</p>}
            <button type="submit" disabled={loading || !username || !password} className="btn-primary w-full py-3.5 rounded-lg text-[12px] mt-2 tracking-wide disabled:opacity-50">{loading ? '...' : (isLogin ? t.signIn : t.createAccount)}</button>
        </form>
      </motion.div>
    </div>
  )
}

function Chat() {
  const { chatMessages, sendChatMessage, user } = useGameStore()
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [chatMessages])
  const handleSend = (e: React.FormEvent) => { e.preventDefault(); if (text.trim()) { sendChatMessage(text); setText('') } }
  return (
    <div className="flex flex-col h-[300px] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Chat</span><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /></div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === user?.username ? 'items-end' : 'items-start'}`}><span className="text-[8px] text-[var(--text-muted)] mb-1 px-1 font-bold uppercase">{msg.from}</span><div className={`max-w-[90%] px-3 py-2 rounded-lg text-[11px] ${msg.from === user?.username ? 'bg-[var(--accent-cyan)] text-black font-medium' : 'bg-[var(--surface-2)] text-[var(--text-main)] border border-[var(--border)]'}`}>{msg.text}</div></div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-2 bg-[var(--bg)] border-t border-[var(--border)] flex gap-2"><input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="..." className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)]" /><button type="submit" className="btn-primary px-3 rounded-md transition-all"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></form>
    </div>
  )
}

function FriendsList() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [fetchFriends, fetchFriendRequests])
  if (!friends || !Array.isArray(friends)) return null
  return (
    <div className="w-full bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 flex flex-col shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] mb-5 uppercase tracking-widest flex items-center gap-2">👤 {t.friends}</h3>
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar" style={{ maxHeight: '350px' }}>
        {pendingRequests?.map((req) => (
          <div key={req.id} className="p-2 rounded-lg bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/10 flex items-center justify-between">
            <div className="flex items-center gap-3"><Avatar src={req.from_user.avatar} size="sm" /><div className="text-[11px] font-bold">{req.from_user.username}</div></div>
            <div className="flex gap-1.5"><button onClick={() => respondToFriendRequest(req.id, true)} className="btn-primary p-1 rounded-md"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button></div>
          </div>
        ))}
        {friends.map((f) => (
          <div key={f.id} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] flex items-center justify-between group transition-all">
            <div className="flex items-center gap-3"><div className="relative"><Avatar src={f.avatar} size="sm" />{f.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[var(--surface)]" />}</div><div><div className="text-[11px] font-bold">{f.username}</div><div className="text-[9px] text-[var(--accent-cyan)] font-bold uppercase">{getUserTitle(f.wins, t)}</div></div></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => sendInvite(f.public_id)} className="p-1.5 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 rounded-md"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button><button onClick={() => unfollowUser(f.public_id)} className="p-1.5 text-[var(--check-red)] hover:bg-[var(--check-red)]/10 rounded-md"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>
          </div>
        ))}
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
    <div className="w-full bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] mb-5 uppercase tracking-widest flex items-center gap-2">📜 {t.matchHistory}</h3>
      <div className="space-y-2">{displayedHistory.map((m) => { const isWhite = m.white === user?.username; const didIWin = m.winner === (isWhite ? 'white' : 'black'); const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement'; return ( <div key={m.id} className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-[11px]"><div className="flex items-center gap-3"><div className="flex -space-x-1.5"><Avatar src={m.white_avatar} size="sm" /><Avatar src={m.black_avatar} size="sm" /></div><div className="font-medium">{m.white} vs {m.black}</div></div><div className={`font-bold uppercase tracking-wider ${isDraw ? 'text-[var(--text-muted)]' : (didIWin ? 'text-green-500' : 'text-[var(--check-red)]')}`}>{isDraw ? t.draw : (didIWin ? t.victory : t.defeat)}</div></div> ); })}</div>
      {matchHistory.length > 5 && <button onClick={() => setShowAll(!showAll)} className="w-full mt-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--accent-cyan)] transition-colors">{showAll ? t.showLess : t.showMore}</button>}
    </div>
  )
}

function Leaderboard() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || []);
  return (
    <div className="w-full bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] mb-5 uppercase tracking-widest flex items-center gap-2">🏆 {t.leaderboard}</h3>
      <div className="overflow-x-auto"><table className="w-full text-left min-w-[400px]"><thead className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]"><tr><th className="pb-3 px-2 w-10">#</th><th className="pb-3 px-2">{t.player}</th><th className="pb-3 px-2 text-center">{t.wins}</th><th className="pb-3 px-2"></th></tr></thead><tbody className="text-[11px]">{leaderboard.map((u, index) => { const isMe = u.id === user?.id; const isFollowing = friendIds.has(u.public_id); return ( <tr key={u.id} className={`border-b border-[var(--border)]/30 hover:bg-[var(--surface-hover)] transition-colors ${isMe ? 'bg-[var(--accent-cyan)]/5' : ''}`}><td className="py-2.5 px-2 font-mono font-bold opacity-50">{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</td><td className="py-2.5 px-2 flex items-center gap-3"><div className="relative"><Avatar src={u.avatar} size="sm" />{u.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[var(--surface)]" />}</div><div className="font-bold">{u.username}{isMe && <span className="ml-2 text-[8px] text-[var(--accent-cyan)] font-bold border border-[var(--accent-cyan)]/30 px-1 rounded">YOU</span>}</div></td><td className="py-2.5 px-2 text-center font-mono font-bold text-green-500">{u.wins}</td><td className="py-2.5 px-2 text-right">{!isMe && !isFollowing && <button onClick={() => { sendFriendRequest(u.public_id); setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' }); }} className="p-1.5 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 rounded-md transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>}</td></tr> ); })}</tbody></table></div>
    </div>
  )
}

function ModeSelection() {
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { createGame, user, searchUser, logout, sendInvite, t, fetchLeaderboard, startMatchmaking, setNotification, fetchFriendRequests, fetchNotifications } = useGameStore()
  useEffect(() => { fetchLeaderboard(); fetchFriendRequests(); fetchNotifications(); }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])
  const totalGames = user ? (user.wins + user.losses + user.draws) : 0;
  const winRate = totalGames > 0 ? Math.round((user!.wins / totalGames) * 100) : 0;
  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-12 lg:p-16">
      <div className="flex justify-between items-center mb-16 border-b border-[var(--border)] pb-10">
        <div className="flex items-center gap-6"><Logo size="lg" /><h1 className="text-3xl font-black uppercase tracking-[0.2em] text-[var(--accent-white)]">Arena</h1></div>
        <div className="flex gap-6 items-center"><LanguageSwitcher /><ThemeSwitcher /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-10">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6"><button onClick={() => setIsEditModalOpen(true)} className="text-[11px] uppercase font-bold text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors tracking-[0.2em]">Settings</button></div>
            <Avatar src={user?.avatar || '👤'} size="xl" />
            <h2 className="text-3xl font-black mt-6 mb-2 text-[var(--accent-white)] tracking-tight">{user?.username}</h2>
            <div className="text-[11px] text-[var(--accent-cyan)] font-bold uppercase tracking-[0.4em] mb-10 px-4 py-1.5 bg-[var(--accent-cyan)]/5 rounded-full border border-[var(--accent-cyan)]/10">{user ? getUserTitle(user.wins, t) : ''}</div>
            
            <div className="grid grid-cols-2 gap-6 w-full mb-10">
              <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Win Rate</div>
                <div className="text-3xl font-black text-green-500">{winRate}%</div>
              </div>
              <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Games</div>
                <div className="text-3xl font-black">{totalGames}</div>
              </div>
            </div>
            
            <div className="w-full flex items-center justify-center gap-4 bg-[var(--bg)] py-4 px-6 rounded-xl border border-[var(--border)] group cursor-pointer hover:border-[var(--accent-cyan)]/30 transition-all shadow-inner" onClick={() => { navigator.clipboard.writeText(user?.public_id || ''); setNotification({ text: t.idCopied, type: 'success' }); }}>
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Your ID:</span>
              <span className="text-xl font-mono font-bold text-[var(--accent-cyan)] tracking-[0.2em]">{user?.public_id}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-30 group-hover:opacity-100 transition-opacity"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </div>
            <button onClick={logout} className="mt-8 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--check-red)] transition-colors uppercase tracking-[0.3em]">{t.logout}</button>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 shadow-2xl">
            <div className="mb-10">
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">⏱️ {t.timeControl}</div>
              <div className="grid grid-cols-4 gap-3">
                {[{l:'1m',s:60,i:0},{l:'1+1',s:60,i:1},{l:'3m',s:180,i:0},{l:'3+2',s:180,i:2},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0},{l:'30m',s:1800,i:0}].map(tc => (
                  <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i); }} className={`py-3 rounded-lg text-[11px] font-black transition-all border-2 ${timeLimit === tc.s && timeIncrement === tc.i ? 'bg-[var(--accent-cyan)] text-black border-[var(--accent-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-main)]'}`}>
                    {tc.l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[var(--bg)] p-8 rounded-2xl border border-[var(--border)] hover:border-[var(--accent-cyan)]/30 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-black uppercase tracking-[0.2em]">🤖 {t.singlePlayer}</span>
                  <div className="flex gap-2">
                    {['easy', 'normal', 'hard'].map(d => (
                      <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-[var(--accent-cyan)] text-black' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className="btn-primary w-full py-5 rounded-xl text-lg font-black tracking-[0.2em] shadow-lg">BATTLE AI</button>
              </div>

              <button onClick={startMatchmaking} className="btn-primary w-full p-8 rounded-2xl flex items-center justify-between group shadow-xl">
                <span className="text-xl font-black uppercase tracking-[0.2em]">🌍 {t.quickPlay}</span>
                <span className="group-hover:translate-x-3 transition-transform text-3xl">→</span>
              </button>
              
              <div className="pt-6 border-t border-[var(--border)]">
                 <div className="flex gap-3">
                   <input type="text" maxLength={8} value={opponentId} onChange={e => setOpponentId(e.target.value.replace(/\D/g, ''))} placeholder="Opponent ID" className="flex-1 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl px-6 py-4 text-base font-mono text-[var(--text-main)] outline-none focus:border-[var(--accent-cyan)] transition-all" />
                   <button onClick={async () => { if (opponentId.length === 8) { if (opponentId === user?.public_id) { setNotification({ text: t.selfPlayError, type: 'error' }); return } const target = await searchUser(opponentId); if (target) sendInvite(target.public_id, timeLimit, timeIncrement); else setNotification({ text: t.userNotFound, type: 'error' }); } }} className="btn-secondary px-8 rounded-xl font-black text-sm tracking-widest uppercase">{t.go}</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-8"><Leaderboard /><LiveGames /><div className="grid grid-cols-1 xl:grid-cols-2 gap-8"><FriendsList /><MatchHistory /></div></div>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}

function ViewSwitcher() {
  const { viewMode, setViewMode, t, setNotification } = useGameStore()
  return (
    <div className="flex p-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] relative"><button onClick={() => setViewMode('2d')} className={`relative z-10 px-3 py-1 rounded text-[9px] font-bold transition-all ${viewMode === '2d' ? 'bg-[var(--accent-cyan)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>2D</button><button onClick={() => setNotification({ text: t.comingSoon, type: 'info' })} className={`relative z-10 px-3 py-1 rounded text-[9px] font-bold text-[var(--text-muted)] opacity-50 flex items-center gap-1.5`}>3D <span className="w-1 h-1 bg-[var(--accent-cyan)] rounded-full animate-pulse" /></button></div>
  )
}

function LanguageSwitcher() {
  const { language, setLanguage } = useGameStore()
  const langs: { id: Language; label: string }[] = [{ id: 'uz', label: 'UZ' }, { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }]
  return (
    <div className="flex p-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">{langs.map(l => ( <button key={l.id} onClick={() => setLanguage(l.id)} className={`px-3 py-1 rounded text-[9px] font-bold transition-all ${language === l.id ? 'bg-[var(--accent-cyan)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>{l.label}</button> ))}</div>
  )
}

function PlayerBadge({ color, isActive }: { color: 'white' | 'black'; isActive: boolean }) {
  const { t, game } = useGameStore()
  const isWhite = color === 'white'
  const capturedPieces = game?.captured_pieces?.[color] || []
  const avatar = isWhite ? game?.white_avatar : game?.black_avatar
  const timeLeft = isWhite ? (game?.white_time_left || 0) : (game?.black_time_left || 0)
  const formatTime = (s: number) => { const mins = Math.floor(s / 60); const secs = s % 60; return `${mins}:${secs.toString().padStart(2, '0')}` }
  
  return (
    <div className={`flex items-center justify-between w-full p-2 rounded-xl transition-all ${isActive ? 'bg-[var(--surface-hover)] shadow-inner' : 'bg-transparent'}`}>
      <div className="flex items-center gap-4">
        <Avatar src={avatar || (isWhite ? '♔' : '♚')} size="md" />
        <div className="flex flex-col">
          <div className="text-lg font-black tracking-wide uppercase" style={{ color: isWhite ? '#fff' : '#c3c2c1' }}>{isWhite ? t.white : t.black}</div>
          <div className="flex gap-1 mt-0.5 opacity-60 h-[14px]">
            {capturedPieces.map((p, i) => <span key={i} className="text-[12px] leading-none">{p}</span>)}
          </div>
        </div>
      </div>
      <div className={`px-4 py-2 rounded-lg font-mono text-xl font-bold tracking-tight shadow-md ${isActive ? (timeLeft < 30 ? 'bg-[var(--check-red)] text-white' : 'bg-[var(--surface-2)] text-[var(--accent-white)]') : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  )
}

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, t, uploadAvatar, updateProfile } = useGameStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  if (!isOpen || !user) return null
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] relative"><button onClick={onClose} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-xl">✕</button><h2 className="text-base font-bold uppercase tracking-widest mb-8 text-center text-[var(--accent-white)]">{t.editProfile}</h2><div className="flex flex-col items-center gap-6"><Avatar src={user.avatar} size="lg" /><div className="w-full space-y-4"><button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full py-3 bg-[var(--surface-2)] text-[var(--text-main)] border border-[var(--border)] font-bold rounded-lg uppercase tracking-widest text-[10px] hover:bg-[var(--surface-hover)] transition-all">{isUploading ? '...' : t.chooseAvatar}</button><input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) await updateProfile(url); setIsUploading(false); } }} className="hidden" accept="image/*" /><div className="grid grid-cols-4 gap-2 bg-[var(--bg)] p-2 rounded-lg border border-[var(--border)]">{AVATARS.map(a => <button key={a} onClick={() => updateProfile(a)} className={`text-xl p-2 rounded-md transition-all ${user.avatar === a ? 'bg-[var(--surface-hover)]' : 'opacity-40 hover:opacity-100'}`}>{a}</button>)}</div></div></div></motion.div></div>
  )
}

function LiveGames() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  if (!liveGames || liveGames.length === 0) return null
  return (
    <div className="w-full bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm"><h3 className="text-xs font-bold text-[var(--text-main)] mb-5 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {t.liveGames}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{liveGames.map((g) => ( <div key={g.game_id} onClick={() => spectateGame(g.game_id)} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] cursor-pointer hover:border-[var(--accent-cyan)]/30 transition-all flex items-center justify-between group"><div className="flex items-center gap-3"><div className="flex -space-x-1.5"><Avatar src={g.white_avatar} size="sm" /><Avatar src={g.black_avatar} size="sm" /></div><div className="text-[11px] font-bold truncate max-w-[80px]">{g.white} vs {g.black}</div></div><div className="text-[9px] font-bold text-[var(--accent-cyan)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Watch</div></div> ))}</div></div>
  )
}

function ThemeSwitcher() {
  const { uiTheme, setUiTheme } = useGameStore()
  const isDark = uiTheme === 'dark'
  return (
    <div className="flex items-center p-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer" onClick={() => setUiTheme(isDark ? 'light' : 'dark')}><div className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${isDark ? 'bg-[var(--bg)] text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>DARK</div><div className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${!isDark ? 'bg-white text-black' : 'text-[var(--text-muted)]'}`}>LIGHT</div></div>
  )
}

export default function App() {
  const { user, gameId, game, fetchGame, error, initSocket, goBackToMenu, setLanguage, isSpectator, uiTheme } = useGameStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme)
    const saved = localStorage.getItem('shaxmat_user'), token = localStorage.getItem('shaxmat_token'), savedGameId = localStorage.getItem('shaxmat_game_id'), savedIsSpectator = localStorage.getItem('shaxmat_spectator') === 'true', savedLang = localStorage.getItem('shaxmat_lang') as Language
    if (savedLang) setLanguage(savedLang)
    if (saved && token && !user) { const u = JSON.parse(saved); useGameStore.setState({ user: u, token: token, isSpectator: savedIsSpectator }); initSocket(u.public_id)
      if (savedGameId) { const gid = parseInt(savedGameId, 10); useGameStore.setState({ gameId: gid }) }
    }
  }, [user, initSocket, setLanguage, uiTheme])
  useEffect(() => { if (gameId) { fetchGame(); const interval = setInterval(() => { if (useGameStore.getState().game?.status === 'active') fetchGame() }, 15000); return () => clearInterval(interval) } }, [gameId, fetchGame])
  if (error && !gameId) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]"><div className="text-center"><h2 className="text-xl font-bold mb-4">Error: {error}</h2><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-2 bg-white text-black font-bold rounded">Reset</button></div></div>
  if (!user) return <div className="min-h-screen flex flex-col"><AuthScreen /><AnimatePresence><NotificationToast /></AnimatePresence></div>
  if (!gameId) return <div className="min-h-screen flex flex-col bg-[var(--bg)]"><ModeSelection /><AnimatePresence><NotificationToast /></AnimatePresence><SearchingModal /><InviteModal /></div>
  const isGameOver = game && game.status !== 'active'
  const isFlipped = game?.game_mode === 'Person' && user?.id === game.black_player_id
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[var(--surface)]"><div className="flex items-center gap-4 cursor-pointer group" onClick={goBackToMenu}><Logo size="sm" /><div className="flex flex-col"><span className="text-base font-bold tracking-tight text-[var(--accent-white)] group-hover:text-[var(--accent-cyan)] transition-colors">SHAXMAT+</span></div></div><div className="flex items-center gap-6"><ViewSwitcher /><LanguageSwitcher /><ThemeSwitcher /><div className="flex flex-col items-end leading-none"><span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">{user.username}</span><span className="text-[10px] font-mono text-[var(--accent-cyan)] font-bold opacity-70">ID: {user.public_id}</span></div></div></header>
      <main className="flex-1 flex flex-col xl:flex-row gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full items-start justify-center">
        {/* Center/Left: Large Board & Player Badges */}
        <section className="flex-1 flex flex-col items-center justify-center order-1 w-full max-w-[1000px] mx-auto">
          {game && (
            <div className="w-full mb-4 flex items-end">
              <PlayerBadge color={isFlipped ? "white" : "black"} isActive={game.turn === (isFlipped ? "white" : "black") && !isGameOver} />
            </div>
          )}
          
          <div className="w-full bg-[var(--surface-2)] p-2 md:p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[var(--border)]">
            <Board />
          </div>

          {game && (
            <div className="w-full mt-4 flex items-start">
              <PlayerBadge color={isFlipped ? "black" : "white"} isActive={game.turn === (isFlipped ? "black" : "white") && !isGameOver} />
            </div>
          )}
        </section>

        {/* Right: Controls, History, Chat */}
        <aside className="w-full xl:w-[420px] order-2 flex flex-col gap-6 shrink-0">
          <GameControls />
          <div className="flex flex-col gap-6 flex-1">
            <MoveHistory />
            {game?.game_mode === 'Person' && !isSpectator && <Chat />}
          </div>
        </aside>
      </main>
      <PromotionModal /><AnimatePresence><NotificationToast /></AnimatePresence><SearchingModal /><InviteModal /><GameOverModal />
    </div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, matchedOpponent, matchOffer, acceptMatchOffer, t, user } = useGameStore()
  if (!isSearching) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="max-w-md w-full p-10 rounded-2xl text-center border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--accent-cyan)] opacity-5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--accent-cyan)] opacity-5 rounded-full blur-3xl animate-pulse" />

        {!matchedOpponent ? (
          <>
            <div className="relative mb-10">
              <div className="w-24 h-24 border-4 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[var(--accent-cyan)]/10 border-b-[var(--accent-cyan)]/40 rounded-full animate-spin-slow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🌍</div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-widest mb-3 text-[var(--accent-white)]">{t.searching}</h2>
            <p className="text-[var(--text-muted)] text-[11px] uppercase font-bold tracking-[0.3em] mb-10 animate-pulse">Finding a worthy opponent...</p>
            <button onClick={cancelMatchmaking} className="btn-secondary w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all">{t.cancel}</button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <div className="text-sm font-bold text-[var(--accent-cyan)] uppercase tracking-[0.4em] mb-8">{t.matchFound}</div>
             <div className="flex items-center justify-center gap-8 mb-10">
                <div className="flex flex-col items-center gap-3">
                   <Avatar src={user?.avatar || '👤'} size="lg" />
                   <span className="text-xs font-bold uppercase">{user?.username}</span>
                </div>
                <div className="text-3xl font-black text-[var(--accent-cyan)] animate-bounce">VS</div>
                <div className="flex flex-col items-center gap-3">
                   <Avatar src={matchedOpponent.avatar} size="lg" />
                   <span className="text-xs font-bold uppercase">{matchedOpponent.username}</span>
                </div>
             </div>
             
             {matchOffer ? (
               <div className="space-y-6">
                 <div className="bg-[var(--bg)] p-5 rounded-xl border border-[var(--border)]">
                    <div className="text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-widest mb-1">{t.timeControl}</div>
                    <div className="text-2xl font-mono font-bold text-[var(--accent-cyan)]">{matchOffer.time_limit / 60}+{matchOffer.time_increment}</div>
                 </div>
                 <div className="flex gap-4">
                   <button onClick={cancelMatchmaking} className="btn-secondary flex-1 py-4 rounded-xl text-xs font-bold tracking-widest uppercase">{t.decline}</button>
                   <button onClick={acceptMatchOffer} className="btn-primary flex-1 py-4 rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,255,0.2)]">{t.acceptAndStart}</button>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-5">
                 <div className="w-10 h-10 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
                 <p className="text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-widest">{t.waitingResponse}</p>
                 <button onClick={cancelMatchmaking} className="mt-4 text-[11px] text-[var(--text-muted)] hover:text-white uppercase font-bold tracking-widest underline underline-offset-8 transition-all">{t.cancel}</button>
               </div>
             )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  return ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => setNotification(null)} className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-lg text-black font-bold text-[11px] uppercase tracking-widest shadow-xl cursor-pointer ${notification.type === 'error' ? 'bg-red-500' : 'bg-[var(--accent-cyan)]'}`}>{notification.text}</motion.div> )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full p-10 rounded-xl text-center border border-[var(--border)] bg-[var(--surface)] shadow-2xl"><div className="text-6xl mb-6">{isWinner ? '🏆' : '🏁'}</div><h2 className="text-3xl font-bold uppercase mb-2 text-[var(--accent-white)]">{isWinner ? t.victory : t.gameOver}</h2><p className="text-[var(--text-muted)] text-xs mb-8 uppercase font-bold tracking-widest">{game.status === 'resigned' ? t.opponentLeft.replace('{name}', opponentResignedName || '') : t.betterLuck}</p><div className="flex flex-col gap-3">
  <button onClick={() => useGameStore.getState().startReview()} className="btn-primary w-full py-4 rounded-xl text-sm tracking-widest">{t.reviewGame}</button>
  <button onClick={goBackToMenu} className="btn-secondary w-full py-4 rounded-xl text-sm tracking-widest">{t.backToMenu}</button>
</div></motion.div></div>
  )
}

function InviteModal() {
  const { inviteRequest, respondToInvite, t } = useGameStore()
  if (!inviteRequest) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full p-8 rounded-xl text-center border border-[var(--border)] bg-[var(--surface)] shadow-2xl"><div className="text-4xl mb-4">🎮</div><h2 className="text-lg font-bold text-[var(--accent-white)] uppercase mb-2">Challenge</h2><p className="text-[var(--text-muted)] text-xs mb-6 font-bold uppercase"><span className="text-[var(--accent-cyan)]">{inviteRequest.from_username}</span> wants to play!</p><div className="flex gap-3">
  <button onClick={() => respondToInvite(false)} className="btn-secondary flex-1 py-3.5 rounded-xl text-xs tracking-widest">{t.decline}</button>
  <button onClick={() => respondToInvite(true)} className="btn-primary flex-1 py-3.5 rounded-xl text-xs tracking-widest">{t.accept}</button>
</div></motion.div></div>
  )
}
