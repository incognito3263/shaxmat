import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
import type { Language } from './translations'
import Board from './components/Board'
import GameControls from './components/GameControls'
import MoveHistory from './components/MoveHistory'
import PromotionModal from './components/PromotionModal'

function Avatar({ src, size = 'sm' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-xl' : 
                    size === 'md' ? 'w-14 h-14 text-2xl' : 
                    size === 'lg' ? 'w-20 h-20 text-4xl' : 
                    'w-24 h-24 text-5xl';
  const isImage = src && (src.startsWith('/') || src.startsWith('http'));
  return (
    <div className={`${sizeClass} bg-[var(--surface-2)] rounded shadow-inner flex items-center justify-center border border-[var(--border)] overflow-hidden shrink-0`}>
      {isImage ? <img src={src} alt="avatar" className="w-full h-full object-cover" /> : <span>{src || '👤'}</span>}
    </div>
  );
}

const AVATARS = ['👨‍🚀', '🥷', '🧙‍♂️', '🧛', '🤖', '👾', '👽', '🦊']

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 32 : size === 'md' ? 48 : 64;
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-[#1b1a17]">
      <div className="mb-12 flex gap-6"><LanguageSwitcher /><ThemeSwitcher /></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full p-10 premium-panel">
        <div className="text-center mb-10">
            <div className="flex justify-center mb-6"><Logo size="lg" /></div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">SHAXMAT PLUS</h1>
            <p className="text-[var(--text-muted)] text-xs tracking-[0.2em] uppercase font-bold">{t.subtitle}</p>
        </div>
        <div className="flex mb-10 bg-[#211f1d] p-1 rounded-lg border border-[#403d3a]">
            <button onClick={() => { setIsLogin(true); clearAuthError(); }} className={`flex-1 py-3 rounded text-sm font-bold uppercase transition-all ${isLogin ? 'bg-[#3c3a37] text-white shadow-lg' : 'text-[var(--text-muted)]'}`}>{t.login}</button>
            <button onClick={() => { setIsLogin(false); clearAuthError(); }} className={`flex-1 py-3 rounded text-sm font-bold uppercase transition-all ${!isLogin ? 'bg-[#3c3a37] text-white shadow-lg' : 'text-[var(--text-muted)]'}`}>{t.signup}</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4">
                <div className="flex items-center gap-6 bg-[#211f1d] p-4 rounded-lg border border-[#403d3a]">
                  <Avatar src={avatar} size="md" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary flex-1 text-xs">{isUploading ? '...' : t.uploadPhoto}</button>
                  <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) setAvatar(url); setIsUploading(false); } }} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-4 gap-2 p-2 bg-[#211f1d] rounded-lg border border-[#403d3a]">
                  {AVATARS.map(a => <button key={a} type="button" onClick={() => setAvatar(a)} className={`text-2xl p-2 rounded hover:bg-[#3c3a37] transition-all ${avatar === a ? 'bg-[#3c3a37] scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`}>{a}</button>)}
                </div>
              </div>
            )}
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#211f1d] border border-[#403d3a] rounded-lg px-5 py-4 text-base text-white outline-none focus:border-[#81b64c]" placeholder={t.username} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#211f1d] border border-[#403d3a] rounded-lg px-5 py-4 text-base text-white outline-none focus:border-[#81b64c]" placeholder={t.password} />
            {authError && <p className="text-[var(--check-red)] text-sm text-center font-bold bg-red-500/5 py-3 rounded-lg border border-red-500/10">{authError}</p>}
            <button type="submit" disabled={loading || !username || !password} className="btn-primary w-full">{loading ? '...' : (isLogin ? t.signIn : t.createAccount)}</button>
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
    <div className="flex flex-col h-[350px] premium-panel overflow-hidden">
      <div className="px-5 py-3 border-b border-[#403d3a] bg-[#211f1d] flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest opacity-50">Live Chat</span><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /></div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === user?.username ? 'items-end' : 'items-start'}`}><span className="text-[10px] opacity-40 mb-1 px-1 font-bold uppercase tracking-wider">{msg.from}</span><div className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm ${msg.from === user?.username ? 'bg-[#81b64c] text-white shadow-sm' : 'bg-[#3c3a37] text-white'}`}>{msg.text}</div></div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-[#211f1d] border-t border-[#403d3a] flex gap-2"><input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="..." className="flex-1 bg-[#2d2b28] border border-[#403d3a] rounded px-4 py-2 text-sm text-white outline-none focus:border-[#81b64c]" /><button type="submit" className="bg-[#81b64c] text-white p-2 rounded hover:brightness-110 transition-all shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></form>
    </div>
  )
}

