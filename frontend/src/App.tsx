import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getUserTitle } from './store'
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
    <div className={`${sizeClass} bg-black/20 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden shrink-0`}>
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
      {/* Nexus Connections */}
      <circle cx="16" cy="6" r="2" fill="#4DD9E8" />
      <circle cx="6" cy="16" r="2" fill="#4DD9E8" />
      <circle cx="26" cy="16" r="2" fill="#4DD9E8" />
      <circle cx="16" cy="26" r="2" fill="#4DD9E8" />
      <path d="M16 6L6 16M16 6L26 16M6 16L16 26M26 16L16 26" stroke="#4DD9E8" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      
      {/* Chess Piece Symbol (Stylized Knight/King) */}
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
  const { login, signup, loading, error, t, uploadAvatar } = useGameStore()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const url = await uploadAvatar(file)
      if (url) {
        setAvatar(url)
      }
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    if (isLogin) {
      login(username, password)
    } else {
      signup(username, password, avatar)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <LanguageSwitcher />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-2xl"
        style={{ background: '#131820', border: '1px solid #252D3D', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
      >
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-[0.2em] mb-1 uppercase">
              CHESS
            </h1>
            <h2 className="text-xl font-black text-accentCyan tracking-[0.4em] mb-3 uppercase">
              NEXUS
            </h2>
            <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">{t.subtitle}</p>
        </div>

        <div className="flex mb-8 bg-[#0A0C10] p-1 rounded-xl border border-[#252D3D]">
            <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-accentCyan text-black' : 'text-gray-500'}`}
            >
                {t.login}
            </button>
            <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-accentCyan text-black' : 'text-gray-500'}`}
            >
                {t.signup}
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-3">
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest ml-1">{t.chooseAvatar}</label>
                
                <div className="flex items-center gap-4 bg-[#0A0C10] p-3 rounded-xl border border-[#252D3D]">
                  <Avatar src={avatar} size="md" />
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-[10px] font-black text-accentCyan hover:brightness-110 uppercase tracking-widest border border-accentCyan/30 px-3 py-2 rounded-lg bg-accentCyan/5 transition-all w-full"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-between bg-[#0A0C10] p-2 rounded-xl border border-[#252D3D]">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`text-xl p-1.5 rounded-lg transition-all ${avatar === a ? 'bg-accentCyan/20 scale-110' : 'opacity-50 hover:opacity-100'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{t.username}</label>
                <input 
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-[#252D3D] rounded-xl px-4 py-3 text-white outline-none focus:border-accentCyan transition-colors"
                    placeholder={t.enterUsername}
                />
            </div>
            <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{t.password}</label>
                <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-[#252D3D] rounded-xl px-4 py-3 text-white outline-none focus:border-accentCyan transition-colors"
                    placeholder="••••••••"
                />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button 
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-4 bg-accentCyan text-black font-black rounded-xl uppercase tracking-[0.2em] text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {loading ? t.processing : (isLogin ? t.signIn : t.createAccount)}
            </button>
        </form>
      </motion.div>
    </div>
  )
}

function FriendsList() {
  const { friends, fetchFriends, unfollowUser, sendInvite, t, pendingRequests, fetchFriendRequests, respondToFriendRequest } = useGameStore()

  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()
  }, [fetchFriends, fetchFriendRequests])

  if (!friends || !Array.isArray(friends)) return null

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="rounded-3xl p-8" style={{ background: '#131820', border: '1px solid #252D3D' }}>
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-center flex items-center justify-center gap-3">
          <span className="text-accentCyan">👥</span> {t.friends}
        </h3>
        
        {/* Pending Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="text-[10px] text-accentCyan font-black uppercase tracking-[0.3em] mb-4 text-center">
              {t.friendRequest} ({pendingRequests.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-accentCyan/5 border border-accentCyan/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.from_user.avatar} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-white">{req.from_user.username}</div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest">{t.friendRequestReceived.replace(req.from_user.username, '')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => respondToFriendRequest(req.id, false)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <button 
                      onClick={() => respondToFriendRequest(req.id, true)}
                      className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-b border-[#252D3D] pt-4" />
          </div>
        )}

        {friends.length === 0 ? (
          <p className="text-center text-gray-600 text-xs uppercase tracking-widest py-4">{t.noFriends}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((f) => (
              <div 
                key={f.id}
                className="p-4 rounded-2xl bg-black/20 border border-[#252D3D] flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={f.avatar} size="sm" />
                    {f.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#131820]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {f.username}
                      <span className="text-[8px] text-gray-500 uppercase tracking-tighter">ID: {f.public_id}</span>
                    </div>
                    <div className="text-[9px] text-accentCyan font-black uppercase tracking-widest">{getUserTitle(f.wins, t)}</div>
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {f.is_online && (
                    <button 
                      onClick={() => sendInvite(f.public_id)}
                      className="p-2 rounded-lg bg-accentCyan text-black hover:brightness-110 transition-all"
                      title={t.inviteFriend}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    </button>
                  )}
                  <button 
                    onClick={() => unfollowUser(f.public_id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    title={t.unfollow}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MatchHistory() {
  const { matchHistory, fetchMatchHistory, t, user } = useGameStore()
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchMatchHistory()
  }, [fetchMatchHistory])

  if (!matchHistory || matchHistory.length === 0) return null

  const displayedHistory = showAll ? matchHistory : matchHistory.slice(0, 3)

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="rounded-3xl p-8" style={{ background: '#131820', border: '1px solid #252D3D' }}>
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-center flex items-center justify-center gap-3">
          <span className="text-accentCyan">📜</span> {t.matchHistory}
        </h3>
        <div className="space-y-3">
          {displayedHistory.map((m) => {
            const isWhite = m.white === user?.username;
            const myColor = isWhite ? 'white' : 'black';
            const didIWin = m.winner === myColor;
            const isDraw = m.status.startsWith('draw') || m.status === 'stalemate' || m.status === 'draw_agreement';
            
            return (
              <div 
                key={m.id}
                className="p-4 rounded-2xl bg-black/20 border border-[#252D3D] flex items-center justify-between group hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <Avatar src={m.white_avatar} size="sm" />
                    <Avatar src={m.black_avatar} size="sm" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {m.white} <span className="text-gray-600 mx-1">vs</span> {m.black}
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">{m.date} • {m.game_mode}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isDraw ? 'text-gray-400' : (didIWin ? 'text-green-400' : 'text-red-400')}`}>
                    {isDraw ? t.draw : (didIWin ? t.victory : t.defeat)}
                  </div>
                  <div className="text-[8px] text-gray-600 font-mono">#{m.id}</div>
                </div>
              </div>
            );
          })}
        </div>

        {matchHistory.length > 3 && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-[10px] font-black text-accentCyan uppercase tracking-[0.3em] border-b border-accentCyan/30 pb-1 hover:border-accentCyan transition-all"
            >
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function LiveGames() {
  const { liveGames, fetchLiveGames, spectateGame, t } = useGameStore()

  useEffect(() => {
    fetchLiveGames()
    const interval = setInterval(fetchLiveGames, 10000)
    return () => clearInterval(interval)
  }, [fetchLiveGames])

  if (!liveGames || liveGames.length === 0) return null

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="rounded-3xl p-8" style={{ background: '#131820', border: '1px solid #252D3D' }}>
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-center flex items-center justify-center gap-3">
          <span className="text-red-500 animate-pulse">●</span> {t.liveGames}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {liveGames.map((g) => (
            <motion.div
              key={g.game_id}
              whileHover={{ scale: 1.02 }}
              onClick={() => spectateGame(g.game_id)}
              className="p-4 rounded-2xl bg-black/20 border border-[#252D3D] cursor-pointer flex items-center justify-between group transition-all hover:border-accentCyan/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar src={g.white_avatar} size="sm" />
                  <Avatar src={g.black_avatar} size="sm" />
                </div>
                <div className="text-xs">
                  <div className="text-white font-bold">{g.white} vs {g.black}</div>
                  <div className="text-gray-500 uppercase tracking-widest text-[9px]">{g.move_count} {t.move}s</div>
                </div>
              </div>
              <div className="text-[10px] font-black text-accentCyan uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                {t.spectate} →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Leaderboard() {
  const { leaderboard, t, user, friends, followUser, sendFriendRequest, setNotification } = useGameStore()

  if (!leaderboard || leaderboard.length === 0) return null
  
  const friendIds = new Set(friends?.map(f => f.public_id) || []);

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="rounded-3xl p-8" style={{ background: '#131820', border: '1px solid #252D3D' }}>
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-center flex items-center justify-center gap-3">
          <span className="text-accentCyan">🏆</span> {t.leaderboard} <span className="text-accentCyan">🏆</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-[#252D3D]">
              <tr>
                <th className="px-4 py-3 w-16">{t.rank}</th>
                <th className="px-4 py-3">{t.player}</th>
                <th className="px-4 py-3 text-center">{t.wins}</th>
                <th className="px-4 py-3 text-center">{t.draws}</th>
                <th className="px-4 py-3 text-center">{t.losses}</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, index) => {
                const isMe = u.id === user?.id;
                const isFollowing = friendIds.has(u.public_id);
                return (
                  <tr 
                    key={u.id} 
                    className={`border-b border-[#252D3D]/50 transition-colors ${isMe ? 'bg-accentCyan/10' : 'hover:bg-white/5'}`}
                  >
                    <td className="px-4 py-4 font-mono font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="relative">
                        <Avatar src={u.avatar} size="sm" />
                        {u.is_online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#131820]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {u.username}
                          {isMe && <span className="text-[8px] px-1.5 py-0.5 rounded bg-accentCyan text-black font-black uppercase tracking-tighter">YOU</span>}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accentCyan/10 text-accentCyan border border-accentCyan/20 uppercase tracking-widest">{getUserTitle(u.wins, t)}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {u.public_id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-green-400">{u.wins}</td>
                    <td className="px-4 py-4 text-center font-mono text-gray-400">{u.draws}</td>
                    <td className="px-4 py-4 text-center font-mono text-red-400">{u.losses}</td>
                    <td className="px-4 py-4 text-right">
                      {!isMe && !isFollowing && (
                        <button 
                          onClick={() => {
                            sendFriendRequest(u.public_id);
                            setNotification({ 
                              text: t.friendRequestSent.replace('{name}', u.username), 
                              type: 'success' 
                            });
                          }}
                          className="p-2 rounded-lg bg-accentCyan/10 text-accentCyan hover:bg-accentCyan hover:text-black transition-all"
                          title={t.follow}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        </button>
                      )}
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

function ModeSelection() {
  const [opponentId, setOpponentId] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [foundUser, setFoundUser] = useState<any>(null)
  const { createGame, user, searchUser, logout, sendInvite, t, fetchLeaderboard, startMatchmaking, followUser, friends, sendFriendRequest, setNotification, fetchFriendRequests, fetchNotifications } = useGameStore()

  useEffect(() => {
    fetchLeaderboard()
    fetchFriendRequests()
    fetchNotifications()
  }, [fetchLeaderboard, fetchFriendRequests, fetchNotifications])

  const friendIds = new Set(friends?.map(f => f.public_id) || []);

  const totalGames = user ? (user.wins + user.losses + user.draws) : 0;
  const winRate = totalGames > 0 ? Math.round((user!.wins / totalGames) * 100) : 0;

  const handleSearch = async () => {
    if (opponentId.length === 8) {
      if (opponentId === user?.public_id) {
        setNotification({ text: t.selfPlayError, type: 'error' })
        return
      }
      const target = await searchUser(opponentId)
      if (target) {
        setFoundUser(target)
      } else {
        setNotification({ text: t.userNotFound, type: 'error' })
        setFoundUser(null)
      }
    }
  }

  const startAIGame = () => createGame('AI', undefined, difficulty)
  
  const startPersonGame = (targetId: string) => {
    sendInvite(targetId)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div className="flex justify-center mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
              <Avatar src={user?.avatar || '👨‍🚀'} size="xl" />
              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Edit</span>
              </div>
            </div>
            <div className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-1 mt-3">{t.welcome}</div>
            <div className="text-4xl font-black text-white uppercase tracking-wider mb-1 flex items-center gap-3">
              {user?.username}
            </div>
            <div className="text-accentCyan text-xs uppercase tracking-widest font-bold mb-4 bg-accentCyan/10 px-3 py-1 rounded-full border border-accentCyan/20">
              {user ? getUserTitle(user.wins, t) : ''}
            </div>
            <div className="flex items-center justify-center gap-4">
                <span className="text-gray-400 font-mono text-xs px-3 py-1 rounded-full border border-[#252D3D] bg-black/40">ID: {user?.public_id}</span>
                <button onClick={logout} className="text-gray-600 text-[10px] hover:text-white uppercase tracking-widest border-b border-gray-800 pb-0.5">{t.logout}</button>
            </div>

            <div className="flex gap-4 mt-6">
              <div className="bg-[#131820] border border-[#252D3D] rounded-2xl px-6 py-3 text-center">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{t.winRate}</div>
                <div className="text-xl font-black text-accentCyan">{winRate}%</div>
              </div>
              <div className="bg-[#131820] border border-[#252D3D] rounded-2xl px-6 py-3 text-center">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{t.totalGames}</div>
                <div className="text-xl font-black text-white">{totalGames}</div>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            <motion.div 
                whileHover={{ y: -5, borderColor: 'rgba(77,217,232,0.4)' }}
                onClick={startAIGame}
                className="p-10 rounded-3xl cursor-pointer flex flex-col items-center text-center gap-6 group transition-all"
                style={{ background: '#131820', border: '1px solid #252D3D' }}
            >
                <div className="w-20 h-20 bg-accentCyan/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🤖</div>
                <div className="w-full">
                    <div className="text-2xl font-black text-white mb-2 uppercase tracking-widest">{t.singlePlayer}</div>
                    <div className="text-gray-500 text-sm leading-relaxed mb-6">{t.practiceAI}</div>
                    
                    <div className="flex gap-2 bg-[#0A0C10] p-1.5 rounded-xl border border-[#252D3D]">
                        {[
                            { id: 'easy', label: t.easy },
                            { id: 'normal', label: t.normal },
                            { id: 'hard', label: t.hard },
                        ].map(d => (
                            <button
                                key={d.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDifficulty(d.id);
                                }}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${difficulty === d.id ? 'bg-accentCyan text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                {d.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ y: -5, borderColor: 'rgba(77,217,232,0.4)' }}
                onClick={startMatchmaking}
                className="p-10 rounded-3xl cursor-pointer flex flex-col items-center text-center gap-6 group transition-all"
                style={{ background: '#131820', border: '1px solid #252D3D' }}
            >
                <div className="w-20 h-20 bg-accentCyan/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🌍</div>
                <div>
                    <div className="text-2xl font-black text-white mb-2 uppercase tracking-widest">{t.quickPlay}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{t.searching}</div>
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ y: -5, borderColor: 'rgba(77,217,232,0.4)' }}
                className="p-10 rounded-3xl flex flex-col items-center text-center gap-6 transition-all"
                style={{ background: '#131820', border: '1px solid #252D3D' }}
            >
                <div className="w-20 h-20 bg-accentCyan/10 rounded-2xl flex items-center justify-center text-4xl">👤</div>
                <div className="w-full">
                    <div className="text-2xl font-black text-white mb-2 uppercase tracking-widest">{t.multiplayer}</div>
                    <div className="text-gray-500 text-sm mb-6 leading-relaxed">{t.playPerson}</div>
                    
                    {!foundUser ? (
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              maxLength={8}
                              value={opponentId}
                              onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  setOpponentId(val);
                              }}
                              placeholder={t.opponentID}
                              className="flex-1 bg-[#0A0C10] border border-[#252D3D] rounded-xl px-3 py-3 text-white text-center font-mono text-sm outline-none focus:border-accentCyan tracking-[0.1em] min-w-0"
                          />
                          <button 
                              onClick={handleSearch}
                              className="bg-accentCyan text-black px-4 py-3 rounded-xl font-black uppercase hover:brightness-110 active:scale-95 transition-all text-xs whitespace-nowrap"
                          >
                              {t.go}
                          </button>
                      </div>
                    ) : (
                      <div className="bg-[#0A0C10] p-4 rounded-2xl border border-accentCyan/30 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar src={foundUser.avatar} size="md" />
                          <div className="text-left">
                            <div className="text-sm font-bold text-white">{foundUser.username}</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">ID: {foundUser.public_id}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startPersonGame(foundUser.public_id)}
                            className="flex-1 py-2.5 bg-accentCyan text-black font-black text-[10px] uppercase rounded-lg hover:brightness-110 transition-all"
                          >
                            {t.inviteFriend}
                          </button>
                          {!friendIds.has(foundUser.public_id) && (
                            <button 
                              onClick={() => {
                                sendFriendRequest(foundUser.public_id);
                                setNotification({ 
                                  text: t.friendRequestSent.replace('{name}', foundUser.username), 
                                  type: 'success' 
                                });
                                setFoundUser(null);
                                setOpponentId('');
                              }}
                              className="p-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all"
                              title={t.follow}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setFoundUser(null);
                              setOpponentId('');
                            }}
                            className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                </div>
            </motion.div>
        </div>

        <LiveGames />
        <FriendsList />
        <MatchHistory />
        <Leaderboard />
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}

function ViewSwitcher() {
  const { viewMode, setViewMode, t } = useGameStore()
  return (
    <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
      <button
        onClick={() => setViewMode('2d')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === '2d' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
      >
        2D
      </button>
      <button
        onClick={() => setViewMode('3d')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === '3d' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
      >
        3D
      </button>
    </div>
  )
}

function LanguageSwitcher() {
  const { language, setLanguage } = useGameStore()
  const langs: { id: Language; label: string; flag: string }[] = [
    { id: 'uz', label: 'UZB', flag: '🇺🇿' },
    { id: 'ru', label: 'RUS', flag: '🇷🇺' },
    { id: 'en', label: 'ENG', flag: '🇺🇸' },
  ]

  return (
    <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
      {langs.map(l => (
        <button
          key={l.id}
          onClick={() => setLanguage(l.id)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 ${language === l.id ? 'bg-accentCyan text-black' : 'text-gray-500 hover:text-white'}`}
        >
          <span>{l.flag}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}

function CapturedPieces({ pieces, color }: { pieces: string[]; color: 'white' | 'black' }) {
  if (!pieces || pieces.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 opacity-60">
      {pieces.map((p, i) => (
        <span key={i} className={`text-xs ${color === 'white' ? 'text-white' : 'text-accentCyan'}`}>
          {p}
        </span>
      ))}
    </div>
  );
}

function PlayerBadge({ color, isActive }: { color: 'white' | 'black'; isActive: boolean }) {
  const { t, game } = useGameStore()
  const isWhite = color === 'white'
  
  // Show pieces captured BY this player
  const capturedPieces = game?.captured_pieces?.[color] || []
  
  // Get avatar
  const avatar = isWhite ? game?.white_avatar : game?.black_avatar

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300"
      style={{
        background: isActive ? (isWhite ? 'rgba(221,230,239,0.08)' : 'rgba(77,217,232,0.08)') : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? (isWhite ? 'rgba(221,230,239,0.2)' : 'rgba(77,217,232,0.2)') : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      <Avatar src={avatar || (isWhite ? '♔' : '♚')} size="sm" />
      <div className="flex-1 min-w-0">

        <div className="text-sm font-semibold uppercase tracking-wider truncate" style={{ color: isWhite ? '#DDE6EF' : '#4DD9E8' }}>
          {isWhite ? t.white : t.black}
        </div>
        <CapturedPieces pieces={capturedPieces} color={color} />
      </div>
      {isActive && (
        <motion.div
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ background: isWhite ? '#DDE6EF' : '#4DD9E8' }}
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}

function InviteModal() {
  const inviteRequest = useGameStore(s => s.inviteRequest)
  const respondToInvite = useGameStore(s => s.respondToInvite)
  const t = useGameStore(s => s.t)
  if (!inviteRequest) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full p-8 rounded-3xl text-center"
        style={{ background: '#131820', border: '1px solid #4DD9E8' }}
      >
        <div className="text-4xl mb-4">🎮</div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">{t.inviteReceived.replace('{name}', '')}</h2>
        <p className="text-gray-400 text-sm mb-6">
          <span className="text-accentCyan font-bold">{inviteRequest.from_username}</span> {t.playPerson.toLowerCase()}?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => respondToInvite(false)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-800 hover:bg-white/5 transition-all"
          >
            {t.decline}
          </button>
          <button 
            onClick={() => respondToInvite(true)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-accentCyan text-black hover:brightness-110 transition-all"
          >
            {t.accept}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Chat() {
  const { chatMessages, sendChatMessage, t, user } = useGameStore()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      sendChatMessage(text)
      setText('')
    }
  }

  return (
    <div className="flex flex-col h-[300px] rounded-2xl overflow-hidden border border-[#252D3D]" style={{ background: '#131820' }}>
      <div className="px-4 py-2 border-b border-[#252D3D] flex items-center justify-between bg-black/20">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Chat</span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-widest text-center px-4">
            No messages yet. Say hi to your opponent!
          </div>
        ) : (
          chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.from === user?.username ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] text-gray-600 mb-1 px-1">{msg.from}</span>
              <div 
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${
                  msg.from === user?.username 
                    ? 'bg-accentCyan text-black font-medium rounded-tr-none' 
                    : 'bg-[#1C2330] text-gray-300 rounded-tl-none border border-[#252D3D]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 bg-black/40 border-t border-[#252D3D] flex gap-2">
        <input 
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-[#0A0C10] border border-[#252D3D] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accentCyan transition-colors"
        />
        <button 
          type="submit"
          className="bg-accentCyan text-black p-2 rounded-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  )
}

function NotificationToast() {
  const { notification, setNotification } = useGameStore()
  if (!notification) return null

  const bg = notification.type === 'success' ? 'bg-green-500' : 
             notification.type === 'error' ? 'bg-red-500' : 'bg-accentCyan';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      onClick={() => setNotification(null)}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl text-black font-bold text-sm shadow-2xl cursor-pointer ${bg}`}
    >
      {notification.text}
    </motion.div>
  )
}

function NotificationCenter() {
  const { notifications, unreadCount, fetchNotifications, markNotificationRead, t } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0C10]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[140]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 max-h-[400px] overflow-hidden rounded-2xl border border-[#252D3D] bg-[#131820] shadow-2xl z-[150]"
            >
              <div className="p-4 border-b border-[#252D3D] flex items-center justify-between bg-black/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t.notifications}</span>
                {unreadCount > 0 && <span className="text-[9px] text-accentCyan font-bold">{unreadCount} new</span>}
              </div>
              
              <div className="overflow-y-auto max-h-[340px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[10px] text-gray-600 uppercase tracking-widest">{t.noNotifications}</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.is_read && markNotificationRead(n.id)}
                      className={`p-4 border-b border-[#252D3D]/50 cursor-pointer transition-all ${!n.is_read ? 'bg-accentCyan/5' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <div className="text-xs text-white mb-1">{n.text}</div>
                      <div className="text-[8px] text-gray-600 uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    if (file) {
      setIsUploading(true)
      const url = await uploadAvatar(file)
      if (url) {
        await updateProfile(url)
      }
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-3xl border border-[#252D3D] bg-[#131820] relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 text-center">{t.editProfile}</h2>
        
        <div className="flex flex-col items-center gap-6">
          <Avatar src={user.avatar} size="xl" />
          
          <div className="w-full space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-4 bg-accentCyan text-black font-black rounded-2xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
            >
              {isUploading ? '...' : t.chooseAvatar}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => updateProfile(a)}
                  className={`text-2xl p-3 rounded-xl bg-black/20 border ${user.avatar === a ? 'border-accentCyan' : 'border-[#252D3D]'} hover:bg-black/40 transition-all`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function WaitingModal() {
  const { isInviting, t } = useGameStore()
  if (!isInviting) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full p-10 rounded-[3rem] text-center border border-accentCyan/30 bg-[#131820]"
      >
        <div className="relative w-20 h-20 mx-auto mb-8">
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-accentCyan/20"
          />
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-t-accentCyan border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">⏳</div>
        </div>
        
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">{t.searching}</h2>
        <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest">{t.inviteSent.replace('{name}', isInviting)}</p>

        <button 
          onClick={() => useGameStore.setState({ isInviting: null })}
          className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/5"
        >
          {t.cancel}
        </button>
      </motion.div>
    </div>
  )
}

function SearchingModal() {
  const { isSearching, cancelMatchmaking, t } = useGameStore()
  if (!isSearching) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full p-10 rounded-[3rem] text-center border border-accentCyan/30 bg-[#131820]"
      >
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-accentCyan/20"
          />
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-t-accentCyan border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🌍</div>
        </div>
        
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">{t.searching}</h2>
        <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest">Global Lobby</p>

        <button 
          onClick={cancelMatchmaking}
          className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/5"
        >
          {t.decline}
        </button>
      </motion.div>
    </div>
  )
}

function FriendRequestModal() {
  const { friendRequest, respondToFriendRequest, t } = useGameStore()
  if (!friendRequest) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full p-8 rounded-3xl text-center border border-[#4DD9E8]/30"
        style={{ background: '#131820' }}
      >
        <div className="text-4xl mb-4">🤝</div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">{t.friendRequest}</h2>
        <p className="text-gray-400 text-sm mb-6">
          <span className="text-accentCyan font-bold">{friendRequest.from_username}</span> {t.friendRequestReceived.replace(friendRequest.from_username, '')}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => respondToFriendRequest(false)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-800 hover:bg-white/5 transition-all"
          >
            {t.decline}
          </button>
          <button 
            onClick={() => respondToFriendRequest(true)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-accentCyan text-black hover:brightness-110 transition-all"
          >
            {t.accept}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DrawOfferModal() {
  const { drawOffer, respondToDraw, t } = useGameStore()
  if (!drawOffer) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full p-8 rounded-3xl text-center border border-white/10"
        style={{ background: '#131820' }}
      >
        <div className="text-4xl mb-4">🤝</div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">{t.draw}</h2>
        <p className="text-gray-400 text-sm mb-6">
          {t.drawOffered.replace('{name}', drawOffer.from_username)}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => respondToDraw(false)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-800 hover:bg-white/5 transition-all"
          >
            {t.decline}
          </button>
          <button 
            onClick={() => respondToDraw(true)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-all"
          >
            {t.accept}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function GameOverModal() {
  const { game, user, t, goBackToMenu, opponentResignedName, reviewMode, isSpectator } = useGameStore()
  if (!game || game.status === 'active' || reviewMode) return null

  // Special title for spectators
  if (isSpectator) {
    const isDraw = game.status.startsWith('draw') || game.status === 'stalemate' || game.status === 'draw_agreement'
    
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full p-10 rounded-[2.5rem] text-center border border-white/10 bg-[#131820]"
        >
          <div className="text-7xl mb-6">{isDraw ? '🤝' : '🏁'}</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">
            {isDraw ? t.draw : t.gameOver}
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {isDraw 
              ? t.stalemate 
              : (game.winner === 'white' ? (game.white_avatar + ' ' + t.white) : (game.black_avatar + ' ' + t.black)) + ' ' + t.victory.toLowerCase()
            }
          </p>
          <button 
            onClick={goBackToMenu}
            className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-all active:scale-95"
          >
            {t.backToMenu}
          </button>
        </motion.div>
      </div>
    )
  }

  const isWinner = (game.winner === 'white' && user?.id === game.white_player_id) || 
                   (game.winner === 'black' && user?.id === game.black_player_id)
  
  const isDraw = game.status.startsWith('draw') || game.status === 'stalemate' || game.status === 'draw_agreement'

  let message = isWinner ? t.congratulations : (isDraw ? t.stalemate : t.betterLuck)
  if (game.status === 'resigned') {
    message = t.opponentLeft.replace('{name}', opponentResignedName || '')
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full p-10 rounded-[2.5rem] text-center relative overflow-hidden"
        style={{ 
          background: '#131820', 
          border: `2px solid ${isWinner ? '#4DD9E8' : (isDraw ? '#94A3B8' : '#FF3B3B')}`,
          boxShadow: `0 0 50px ${isWinner ? 'rgba(77,217,232,0.2)' : 'rgba(0,0,0,0.5)'}`
        }}
      >
        {/* Particle effect for winner */}
        {isWinner && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-accentCyan"
                initial={{ x: '50%', y: '50%', opacity: 1 }}
                animate={{ 
                  x: `${Math.random() * 100}%`, 
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 0.5
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}

        <div className="text-7xl mb-6">
          {isWinner ? '🏆' : (isDraw ? '🤝' : '💀')}
        </div>
        
        <h2 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${isWinner ? 'text-accentCyan' : (isDraw ? 'text-gray-300' : 'text-checkRed')}`}>
          {isWinner ? t.victory : (isDraw ? t.draw : t.defeat)}
        </h2>
        
        <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">
          {message}
        </p>

        <div className="flex flex-col gap-3 relative z-10">
          <button 
            onClick={() => {
              useGameStore.getState().startReview();
            }}
            className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-accentCyan text-black hover:brightness-110 transition-all active:scale-95"
          >
            {t.reviewGame}
          </button>
          <button 
            onClick={goBackToMenu}
            className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10"
          >
            {t.backToMenu}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function GameInfo() {
  const { game, user, t, isSpectator } = useGameStore()
  if (!game || !user) return null

  if (isSpectator) {
    return (
      <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-center mb-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest mr-2">{t.watching}</span>
        <span className="text-xs font-black text-red-500 uppercase">LIVE</span>
      </div>
    )
  }

  let userColor = ''
  if (game.game_mode === 'AI') {
    userColor = t.white
  } else {
    if (user.id === game.white_player_id) userColor = t.white
    else if (user.id === game.black_player_id) userColor = t.black
  }

  return (
    <div className="px-4 py-2 rounded-xl bg-accentCyan/5 border border-accentCyan/20 text-center mb-2">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest mr-2">{t.playingAs}</span>
      <span className="text-xs font-black text-accentCyan uppercase">{userColor}</span>
    </div>
  )
}

export default function App() {
  const { user, gameId, game, fetchGame, error, initSocket, goBackToMenu, t, setLanguage, isSpectator } = useGameStore()
  const inviteRequest = useGameStore(s => s.inviteRequest)

  useEffect(() => {
    const saved = localStorage.getItem('shaxmat_user')
    const token = localStorage.getItem('shaxmat_token')
    const savedGameId = localStorage.getItem('shaxmat_game_id')
    const savedIsSpectator = localStorage.getItem('shaxmat_spectator') === 'true'
    const savedLang = localStorage.getItem('shaxmat_lang') as Language
    
    if (savedLang) {
      setLanguage(savedLang)
    }

    if (saved && token && !user) {
      const u = JSON.parse(saved)
      useGameStore.setState({ user: u, token: token, isSpectator: savedIsSpectator })
      initSocket(u.public_id)
      
      if (savedGameId) {
        const gid = parseInt(savedGameId, 10)
        useGameStore.setState({ gameId: gid })
      }
    }
  }, [user, initSocket, setLanguage])

  useEffect(() => {
    if (gameId) fetchGame()
  }, [gameId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0C10]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Error Occurred</h2>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full py-3 bg-white text-black font-bold rounded-xl uppercase tracking-widest"
          >
            Clear Data & Reset
          </button>
        </div>
      </div>
    )
  }

  if (!user) return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(circle at 50% 50%, #131820 0%, #0A0C10 100%)' }}>
        <AuthScreen />
        <InviteModal />
        <FriendRequestModal />
        <NotificationToast />
    </div>
  )

  if (!gameId) return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(circle at 50% 50%, #131820 0%, #0A0C10 100%)' }}>
        <ModeSelection />
        <InviteModal />
        <FriendRequestModal />
        <NotificationToast />
    </div>
  )

  const isGameOver = game && game.status !== 'active'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0C10' }}>
      <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid #1C2330' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all group"
            onClick={goBackToMenu}
            style={{ background: 'rgba(77,217,232,0.03)', border: '1px solid rgba(77,217,232,0.1)' }}
          >
            <Logo size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-[0.3em] uppercase text-white leading-none group-hover:text-accentCyan transition-colors">CHESS</span>
              <span className="text-[10px] font-black tracking-[0.5em] uppercase text-accentCyan leading-none mt-1">NEXUS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ViewSwitcher />
          <LanguageSwitcher />
          <NotificationCenter />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">{user.username}</span>
            <span className="text-xs font-mono text-accentCyan">ID: {user.public_id}</span>
          </div>
          {game && (
            <div
              className="text-[10px] px-4 py-1.5 rounded-full font-black tracking-widest uppercase"
              style={{
                background: isGameOver ? 'rgba(255,59,59,0.1)' : 'rgba(77,217,232,0.1)',
                border: `1px solid ${isGameOver ? 'rgba(255,59,59,0.2)' : 'rgba(77,217,232,0.2)'}`,
                color: isGameOver ? '#FF3B3B' : '#4DD9E8',
              }}
            >
              {isGameOver ? game.status.replace('_', ' ') : (game.game_mode === 'AI' ? `AI (${game.ai_difficulty})` : 'PVP')}
            </div>
          )}
        </div>
      </header>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="px-6 py-2 text-sm text-center font-bold tracking-wider"
            style={{ background: '#FF3B3B', color: '#000' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <aside className="w-full lg:w-64 flex flex-col gap-4 order-2 lg:order-1">
          {game && (
            <div className="flex flex-col gap-3">
              <PlayerBadge color="black" isActive={game.turn === 'black' && !isGameOver} />
              <PlayerBadge color="white" isActive={game.turn === 'white' && !isGameOver} />
            </div>
          )}
          <GameInfo />
          <GameControls />
        </aside>

        <section className="flex-1 flex items-start justify-center order-1 lg:order-2">
          <Board />
        </section>

        <aside className="w-full lg:w-72 order-3 flex flex-col gap-4">
          <MoveHistory />
          <div className="rounded-2xl px-5 py-4" style={{ background: '#131820', border: '1px solid #252D3D' }}>
            <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-4">{t.pieces}</div>
            <div className="grid grid-cols-2 gap-y-3 text-[11px] text-gray-400">
              {[ ['K', 'King'], ['Q', 'Queen'], ['R', 'Rook'], ['B', 'Bishop'], ['N', 'Knight'], ['P', 'Pawn'], ['S', 'Supplier'], ].map(([tcode, name]) => (
                <div key={tcode} className="flex items-center gap-2">
                  <span className={`font-black w-4 ${tcode === 'S' ? 'text-accentCyan' : ''}`}>{tcode}</span>
                  <span className={`${tcode === 'S' ? 'text-accentCyan' : ''}`}>{name}</span>
                </div>
              ))}
            </div>
          </div>
          {game && game.game_mode === 'Person' && !isSpectator && <Chat />}
        </aside>
      </main>
      <PromotionModal />
      <InviteModal />
      <DrawOfferModal />
      <GameOverModal />
      <SearchingModal />
      <WaitingModal />
      <NotificationToast />
    </div>
  )
}
