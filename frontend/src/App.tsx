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
    <div className={`${sizeClass} bg-[#3c3a37] rounded flex items-center justify-center border border-white/5 overflow-hidden shrink-0 shadow-lg`}>
      {isImage ? <img src={src} alt="avatar" className="w-full h-full object-cover" /> : <span>{src || '👤'}</span>}
    </div>
  );
}

const AVATARS = ['👨‍🚀', '🥷', '🧙‍♂️', '🧛', '🤖', '👾', '👽', '🦊']

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 24 : size === 'md' ? 32 : 48;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L26 10V22L16 28L6 22V10L16 4Z" stroke="#81b64c" strokeWidth="2" />
      <path d="M16 10V22M10 13L22 19M22 13L10 19" stroke="#81b64c" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="16" r="4" fill="#81b64c" fillOpacity="0.2" />
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-[#1b1a17]">
      <div className="mb-8 flex gap-4"><LanguageSwitcher /><ThemeSwitcher /></div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 rounded-xl bg-[#262421] border border-[#403d39] shadow-2xl">
        <div className="text-center mb-10">
            <div className="flex justify-center mb-6"><Logo size="lg" /></div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">SHAXMAT PLUS</h1>
            <p className="text-[#bababa] text-xs font-bold uppercase tracking-widest">{t.subtitle}</p>
        </div>
        <div className="flex mb-10 bg-[#211f1d] p-1 rounded-lg">
            <button onClick={() => { setIsLogin(true); clearAuthError(); }} className={`flex-1 py-3 rounded text-sm font-bold uppercase transition-all ${isLogin ? 'bg-[#3c3a37] text-white shadow-lg' : 'text-[#bababa]'}`}>{t.login}</button>
            <button onClick={() => { setIsLogin(false); clearAuthError(); }} className={`flex-1 py-3 rounded text-sm font-bold uppercase transition-all ${!isLogin ? 'bg-[#3c3a37] text-white shadow-lg' : 'text-[#bababa]'}`}>{t.signup}</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#211f1d] p-4 rounded-lg border border-[#403d3a]">
                  <Avatar src={avatar} size="md" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary flex-1 py-2 text-xs">{isUploading ? '...' : t.uploadPhoto}</button>
                  <input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) setAvatar(url); setIsUploading(false); } }} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map(a => <button key={a} type="button" onClick={() => setAvatar(a)} className={`text-2xl p-2 rounded hover:bg-[#3c3a37] ${avatar === a ? 'bg-[#3c3a37] scale-110 shadow-lg' : 'opacity-40'}`}>{a}</button>)}
                </div>
              </div>
            )}
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#211f1d] border border-[#403d3a] rounded-lg px-5 py-4 text-white outline-none focus:border-[#81b64c]" placeholder={t.username} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#211f1d] border border-[#403d3a] rounded-lg px-5 py-4 text-white outline-none focus:border-[#81b64c]" placeholder={t.password} />
            {authError && <p className="text-red-500 text-sm text-center font-bold">{authError}</p>}
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
  const { createGame, user, searchUser, logout, sendInvite, t, fetchLeaderboard, startMatchmaking, setNotification, fetchFriendRequests, fetchNotifications } = useGameStore()

  useEffect(() => { fetchLeaderboard(); fetchFriendRequests(); fetchNotifications(); }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])

  const totalGames = user ? (user.wins + user.losses + user.draws) : 0;
  const winRate = totalGames > 0 ? Math.round((user!.wins / totalGames) * 100) : 0;

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12">
      <div className="flex justify-center mb-10 gap-4"><LanguageSwitcher /><ThemeSwitcher /></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Profile & Game Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-10 rounded-[2rem] text-center relative overflow-hidden bg-[#262421] border border-[#403d39] shadow-2xl">
            <div className="relative group mx-auto w-fit mb-6 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
              <Avatar src={user?.avatar || '👤'} size="xl" />
              <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><span className="text-[10px] font-black text-white uppercase tracking-widest">Edit</span></div>
            </div>
            <div className="text-[#bababa] text-[10px] uppercase tracking-[0.4em] mb-1 font-bold">{t.welcome}</div>
            <div className="text-3xl font-black text-white uppercase tracking-wider mb-2">{user?.username}</div>
            <div className="inline-block text-[#81b64c] text-[11px] uppercase tracking-widest font-black mb-8 bg-[#81b64c]/10 px-5 py-2 rounded-full border border-[#81b64c]/20">{user ? getUserTitle(user.wins, t) : ''}</div>
            <div className="flex flex-col items-center gap-6">
              <div 
                className="flex items-center gap-4 px-8 py-3 rounded-xl border border-[#403d39] bg-[#211f1d] cursor-pointer hover:bg-[#3c3a37] transition-all shadow-inner"
                onClick={() => { navigator.clipboard.writeText(user?.public_id || ''); setNotification({ text: t.idCopied, type: 'success' }); }}
              >
                <span className="text-[#81b64c] font-mono text-2xl font-black tracking-widest">{user?.public_id}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#81b64c" strokeWidth="3" className="opacity-50"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-[#211f1d] border border-[#403d39] rounded-2xl p-5 shadow-inner">
                  <div className="text-[10px] text-[#bababa] uppercase tracking-widest mb-1 font-bold">Win Rate</div>
                  <div className="text-2xl font-black text-green-500">{winRate}%</div>
                </div>
                <div className="bg-[#211f1d] border border-[#403d39] rounded-2xl p-5 shadow-inner">
                  <div className="text-[10px] text-[#bababa] uppercase tracking-widest mb-1 font-bold">Games</div>
                  <div className="text-2xl font-black text-white">{totalGames}</div>
                </div>
              </div>
              <button onClick={logout} className="text-[#bababa] text-[10px] hover:text-red-500 uppercase tracking-[0.3em] font-black transition-all">{t.logout}</button>
            </div>
          </div>

          <div className="p-10 rounded-[2rem] bg-[#262421] border border-[#403d39] shadow-2xl">
            <div className="mb-10">
              <div className="text-[10px] text-[#bababa] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-[#403d39]" />{t.timeControl}<span className="flex-1 h-[1px] bg-[#403d39]" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[{l:'1m',s:60,i:0},{l:'1+1',s:60,i:1},{l:'3m',s:180,i:0},{l:'3+2',s:180,i:2},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0},{l:'30m',s:1800,i:0}].map(tc => (
                  <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i); }} className={`py-3 rounded text-xs font-black transition-all border ${timeLimit === tc.s && timeIncrement === tc.i ? 'bg-[#81b64c] text-white border-[#81b64c] shadow-lg' : 'bg-[#211f1d] text-[#bababa] border-[#403d39] hover:border-[#bababa]'}`}>{tc.l.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#211f1d] border border-[#403d39] shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-black uppercase tracking-widest">🤖 {t.singlePlayer}</span>
                  <div className="flex gap-2">
                    {['easy', 'normal', 'hard'].map(d => <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${difficulty === d ? 'bg-[#3c3a37] text-[#81b64c] shadow-sm' : 'opacity-30 hover:opacity-100'}`}>{d}</button>)}
                  </div>
                </div>
                <button onClick={() => createGame('AI', undefined, difficulty, timeLimit, timeIncrement)} className="btn-primary w-full py-4 rounded-lg">Battle AI</button>
              </div>
              <button onClick={startMatchmaking} className="btn-primary w-full py-6 rounded-lg flex items-center justify-center gap-4 shadow-xl"><span className="text-2xl">🌍</span><span className="text-xl">{t.quickPlay}</span></button>
              <div className="p-6 rounded-2xl bg-[#211f1d] border border-[#403d39] shadow-inner">
                <div className="text-sm font-black uppercase tracking-widest mb-6 text-left">👤 {t.multiplayer}</div>
                <div className="flex gap-3">
                  <input type="text" maxLength={8} value={opponentId} onChange={e => setOpponentId(e.target.value.replace(/\D/g, ''))} placeholder="Opponent ID" className="flex-1 bg-[#2d2b28] border border-[#403d39] rounded-lg px-5 py-3 text-lg text-center font-mono outline-none focus:border-[#81b64c]" />
                  <button onClick={async () => { if (opponentId.length === 8) { if (opponentId === user?.public_id) { setNotification({ text: t.selfPlayError, type: 'error' }); return } const target = await searchUser(opponentId); if (target) sendInvite(target.public_id, timeLimit, timeIncrement); else setNotification({ text: t.userNotFound, type: 'error' }); } }} className="btn-primary px-6 py-3 text-sm rounded-lg">{t.go}</button>
                </div>
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

function FriendsList() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()
  useEffect(() => { fetchFriends(); fetchFriendRequests(); }, [fetchFriends, fetchFriendRequests])
  if (!friends || !Array.isArray(friends)) return null
  return (
    <div className="w-full bg-[#262421] border border-[#403d39] rounded-[2rem] p-8 flex flex-col shadow-2xl">
      <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3">👤 {t.friends}</h3>
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar" style={{ maxHeight: '400px' }}>
        {pendingRequests?.map((req) => (
          <div key={req.id} className="p-4 rounded bg-green-500/5 border border-green-500/20 flex items-center justify-between">
            <div className="flex items-center gap-4"><Avatar src={req.from_user.avatar} size="sm" /><div className="text-base font-bold">{req.from_user.username}</div></div>
            <button onClick={() => respondToFriendRequest(req.id, true)} className="bg-[#81b64c] text-white p-2 rounded shadow-lg hover:brightness-110"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
          </div>
        ))}
        {friends.length === 0 ? <p className="text-center text-[#bababa] text-xs uppercase py-10 opacity-30">{t.noFriends}</p> : 
          friends.map((f) => (
            <div key={f.id} className="p-4 rounded hover:bg-[#3c3a37] flex items-center justify-between group transition-all">
              <div className="flex items-center gap-4"><div className="relative"><Avatar src={f.avatar} size="sm" />{f.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2d2b28]" />}</div><div><div className="text-base font-bold">{f.username}</div><div className="text-xs text-[#81b64c] font-black uppercase tracking-wider">{getUserTitle(f.wins, t)}</div></div></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => sendInvite(f.public_id)} className="text-[#81b64c] hover:bg-[#81b64c]/10 p-2 rounded"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>
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
    <div className="w-full bg-[#262421] border border-[#403d39] rounded-[2rem] p-8 shadow-2xl">
      <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3">📜 {t.matchHistory}</h3>
      <div className="space-y-4">{displayedHistory.map((m) => { const isWhite = m.white === user?.username; const didIWin = m.winner === (isWhite ? 'white' : 'black'); const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement'; return ( <div key={m.id} className="p-4 rounded bg-[#211f1d] border border-[#403d3a] flex items-center justify-between text-base"><div className="flex items-center gap-4"><div className="flex -space-x-2"><Avatar src={m.white_avatar} size="sm" /><Avatar src={m.black_avatar} size="sm" /></div><div className="font-bold">{m.white} vs {m.black}</div></div><div className={`font-black uppercase tracking-wider ${isDraw ? 'opacity-40' : (didIWin ? 'text-green-500' : 'text-red-500')}`}>{isDraw ? t.draw : (didIWin ? t.victory : t.defeat)}</div></div> ); })}</div>
      {matchHistory.length > 5 && <button onClick={() => setShowAll(!showAll)} className="w-full mt-8 text-xs font-bold text-[#81b64c] uppercase tracking-widest hover:brightness-110">{showAll ? t.showLess : t.showMore}</button>}
    </div>
  )
}

function Leaderboard() {
  const { leaderboard, t, user, friends, sendFriendRequest, setNotification } = useGameStore()
  if (!leaderboard || leaderboard.length === 0) return null
  const friendIds = new Set(friends?.map(f => f.public_id) || []);
  return (
    <div className="w-full bg-[#262421] border border-[#403d39] rounded-[2rem] p-10 shadow-2xl">
      <h3 className="text-lg font-black text-white mb-10 uppercase tracking-widest flex items-center gap-3">🏆 {t.leaderboard}</h3>
      <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px]"><thead className="text-xs uppercase tracking-widest opacity-40 border-b border-[#403d3a]"><tr><th className="pb-6 px-4 w-12">#</th><th className="pb-6 px-4">{t.player}</th><th className="pb-6 px-4 text-center">{t.wins}</th><th className="pb-6 px-4"></th></tr></thead><tbody className="text-base font-bold">{leaderboard.map((u, index) => { const isMe = u.id === user?.id; const isFollowing = friendIds.has(u.public_id); return ( <tr key={u.id} className={`border-b border-[#403d3a]/50 hover:bg-[#3c3a37] transition-colors ${isMe ? 'bg-[#81b64c]/5' : ''}`}><td className="py-6 px-4 opacity-30 font-mono">{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</td><td className="py-6 px-4 flex items-center gap-6"><div className="relative"><Avatar src={u.avatar} size="sm" />{u.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#2d2b28]" />}</div><div><div className="flex items-center gap-3 text-lg">{u.username}{isMe && <span className="text-[10px] text-[#81b64c] border border-[#81b64c]/30 px-2 py-0.5 rounded">YOU</span>}</div><div className="text-xs text-[#81b64c] uppercase tracking-widest mt-1">{getUserTitle(u.wins, t)}</div></div></td><td className="py-6 px-4 text-center font-mono text-green-500 text-2xl">{u.wins}</td><td className="py-6 px-4 text-right">{!isMe && !isFollowing && <button onClick={() => { sendFriendRequest(u.public_id); setNotification({ text: t.friendRequestSent.replace('{name}', u.username), type: 'success' }); }} className="text-[#81b64c] hover:bg-[#81b64c]/10 p-3 rounded transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></button>}</td></tr> ); })}</tbody></table></div>
    </div>
  )
}

function Chat() {
  const { chatMessages, sendChatMessage, user } = useGameStore()
  const [text, setText] = useState('')
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [chatMessages])
  const chatRef = useRef<HTMLDivElement>(null)
  const handleSend = (e: React.FormEvent) => { e.preventDefault(); if (text.trim()) { sendChatMessage(text); setText('') } }
  return (
    <div className="flex flex-col h-[350px] rounded-[2rem] overflow-hidden border border-[#403d39] bg-[#262421] shadow-2xl">
      <div className="px-6 py-4 border-b border-[#403d39] bg-[#211f1d] flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest opacity-50">Live Chat</span><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /></div>
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from === user?.username ? 'items-end' : 'items-start'}`}><span className="text-[10px] opacity-40 mb-1.5 px-1 font-bold uppercase tracking-wider">{msg.from}</span><div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.from === user?.username ? 'bg-[#81b64c] text-white shadow-lg' : 'bg-[#3c3a37] text-white border border-[#403d39]'}`}>{msg.text}</div></div>
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
    <div className="flex p-1 rounded-lg bg-[#211f1d] border border-[#403d3a]">{langs.map(l => ( <button key={l.id} onClick={() => setLanguage(l.id)} className={`px-4 py-2 rounded text-sm font-black transition-all ${language === l.id ? 'bg-[#3c3a37] text-[#81b64c] shadow-lg' : 'opacity-30 hover:opacity-100'}`}>{l.label}</button> ))}</div>
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
  const isWhite = color === 'white'
  const capturedPieces = game?.captured_pieces?.[color] || []
  const avatar = isWhite ? game?.white_avatar : game?.black_avatar
  const timeLeft = isWhite ? (game?.white_time_left || 0) : (game?.black_time_left || 0)
  const formatTime = (s: number) => { const mins = Math.floor(s / 60); const secs = s % 60; return `${mins}:${secs.toString().padStart(2, '0')}` }
  return (
    <div className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${isActive ? 'bg-[#3c3a37]/50 shadow-inner border border-[#403d39]' : ''}`}>
      <div className="flex items-center gap-6"><Avatar src={avatar || (isWhite ? '♔' : '♚')} size="md" /><div><div className="text-xl font-black uppercase tracking-wider" style={{ color: isWhite ? '#fff' : '#bababa' }}>{isWhite ? t.white : t.black}</div><div className="flex gap-1.5 mt-1.5 opacity-40">{capturedPieces.map((p, i) => <span key={i} className="text-base font-bold">{p}</span>)}</div></div></div>
      <div className={`px-8 py-3 rounded-xl font-mono text-3xl font-black tracking-tighter shadow-2xl ${isActive ? (timeLeft < 30 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#3c3a37] text-white') : 'bg-[#211f1d] text-[#bababa] opacity-50'}`}>{formatTime(timeLeft)}</div>
    </div>
  )
}

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, t, uploadAvatar, updateProfile } = useGameStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  if (!isOpen || !user) return null
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 bg-[#262421] border border-[#403d39] rounded-[2rem] relative shadow-2xl"><button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors text-3xl">✕</button><h2 className="text-2xl font-black uppercase tracking-widest mb-10 text-center text-white">{t.editProfile}</h2><div className="flex flex-col items-center gap-10"><Avatar src={user.avatar} size="lg" /><div className="w-full space-y-8"><button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary w-full py-5 text-base">{isUploading ? '...' : t.chooseAvatar}</button><input type="file" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setIsUploading(true); const url = await uploadAvatar(f); if (url) await updateProfile(url); setIsUploading(false); } }} className="hidden" accept="image/*" /><div className="grid grid-cols-4 gap-4 bg-[#211f1d] p-4 rounded-xl border border-[#403d3a]">{AVATARS.map(a => <button key={a} onClick={() => updateProfile(a)} className={`text-4xl p-4 rounded hover:bg-[#3c3a37] transition-all ${user.avatar === a ? 'bg-[#3c3a37] shadow-xl scale-110' : 'opacity-30 hover:opacity-100'}`}>{a}</button>)}</div></div></div></motion.div></div>
  )
}