function FriendsList() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [fetchFriends, fetchFriendRequests])
  if (!friends || !Array.isArray(friends)) return null
  return (
    <div className="w-full premium-panel p-6 flex flex-col">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">👤 {t.friends}</h3>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar" style={{ maxHeight: '400px' }}>
        {pendingRequests?.map((req) => (
          <div key={req.id} className="p-3 rounded bg-green-500/5 border border-green-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3"><Avatar src={req.from_user.avatar} size="sm" /><div className="text-sm font-bold">{req.from_user.username}</div></div>
            <button onClick={() => respondToFriendRequest(req.id, true)} className="bg-[#81b64c] text-white p-1.5 rounded shadow-sm hover:brightness-110"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
          </div>
        ))}
        {friends.map((f) => (
          <div key={f.id} className="p-3 rounded hover:bg-[#3c3a37] flex items-center justify-between group transition-all">
            <div className="flex items-center gap-3"><div className="relative"><Avatar src={f.avatar} size="sm" />{f.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#2d2b28]" />}</div><div><div className="text-sm font-bold">{f.username}</div><div className="text-[10px] text-[#81b64c] font-black uppercase tracking-wider">{getUserTitle(f.wins, t)}</div></div></div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => sendInvite(f.public_id)} className="text-[#81b64c] hover:bg-[#81b64c]/10 p-1.5 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button><button onClick={() => unfollowUser(f.public_id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>
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
    <div className="w-full premium-panel p-6 shadow-sm">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">📜 {t.matchHistory}</h3>
      <div className="space-y-3">{displayedHistory.map((m) => { const isWhite = m.white === user?.username; const didIWin = m.winner === (isWhite ? 'white' : 'black'); const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement'; return ( <div key={m.id} className="p-3.5 rounded bg-[#211f1d] border border-[#403d3a] flex items-center justify-between text-sm"><div className="flex items-center gap-4"><div className="flex -space-x-2"><Avatar src={m.white_avatar} size="sm" /><Avatar src={m.black_avatar} size="sm" /></div><div className="font-bold">{m.white} vs {m.black}</div></div><div className={`font-black uppercase tracking-wider ${isDraw ? 'opacity-40' : (didIWin ? 'text-green-500' : 'text-red-500')}`}>{isDraw ? t.draw : (didIWin ? t.victory : t.defeat)}</div></div> ); })}</div>
      {matchHistory.length > 5 && <button onClick={() => setShowAll(!showAll)} className="w-full mt-6 text-xs font-bold text-[#81b64c] uppercase tracking-widest hover:brightness-110">{showAll ? t.showLess : t.showMore}</button>}
    </div>
  )
}

function Leaderboard() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || []);
  return (
    <div className="w-full premium-panel p-8">
      <h3 className="text-lg font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">🏆 {t.leaderboard}</h3>
      <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px]"><thead className="text-xs uppercase tracking-widest opacity-40 border-b border-[#403d3a]"><tr><th className="pb-4 px-4 w-12">#</th><th className="pb-4 px-4">{t.player}</th><th className="pb-4 px-4 text-center">{t.wins}</th><th className="pb-4 px-4"></th></tr></thead><tbody className="text-base font-bold">{leaderboard.map((u, index) => { const isMe = u.id === user?.id; const isFollowing = friendIds.has(u.public_id); return ( <tr key={u.id} className={`border-b border-[#403d3a]/50 hover:bg-[#3c3a37] transition-colors ${isMe ? 'bg-[#81b64c]/5' : ''}`}><td className="py-4 px-4 opacity-30 font-mono">{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</td><td className="py-4 px-4 flex items-center gap-4"><div className="relative"><Avatar src={u.avatar} size="sm" />{u.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2d2b28]" />}</div><div><div className="flex items-center gap-2">{u.username}{isMe && <span className="text-[10px] text-[#81b64c] border border-[#81b64c]/30 px-1.5 py-0.5 rounded">YOU</span>}</div><div className="text-[11px] text-[#81b64c] uppercase tracking-wider mt-0.5">{getUserTitle(u.wins, t)}</div></div></td><td className="py-4 px-4 text-center font-mono text-green-500 text-lg">{u.wins}</td><td className="py-4 px-4 text-right">{!isMe && !isFollowing && <button onClick={() => { sendFriendRequest(u.public_id); setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' }); }} className="text-[#81b64c] hover:bg-[#81b64c]/10 p-2 rounded transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>}</td></tr> ); })}</tbody></table></div>
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
    <div className="flex-1 w-full max-w-[1300px] mx-auto p-8 md:p-12 lg:p-16">
      <div className="flex justify-between items-center mb-16 border-b border-[#403d3a] pb-10"><div className="flex items-center gap-6"><Logo size="lg" /><h1 className="text-4xl font-black uppercase tracking-tighter text-white">ARENA</h1></div><div className="flex gap-6 items-center"><LanguageSwitcher /><ThemeSwitcher /></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-10">
          <div className="premium-panel p-10 flex flex-col items-center text-center relative overflow-hidden"><div className="absolute top-0 right-0 p-6"><button onClick={() => setIsEditModalOpen(true)} className="text-xs uppercase font-black text-[#bababa] hover:text-[#81b64c] transition-colors tracking-widest">Settings</button></div><Avatar src={user?.avatar || '👤'} size="xl" /><h2 className="text-3xl font-black mt-6 mb-2 text-white tracking-tight">{user?.username}</h2><div className="text-xs text-[#81b64c] font-black uppercase tracking-[0.3em] mb-8 px-4 py-1.5 bg-[#81b64c]/5 rounded-full border border-[#81b64c]/10">{user ? getUserTitle(user.wins, t) : ''}</div><div className="grid grid-cols-2 gap-6 w-full mb-10"><div className="bg-[#211f1d] p-6 rounded-lg border border-[#403d3a] shadow-inner"><div className="text-[11px] uppercase tracking-widest opacity-40 mb-2 font-bold">Win Rate</div><div className="text-3xl font-black text-green-500">{winRate}%</div></div><div className="bg-[#211f1d] p-6 rounded-lg border border-[#403d3a] shadow-inner"><div className="text-[11px] uppercase tracking-widest opacity-40 mb-2 font-bold">Total Games</div><div className="text-3xl font-black text-white">{totalGames}</div></div></div><div className="w-full flex items-center justify-center gap-4 bg-[#211f1d] py-4 px-6 rounded-lg border border-[#403d3a] group cursor-pointer hover:border-[#81b64c]/30 transition-all shadow-inner" onClick={() => { navigator.clipboard.writeText(user?.public_id || ''); setNotification({ text: t.idCopied, type: 'success' }); }}><span className="text-xs font-black opacity-30 uppercase tracking-widest">ID:</span><span className="text-2xl font-mono font-black text-[#81b64c] tracking-widest">{user?.public_id}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20 group-hover:opacity-100 transition-opacity"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></div><button onClick={logout} className="mt-8 text-xs font-black opacity-30 hover:opacity-100 hover:text-red-500 transition-all uppercase tracking-[0.3em]">{t.logout}</button></div>
          <div className="premium-panel p-10"><div className="mb-10"><div className="text-xs font-black opacity-30 uppercase tracking-widest mb-6">⏱️ {t.timeControl}</div><div className="grid grid-cols-4 gap-3">{[{l:'1m',s:60,i:0},{l:'1+1',s:60,i:1},{l:'3m',s:180,i:0},{l:'3+2',s:180,i:2},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0},{l:'30m',s:1800,i:0}].map(tc => ( <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i); }} className={`py-3 rounded text-xs font-black transition-all border ${timeLimit === tc.s && timeIncrement === tc.i ? 'bg-[#81b64c] text-white border-[#81b64c] shadow-lg' : 'bg-[#211f1d] text-[#bababa] border-[#403d3a] hover:border-[#bababa]'}`}>{tc.l.toUpperCase()}</button> ))}</div></div><div className="space-y-6"><div className="bg-[#211f1d] p-6 rounded-lg border border-[#403d3a] shadow-inner"><div className="flex items-center justify-between mb-6"><span className="text-sm font-black uppercase tracking-widest">🤖 {t.singlePlayer}</span><div className="flex gap-2">{['easy', 'normal', 'hard'].map(d => <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${difficulty === d ? 'bg-[#3c3a37] text-[#81b64c] shadow-sm' : 'opacity-30 hover:opacity-100'}`}>{d}</button>)}</div></div><button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className="btn-primary w-full shadow-lg">Start Game</button></div><button onClick={startMatchmaking} className="btn-primary w-full py-6 flex items-center justify-center gap-4 shadow-xl"><span className="text-2xl">🌍</span><span className="text-xl">{t.quickPlay}</span></button><div className="bg-[#211f1d] p-6 rounded-lg border border-[#403d3a] shadow-inner"><div className="text-sm font-black uppercase tracking-widest mb-6 text-left">👤 {t.multiplayer}</div><div className="flex gap-3"><input type="text" maxLength={8} value={opponentId} onChange={e => setOpponentId(e.target.value.replace(/\D/g, ''))} placeholder="Opponent ID" className="flex-1 bg-[#2d2b28] border border-[#403d3a] rounded-lg px-5 py-3 text-lg text-center font-mono outline-none focus:border-[#81b64c]" /><button onClick={async () => { if (opponentId.length === 8) { if (opponentId === user?.public_id) { setNotification({ text: t.selfPlayError, type: 'error' }); return } const target = await searchUser(opponentId); if (target) sendInvite(target.public_id, timeLimit, timeIncrement); else setNotification({ text: t.userNotFound, type: 'error' }); } }} className="btn-primary py-3 px-6 text-sm">{t.go}</button></div></div></div></div>
        </div>
        <div className="lg:col-span-7 space-y-10"><Leaderboard /><LiveGames /><div className="grid grid-cols-1 xl:grid-cols-2 gap-10"><FriendsList /><MatchHistory /></div></div>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}

function ViewSwitcher() {
  const { viewMode, setViewMode, t, setNotification } = useGameStore()
  return (
    <div className="flex p-1 rounded bg-[#211f1d] border border-[#403d3a]"><button onClick={() => setViewMode('2d')} className={`px-4 py-2 rounded text-xs font-black transition-all ${viewMode === '2d' ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30 hover:opacity-100'}`}>2D</button><button onClick={() => setNotification({ text: t.comingSoon, type: 'info' })} className={`px-4 py-2 rounded text-xs font-black opacity-20 flex items-center gap-2`}>3D <span className="w-1.5 h-1.5 bg-[#81b64c] rounded-full animate-pulse" /></button></div>
  )
}

function LanguageSwitcher() {
  const { language, setLanguage } = useGameStore()
  const langs: { id: Language; label: string }[] = [{ id: 'uz', label: 'UZ' }, { id: 'ru', label: 'RU' }, { id: 'en', label: 'EN' }]
  return (
    <div className="flex p-1 rounded bg-[#211f1d] border border-[#403d3a]">{langs.map(l => ( <button key={l.id} onClick={() => setLanguage(l.id)} className={`px-4 py-2 rounded text-xs font-black transition-all ${language === l.id ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30 hover:opacity-100'}`}>{l.label}</button> ))}</div>
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
    <div className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${isActive ? 'bg-[#3c3a37]/50 shadow-inner' : ''}`}>
      <div className="flex items-center gap-5"><Avatar src={avatar || (isWhite ? '♔' : '♚')} size="md" /><div><div className="text-base font-black uppercase tracking-wider" style={{ color: isWhite ? '#fff' : '#bababa' }}>{isWhite ? t.white : t.black}</div><div className="flex gap-1 mt-1 opacity-30">{capturedPieces.map((p, i) => <span key={i} className="text-sm font-bold">{p}</span>)}</div></div></div>
      <div className={`px-6 py-2.5 rounded font-mono text-2xl font-black tracking-tighter shadow-lg ${isActive ? (timeLeft < 30 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#3c3a37] text-white') : 'bg-[#211f1d] text-[#bababa] opacity-50'}`}>{formatTime(timeLeft)}</div>
    </div>
  )
}

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, t, uploadAvatar, updateProfile } = useGameStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  if (!isOpen || !user) return null
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 premium-panel relative"><button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors text-2xl">✕</button><h2 className="text-xl font-black uppercase tracking-widest mb-10 text-center text-white">{t.editProfile}</h2><div className="flex flex-col items-center gap-8"><Avatar src={user.avatar} size="lg" /><div className="w-full space-y-6"><button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary w-full py-4">{isUploading ? '...' : t.chooseAvatar}</button><input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) await updateProfile(url); setIsUploading(false); } }} className="hidden" accept="image/*" /><div className="grid grid-cols-4 gap-3 bg-[#211f1d] p-3 rounded-lg border border-[#403d3a]">{AVATARS.map(a => <button key={a} onClick={() => updateProfile(a)} className={`text-3xl p-3 rounded hover:bg-[#3c3a37] transition-all ${user.avatar === a ? 'bg-[#3c3a37] shadow-lg scale-110' : 'opacity-30 hover:opacity-100'}`}>{a}</button>)}</div></div></div></motion.div></div>
  )
}

function LiveGames() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  if (!liveGames || liveGames.length === 0) return null
  return (
    <div className="w-full premium-panel p-8 shadow-sm"><h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> {t.liveGames}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{liveGames.map((g) => ( <div key={g.game_id} onClick={() => spectateGame(g.game_id)} className="p-4 rounded bg-[#211f1d] border border-[#403d3a] cursor-pointer hover:border-[#81b64c] transition-all flex items-center justify-between group shadow-inner"><div className="flex items-center gap-4"><div className="flex -space-x-2"><Avatar src={g.white_avatar} size="sm" /><Avatar src={g.black_avatar} size="sm" /></div><div className="text-base font-bold truncate max-w-[120px]">{g.white} vs {g.black}</div></div><div className="text-xs font-black text-[#81b64c] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Watch</div></div> ))}</div></div>
  )
}

function ThemeSwitcher() {
  const { uiTheme, setUiTheme } = useGameStore()
  const isDark = uiTheme === 'dark'
  return (
    <div className="flex items-center p-1 rounded bg-[#211f1d] border border-[#403d3a] cursor-pointer" onClick={() => setUiTheme(isDark ? 'light' : 'dark')}><div className={`px-4 py-2 rounded text-xs font-black transition-all ${isDark ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30'}`}>DARK</div><div className={`px-4 py-2 rounded text-xs font-black transition-all ${!isDark ? 'bg-white text-black shadow-lg' : 'opacity-30'}`}>LIGHT</div></div>
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
  if (error && !gameId) return <div className="min-h-screen flex items-center justify-center bg-[#1b1a17] text-white"><div className="text-center premium-panel p-12"><h2 className="text-2xl font-black mb-6">Error: {error}</h2><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-primary">Reset Application</button></div></div>
  if (!user) return <div className="min-h-screen flex flex-col"><AuthScreen /><AnimatePresence><NotificationToast /></AnimatePresence></div>
  if (!gameId) return <div className="min-h-screen flex flex-col bg-[#1b1a17]"><ModeSelection /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><SearchingModal /></div>
  const isGameOver = game && game.status !== 'active'
  const isFlipped = game?.game_mode === 'Person' && user?.id === game?.black_player_id
  return (
    <div className="min-h-screen flex flex-col bg-[#1b1a17]">
      <header className="flex items-center justify-between px-10 py-6 border-b border-[#403d3a] bg-[#262421] shadow-xl"><div className="flex items-center gap-6 cursor-pointer group" onClick={goBackToMenu}><Logo size="md" /><div className="flex flex-col"><span className="text-2xl font-black tracking-tight text-white group-hover:text-[#81b64c] transition-colors leading-none">SHAXMAT+</span><span className="text-[10px] font-black tracking-[0.4em] text-[#81b64c] mt-1 leading-none">GRANDMASTER ARENA</span></div></div><div className="flex items-center gap-10"><ViewSwitcher /><LanguageSwitcher /><ThemeSwitcher /><div className="flex flex-col items-end leading-none"><span className="text-xs text-[#bababa] uppercase font-black mb-1 tracking-widest">{user.username}</span><span className="text-xs font-mono text-[#81b64c] font-black opacity-70">ID: {user.public_id}</span></div></div></header>
      <main className="flex-1 flex flex-col xl:flex-row gap-10 p-6 md:p-10 max-w-[1600px] mx-auto w-full items-start justify-center">
        <section className="flex-1 flex flex-col items-center justify-center order-1 w-full max-w-[680px] mx-auto">{game && <div className="w-full mb-4 flex items-end"><PlayerBadge color={isFlipped ? "white" : "black"} isActive={game.turn === (isFlipped ? "white" : "black") && !isGameOver} /></div>}<div className="w-full bg-[#211f1d] p-1 md:p-2 rounded border border-[#403d3a] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"><Board /></div>{game && <div className="w-full mt-4 flex items-start"><PlayerBadge color={isFlipped ? "black" : "white"} isActive={game.turn === (isFlipped ? "black" : "white") && !isGameOver} /></div>}</section>
        <aside className="w-full xl:w-[420px] order-2 flex flex-col gap-6 shrink-0"><GameControls /><div className="flex flex-col gap-6 flex-1"><MoveHistory />{game?.game_mode === 'Person' && !isSpectator && <Chat />}</div></aside>
      </main>
      <PromotionModal /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><GameOverModal />
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  return ( <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} onClick={() => setNotification(null)} className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-lg text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl cursor-pointer ${notification.type === 'error' ? 'bg-red-500' : 'bg-[#81b64c]'}`}>{notification.text}</motion.div> )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-12 rounded-xl text-center border border-[#403d3a] bg-[#262421] shadow-[0_40px_120px_rgba(0,0,0,0.9)]"><div className="text-8xl mb-8">{isWinner ? '🏆' : '🏁'}</div><h2 className="text-4xl font-black uppercase mb-3 text-white tracking-tight">{isWinner ? t.victory : t.gameOver}</h2><p className="text-[#bababa] text-sm mb-10 uppercase font-black tracking-widest">{game.status === 'resigned' ? t.opponentLeft.replace('{name}', opponentResignedName || '') : t.betterLuck}</p><div className="flex flex-col gap-4"><button onClick={() => useGameStore.getState().startReview()} className="btn-primary w-full shadow-lg">{t.reviewGame}</button><button onClick={goBackToMenu} className="btn-secondary w-full shadow-md">{t.backToMenu}</button></div></motion.div></div>
  )
}

function InviteModal() {
  const { inviteRequest, respondToInvite, t } = useGameStore()
  if (!inviteRequest) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 premium-panel text-center shadow-2xl"><div className="text-5xl mb-6">🎮</div><h2 className="text-2xl font-black text-white uppercase mb-3 tracking-tight">Challenge</h2><p className="text-[#bababa] text-sm mb-8 font-black uppercase tracking-widest"><span className="text-[#81b64c]">{inviteRequest.from_username}</span> wants to play!</p><div className="flex gap-4"><button onClick={() => respondToInvite(false)} className="btn-secondary flex-1">{t.decline}</button><button onClick={() => respondToInvite(true)} className="btn-primary flex-1 shadow-lg">{t.accept}</button></div></motion.div></div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, matchedOpponent, matchOffer, sendMatchStart, acceptMatchOffer, t } = useGameStore()
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  if (!isSearching) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full p-12 premium-panel text-center shadow-[0_50px_150px_rgba(0,0,0,1)] border-[#81b64c]/20">
        {!matchedOpponent ? ( <> <div className="relative w-32 h-32 mx-auto mb-12"><motion.div className="absolute inset-0 rounded-full border-4 border-[#81b64c]/10" /><motion.div className="absolute inset-0 rounded-full border-4 border-t-[#81b64c] border-r-transparent border-b-transparent border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /><div className="absolute inset-0 flex items-center justify-center text-5xl">🌍</div></div> <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{t.searching}</h2> <p className="text-[#81b64c] text-xs mb-12 uppercase tracking-[0.5em] font-black animate-pulse">Global Grandmaster Arena</p> </> ) : (
          <div className="space-y-10"><div className="text-xs font-black text-[#81b64c] uppercase tracking-[0.6em] mb-10">{t.matchFound}</div><div className="flex items-center justify-center gap-12 py-10 bg-[#211f1d] rounded-xl border border-[#403d3a] shadow-inner"><div className="flex flex-col items-center gap-4"><Avatar src={useGameStore.getState().user?.avatar || '👤'} size="lg" /><span className="text-xs text-[#bababa] uppercase font-black tracking-widest">{t.player}</span></div><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl font-black text-[#81b64c] drop-shadow-[0_0_15px_rgba(129,182,76,0.5)]">VS</motion.div><div className="flex flex-col items-center gap-4"><Avatar src={matchedOpponent.avatar} size="lg" /><span className="text-xs text-[#bababa] uppercase font-black tracking-widest truncate max-w-[100px]">{matchedOpponent.username}</span></div></div>
            {matchOffer ? ( <div className="bg-[#81b64c]/10 p-10 rounded-xl border border-[#81b64c]/20 shadow-inner"><div className="text-xs text-[#bababa] uppercase tracking-widest mb-6 font-black">{t.opponentProposed}</div><div className="text-4xl font-black text-white mb-10 tracking-widest">{matchOffer.time_limit / 60}{matchOffer.time_increment ? ` + ${matchOffer.time_increment}` : ' min'}</div><button onClick={acceptMatchOffer} className="btn-primary w-full shadow-2xl">{t.acceptAndStart}</button></div> ) : ( <div className="space-y-8"><div className="text-xs font-black opacity-30 uppercase tracking-widest mb-4">{t.timeControl}</div><div className="grid grid-cols-4 gap-2">{[{l:'1m',s:60,i:0},{l:'3m',s:180,i:0},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0}].map(tc => ( <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i); }} className={`py-3 rounded text-[10px] font-black border transition-all ${timeLimit === tc.s ? 'bg-[#81b64c] text-white border-[#81b64c]' : 'bg-[#211f1d] text-[#bababa] border-[#403d3a]'}`}>{tc.l.toUpperCase()}</button> ))}</div><button onClick={() => sendMatchStart(matchedOpponent.public_id, timeLimit, timeIncrement)} className="btn-primary w-full shadow-2xl">Challenge Opponent</button></div> )}</div>
        )}
        <button onClick={cancelMatchmaking} className="w-full mt-10 py-4 text-xs font-black uppercase tracking-widest text-[#bababa] hover:text-white transition-all opacity-30 hover:opacity-100">{t.cancel}</button>
      </motion.div></div>
  )
}