function LiveGames() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()
  useEffect(() => { fetchLiveGames(); const interval = setInterval(fetchLiveGames, 10000); return () => clearInterval(interval); }, [fetchLiveGames])
  if (!liveGames || liveGames.length === 0) return null
  return (
    <div className="w-full bg-[#262421] border border-[#403d39] rounded-[2rem] p-8 shadow-2xl"><h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /> {t.liveGames}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{liveGames.map((g) => ( <div key={g.game_id} onClick={() => spectateGame(g.game_id)} className="p-5 rounded-2xl bg-[#211f1d] border border-[#403d3a] cursor-pointer hover:border-[#81b64c] transition-all flex items-center justify-between group shadow-xl"><div className="flex items-center gap-5"><div className="flex -space-x-2"><Avatar src={g.white_avatar} size="sm" /><Avatar src={g.black_avatar} size="sm" /></div><div className="text-lg font-bold truncate max-w-[150px]">{g.white} vs {g.black}</div></div><div className="text-sm font-black text-[#81b64c] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Watch</div></div> ))}</div></div>
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
  if (error && !gameId) return <div className="min-h-screen flex items-center justify-center bg-[#1b1a17] text-white"><div className="text-center bg-[#262421] border border-[#403d39] p-12 rounded-[2rem] shadow-2xl"><h2 className="text-3xl font-black mb-8 tracking-tight">Error: {error}</h2><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn-primary py-4 px-10">Reset Application</button></div></div>
  if (!user) return <div className="min-h-screen flex flex-col"><AuthScreen /><AnimatePresence><NotificationToast /></AnimatePresence></div>
  if (!gameId) return <div className="min-h-screen flex flex-col bg-[#1b1a17]"><ModeSelection /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><SearchingModal /></div>
  const isGameOver = game && game.status !== 'active'
  const isFlipped = game?.game_mode === 'Person' && user?.id === game?.black_player_id
  return (
    <div className="min-h-screen flex flex-col bg-[#1b1a17]">
      <header className="flex items-center justify-between px-10 py-8 border-b border-[#403d3a] bg-[#262421] shadow-2xl"><div className="flex items-center gap-8 cursor-pointer group" onClick={goBackToMenu}><Logo size="md" /><div className="flex flex-col"><span className="text-3xl font-black tracking-tight text-white group-hover:text-[#81b64c] transition-colors leading-none">SHAXMAT+</span><span className="text-[11px] font-black tracking-[0.5em] text-[#81b64c] mt-2 leading-none uppercase">Arena</span></div></div><div className="flex items-center gap-12"><ViewSwitcher /><LanguageSwitcher /><ThemeSwitcher /><div className="flex flex-col items-end leading-none"><span className="text-sm text-[#bababa] uppercase font-black mb-1.5 tracking-widest">{user.username}</span><span className="text-sm font-mono text-[#81b64c] font-black opacity-70 tracking-widest">ID: {user.public_id}</span></div></div></header>
      <main className="flex-1 flex flex-col xl:flex-row gap-12 p-8 md:p-12 max-w-[1700px] mx-auto w-full items-start justify-center">
        <section className="flex-1 flex flex-col items-center justify-center order-1 w-full max-w-[650px] mx-auto">{game && <div className="w-full mb-6 flex items-end"><PlayerBadge color={isFlipped ? "white" : "black"} isActive={game.turn === (isFlipped ? "white" : "black") && !isGameOver} /></div>}<div className="w-full bg-[#211f1d] p-1.5 md:p-2 rounded border border-[#403d3a] shadow-[0_40px_120px_rgba(0,0,0,0.9)]"><Board /></div>{game && <div className="w-full mt-6 flex items-start"><PlayerBadge color={isFlipped ? "black" : "white"} isActive={game.turn === (isFlipped ? "black" : "white") && !isGameOver} /></div>}</section>
        <aside className="w-full xl:w-[450px] order-2 flex flex-col gap-8 shrink-0"><GameControls /><div className="flex flex-col gap-8 flex-1"><MoveHistory />{game?.game_mode === 'Person' && !isSpectator && <Chat />}</div></aside>
      </main>
      <PromotionModal /><AnimatePresence><NotificationToast /></AnimatePresence><InviteModal /><GameOverModal />
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null
  return ( <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} onClick={() => setNotification(null)} className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-xl text-black font-black text-sm uppercase tracking-widest shadow-2xl cursor-pointer ${notification.type === 'error' ? 'bg-red-500' : 'bg-[#81b64c]'}`}>{notification.text}</motion.div> )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null
  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || (game.winner === 'black' && user?.id === game.black_player_id)
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-16 rounded-[2rem] text-center border border-[#403d3a] bg-[#262421] shadow-[0_50px_150px_rgba(0,0,0,1)]"><div className="text-9xl mb-10">{isWinner ? '🏆' : '🏁'}</div><h2 className="text-5xl font-black uppercase mb-4 text-white tracking-tighter">{isWinner ? t.victory : t.gameOver}</h2><p className="text-[#bababa] text-base mb-12 uppercase font-black tracking-widest">{game.status === 'resigned' ? t.opponentLeft.replace('{name}', opponentResignedName || '') : t.betterLuck}</p><div className="flex flex-col gap-5"><button onClick={() => useGameStore.getState().startReview()} className="btn-primary w-full py-5 text-lg shadow-2xl">{t.reviewGame}</button><button onClick={goBackToMenu} className="btn-secondary w-full py-5 text-lg shadow-xl">{t.backToMenu}</button></div></motion.div></div>
  )
}

function InviteModal() {
  const { inviteRequest, respondToInvite, t } = useGameStore()
  if (!inviteRequest) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-12 bg-[#262421] border border-[#403d39] rounded-[2.5rem] text-center shadow-[0_40px_120px_rgba(0,0,0,1)]"><div className="text-6xl mb-8">🎮</div><h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Challenge</h2><p className="text-[#bababa] text-base mb-10 font-black uppercase tracking-widest"><span className="text-[#81b64c]">{inviteRequest.from_username}</span> wants to play!</p><div className="flex gap-5"><button onClick={() => respondToInvite(false)} className="btn-secondary flex-1 py-4 text-base">{t.decline}</button><button onClick={() => respondToInvite(true)} className="btn-primary flex-1 py-4 text-base shadow-2xl">{t.accept}</button></div></motion.div></div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, matchedOpponent, matchOffer, sendMatchStart, acceptMatchOffer, t } = useGameStore()
  const [timeLimit, setTimeLimit] = useState(600)
  const [timeIncrement, setTimeIncrement] = useState(0)
  if (!isSearching) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"><motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full p-16 bg-[#262421] border border-[#81b64c]/20 rounded-[3rem] text-center shadow-[0_60px_180px_rgba(0,0,0,1)]">
        {!matchedOpponent ? ( <> <div className="relative w-40 h-40 mx-auto mb-16"><motion.div className="absolute inset-0 rounded-full border-4 border-[#81b64c]/10" /><motion.div className="absolute inset-0 rounded-full border-4 border-t-[#81b64c] border-r-transparent border-b-transparent border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /><div className="absolute inset-0 flex items-center justify-center text-7xl">🌍</div></div> <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-6">{t.searching}</h2> <p className="text-[#81b64c] text-sm mb-16 uppercase tracking-[0.6em] font-black animate-pulse">Regional Grandmaster Arena</p> </> ) : (
          <div className="space-y-12"><div className="text-sm font-black text-[#81b64c] uppercase tracking-[0.7em] mb-12">{t.matchFound}</div><div className="flex items-center justify-center gap-16 py-12 bg-[#211f1d] rounded-2xl border border-[#403d3a] shadow-inner"><div className="flex flex-col items-center gap-6"><Avatar src={useGameStore.getState().user?.avatar || '👤'} size="lg" /><span className="text-sm text-[#bababa] uppercase font-black tracking-widest">{t.player}</span></div><motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl font-black text-[#81b64c] drop-shadow-[0_0_20px_rgba(129,182,76,0.6)]">VS</motion.div><div className="flex flex-col items-center gap-6"><Avatar src={matchedOpponent.avatar} size="lg" /><span className="text-sm text-[#bababa] uppercase font-black tracking-widest truncate max-w-[120px]">{matchedOpponent.username}</span></div></div>
            {matchOffer ? ( <div className="bg-[#81b64c]/10 p-12 rounded-[2rem] border border-[#81b64c]/20 shadow-inner"><div className="text-sm text-[#bababa] uppercase tracking-widest mb-8 font-black">{t.opponentProposed}</div><div className="text-5xl font-black text-white mb-12 tracking-widest">{matchOffer.time_limit / 60}{matchOffer.time_increment ? ` + ${matchOffer.time_increment}` : ' min'}</div><button onClick={acceptMatchOffer} className="btn-primary w-full py-6 text-xl shadow-2xl">{t.acceptAndStart}</button></div> ) : ( <div className="space-y-10"><div className="text-sm font-black opacity-30 uppercase tracking-widest mb-6">{t.timeControl}</div><div className="grid grid-cols-4 gap-3">{[{l:'1m',s:60,i:0},{l:'3m',s:180,i:0},{l:'5m',s:300,i:0},{l:'10m',s:600,i:0}].map(tc => ( <button key={tc.l} onClick={() => { setTimeLimit(tc.s); setTimeIncrement(tc.i); }} className={`py-4 rounded-lg text-sm font-black border transition-all ${timeLimit === tc.s ? 'bg-[#81b64c] text-white border-[#81b64c] shadow-xl' : 'bg-[#211f1d] text-[#bababa] border-[#403d3a]'}`}>{tc.l.toUpperCase()}</button> ))}</div><button onClick={() => sendMatchStart(matchedOpponent.public_id, timeLimit, timeIncrement)} className="btn-primary w-full py-6 text-xl shadow-2xl">Challenge Opponent</button></div> )}</div>
        )}
        <button onClick={cancelMatchmaking} className="w-full mt-12 py-5 text-sm font-black uppercase tracking-widest text-[#bababa] hover:text-white transition-all opacity-30 hover:opacity-100">{t.cancel}</button>
      </motion.div></div>
  )
}
