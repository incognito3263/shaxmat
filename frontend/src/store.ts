import { create } from 'zustand'
import { translations, Language } from './translations'

export interface Piece {
  type: string
  color: string
  has_moved?: boolean
}

export interface GameData {
  id: number
  status: string
  turn: string
  winner: string | null
  board: (Piece | null)[][]
  move_history: string[]
  halfmove_clock: number
  fullmove_number: number
  legal_moves: Record<string, string[]>
  in_check: boolean
  white_time_left: number
  black_time_left: number
  time_increment: number
  game_mode: string

  white_player_id: number | null
  black_player_id: number | null
  white_player_public_id: string | null
  black_player_public_id: string | null
  white_avatar: string | null
  black_avatar: string | null
  ai_difficulty: string
  evaluation: number
  captured_pieces: { white: string[]; black: string[] } | null
  last_move: { from: [number, number]; to: [number, number] } | null
}

export interface User {
  id: number
  username: string
  public_id: string
  is_online: boolean
  wins: number
  losses: number
  draws: number
  avatar: string
}

export function getUserTitle(wins: number, t: any): string {
  if (wins >= 100) return t.titleKing;
  if (wins >= 50) return t.titleGrandmaster;
  if (wins >= 10) return t.titleMaster;
  return t.titleNovice;
}

interface GameStore {
  user: User | null
  token: string | null
  gameId: number | null
  game: GameData | null
  selectedSquare: string | null
  legalMoves: string[]
  pendingPromotion: { from: string; to: string; color: string } | null
  loading: boolean
  error: string | null
  authError: string | null
  vsAI: boolean
  socket: WebSocket | null
  inviteRequest: { from_id: string; from_username: string; time_limit?: number; time_increment?: number } | null
  language: Language
  t: typeof translations.en
  leaderboard: User[]
  opponentResignedName: string | null
  chatMessages: { from: string; text: string }[]
  soundSettings: { move: boolean; capture: boolean; check: boolean; end: boolean }
  isSearching: boolean
  matchedOpponent: { public_id: string; username: string; avatar: string } | null
  matchOffer: { from_id: string; from_username: string; time_limit: number; time_increment: number } | null
  isInviting: string | null
  boardTheme: string
  pieceTheme: 'classic' | 'modern'
  uiTheme: 'dark' | 'light'
  viewMode: '2d' | '3d'
  drawOffer: { from_id: string; from_username: string } | null
  friendRequest: { from_id: string; from_username: string } | null
  reviewMode: boolean
  reviewIndex: number
  reviewBoardData: { board: any; turn: string; captured_pieces: any; last_move: any; evaluation: number } | null
  liveGames: any[]
  isSpectator: boolean
  matchHistory: any[]
  friends: User[]
  notification: { text: string; type: 'success' | 'info' | 'error' } | null
  pendingRequests: any[]
  notifications: any[]
  unreadCount: number

  signup: (username: string, password: string, avatar: string) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  clearAuthError: () => void
  uploadAvatar: (file: File) => Promise<string | null>
  updateProfile: (avatar: string) => Promise<void>
  logout: () => void
  setLanguage: (lang: Language) => void
  setTheme: (theme: string) => void
  setSoundSettings: (settings: Partial<{ move: boolean; capture: boolean; check: boolean; end: boolean }>) => void
  setPieceTheme: (theme: 'classic' | 'modern') => void
  setUiTheme: (theme: 'dark' | 'light') => void
  setViewMode: (mode: '2d' | '3d') => void
  setNotification: (notif: { text: string; type: 'success' | 'info' | 'error' } | null) => void
  createGame: (mode: string, opponentId?: string, aiDifficulty?: string, timeLimit?: number, timeIncrement?: number) => Promise<void>
  fetchGame: () => Promise<void>
  fetchLiveGames: () => Promise<void>
  fetchMatchHistory: () => Promise<void>
  fetchFriends: () => Promise<void>
  fetchFriendRequests: () => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationRead: (id: number) => Promise<void>
  sendFriendRequest: (targetId: string) => Promise<void>
  respondToFriendRequest: (requestId: number, accept: boolean) => Promise<void>
  followUser: (publicId: string) => Promise<void>
  unfollowUser: (publicId: string) => Promise<void>
  spectateGame: (gameId: number) => Promise<void>
  selectSquare: (square: string) => void
  makeMove: (from: string, to: string, promotion?: string) => Promise<void>
  aiMove: () => Promise<void>
  toggleAI: () => void
  resign: () => Promise<void>
  offerDraw: () => void
  respondToDraw: (accept: boolean) => void
  sendChatMessage: (text: string) => void
  startMatchmaking: () => void
  cancelMatchmaking: () => void
  sendMatchStart: (targetId: string, timeLimit: number, timeIncrement: number) => void
  acceptMatchOffer: () => void
  startReview: () => void
  setReviewIndex: (index: number) => Promise<void>
  resolvePromotion: (piece: string) => Promise<void>
  cancelPromotion: () => void
  newGame: () => Promise<void>
  goBackToMenu: () => void
  searchUser: (publicId: string) => Promise<User | null>
  fetchLeaderboard: () => Promise<void>
  sendInvite: (targetPublicId: string, timeLimit?: number, timeIncrement?: number) => void
  initSocket: (publicId: string) => void
  respondToInvite: (accept: boolean) => void
}

const API_BASE = '/game'

function getApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const d = (data as { detail?: unknown }).detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d.length > 0) {
    const first = d[0] as { msg?: string; loc?: string[] }
    return first.msg || (first.loc ? first.loc.join('. ') + ' – required' : fallback)
  }
  return fallback
}

function squareToRowCol(square: string): [number, number] {
  const col = square.charCodeAt(0) - 97
  const row = parseInt(square.slice(1), 10) - 1
  return [row, col]
}

function getPieceAt(board: (Piece | null)[][], square: string): Piece | null {
  const [row, col] = squareToRowCol(square)
  if (row < 0 || row >= 10 || col < 0 || col >= 8) return null
  return board[row]?.[col] ?? null
}

function isPromotionMove(piece: Piece, toSquare: string): boolean {
  if (!['P', 'S'].includes(piece.type.toUpperCase())) return false
  const row = parseInt(toSquare.slice(1), 10)
  return (piece.color === 'white' && row === 10) || (piece.color === 'black' && row === 1)
}

const SOUNDS: Record<string, HTMLAudioElement> = {
  move: new Audio('https://github.com/lichess-org/lila/raw/master/public/sound/standard/Move.mp3'),
  capture: new Audio('https://github.com/lichess-org/lila/raw/master/public/sound/standard/Capture.mp3'),
  check: new Audio('https://github.com/lichess-org/lila/raw/master/public/sound/standard/Check.mp3'),
  start: new Audio('https://github.com/lichess-org/lila/raw/master/public/sound/standard/GenericNotify.mp3'),
  end: new Audio('https://github.com/lichess-org/lila/raw/master/public/sound/standard/GenericNotify.mp3'),
}

function playSound(type: keyof typeof SOUNDS) {
  const { soundSettings } = useGameStore.getState()
  const settingKeyMap: Record<string, keyof typeof soundSettings> = {
    move: 'move',
    capture: 'capture',
    check: 'check',
    end: 'end',
    start: 'move'
  }
  const settingKey = settingKeyMap[type]
  if (settingKey && !soundSettings[settingKey]) return
  const audio = SOUNDS[type];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {}); 
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  token: null,
  gameId: null,
  game: null,
  selectedSquare: null,
  legalMoves: [],
  pendingPromotion: null,
  loading: false,
  error: null,
  authError: null,
  vsAI: true,
  socket: null,
  inviteRequest: null,
  language: 'uz',
  t: translations.uz,
  leaderboard: [],
  opponentResignedName: null,
  chatMessages: [],
  isSearching: false,
  matchedOpponent: null,
  matchOffer: null,
  isInviting: null,
  soundSettings: { move: true, capture: true, check: true, end: true },
  boardTheme: localStorage.getItem('shaxmat_theme') || 'default',
  pieceTheme: 'classic',
  uiTheme: (localStorage.getItem('shaxmat_ui_theme') as 'dark' | 'light') || 'dark',
  viewMode: (localStorage.getItem('shaxmat_view') as '2d' | '3d') || '2d',
  drawOffer: null,
  friendRequest: null,
  reviewMode: false,
  reviewIndex: 0,
  reviewBoardData: null,
  liveGames: [],
  isSpectator: false,
  matchHistory: [],
  friends: [],
  notification: null,
  pendingRequests: [],
  notifications: [],
  unreadCount: 0,

  clearAuthError: () => set({ authError: null }),

  signup: async (username, password, avatar) => {
    set({ loading: true, authError: null })
    try {
      const res = await fetch(`/game/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, avatar }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Signup failed'))
      }
      if (!data.user) throw new Error('Invalid response from server')
      set({ user: data.user, token: data.access_token, authError: null })
      localStorage.setItem('shaxmat_token', data.access_token)
      localStorage.setItem('shaxmat_user', JSON.stringify(data.user))
      get().initSocket(data.user.public_id)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error'
      set({ authError: msg })
    } finally {
      set({ loading: false })
    }
  },

  login: async (username, password) => {
    set({ loading: true, authError: null })
    try {
      const res = await fetch(`/game/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Incorrect username or password'))
      }
      if (!data.user) throw new Error('Invalid response from server')
      set({ user: data.user, token: data.access_token, authError: null })
      localStorage.setItem('shaxmat_token', data.access_token)
      localStorage.setItem('shaxmat_user', JSON.stringify(data.user))
      get().initSocket(data.user.public_id)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error. Check if backend is running.'
      set({ authError: msg })
    } finally {
      set({ loading: false })
    }
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/game/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      return data.url
    } catch (e) {
      console.error("Avatar upload failed", e)
      return null
    }
  },

  updateProfile: async (avatar: string) => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch('/game/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: user.public_id, avatar })
      })
      if (res.ok) {
        const updatedUser = await res.json()
        set({ user: updatedUser })
        localStorage.setItem('shaxmat_user', JSON.stringify(updatedUser))
      }
    } catch (e) {
      console.error("Profile update failed", e)
    }
  },

  logout: () => {
    localStorage.removeItem('shaxmat_token')
    localStorage.removeItem('shaxmat_user')
    localStorage.removeItem('shaxmat_game_id')
    get().socket?.close()
    set({ user: null, token: null, gameId: null, game: null, socket: null, inviteRequest: null, matchedOpponent: null, matchOffer: null, isSearching: false, authError: null })
  },

  setLanguage: (lang: Language) => {
    set({ language: lang, t: translations[lang] })
    localStorage.setItem('shaxmat_lang', lang)
  },

  setTheme: (theme: string) => {
    set({ boardTheme: theme })
    localStorage.setItem('shaxmat_theme', theme)
  },

  setPieceTheme: (_theme: 'classic' | 'modern') => {
    set({ pieceTheme: 'classic' })
    localStorage.setItem('shaxmat_piece_theme', 'classic')
  },

  setSoundSettings: (settings: any) => {
    set(state => ({ soundSettings: { ...state.soundSettings, ...settings } }))
  },

  setUiTheme: (theme: 'dark' | 'light') => {
    set({ uiTheme: theme })
    localStorage.setItem('shaxmat_ui_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  },

  setViewMode: (mode: '2d' | '3d') => {
    set({ viewMode: mode })
    localStorage.setItem('shaxmat_view', mode)
  },

  setNotification: (notif) => {
    set({ notification: notif })
    if (notif) {
      setTimeout(() => set({ notification: null }), 5000)
    }
  },

  initSocket: (publicId: string) => {
    const existing = get().socket;
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = import.meta.env.PROD ? window.location.host : `${window.location.hostname}:8000`
    const wsUrl = `${protocol}//${wsHost}/ws/${publicId}`
    const socket = new WebSocket(wsUrl)
    let pingInterval: any;
    
    socket.onopen = () => {
      const gid = get().gameId
      if (gid && get().isSpectator) {
        socket.send(JSON.stringify({ type: 'spectate', game_id: gid }))
      }
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'game_invite') {
        set({ inviteRequest: { 
          from_id: msg.from_id, 
          from_username: msg.from_username,
          time_limit: msg.time_limit,
          time_increment: msg.time_increment
        } });
      } else if (msg.type === 'game_start') {
        const gid = msg.game_id
        set({ gameId: gid, chatMessages: [], isInviting: null })
        localStorage.setItem('shaxmat_game_id', gid.toString())
        setTimeout(() => { get().fetchGame() }, 500)
        playSound('start')
      } else if (msg.type === 'move_made') {
        get().fetchGame()
      } else if (msg.type === 'opponent_resigned') {
        set({ opponentResignedName: msg.from_username || 'Opponent' });
        get().fetchGame()
        playSound('end')
      } else if (msg.type === 'chat') {
        set(state => ({ chatMessages: [...state.chatMessages, { from: msg.from_username, text: msg.text }] }))
      } else if (msg.type === 'draw_offer') {
        set({ drawOffer: { from_id: msg.from_id, from_username: msg.from_username } })
      } else if (msg.type === 'draw_respond') {
        if (msg.accepted) {
          get().fetchGame()
        } else {
          get().setNotification({ text: "Opponent declined the draw.", type: 'info' })
        }
      } else if (msg.type === 'friend_request') {
        setTimeout(() => { get().fetchFriendRequests() }, 1000)
        get().setNotification({ text: get().t.friendRequestReceived.replace('{name}', msg.from_username), type: 'info' })
      } else if (msg.type === 'friend_respond') {
        if (msg.accepted) {
          const text = get().t.friendAccepted.replace('{name}', msg.from_username)
          get().setNotification({ text, type: 'success' })
          get().fetchFriends()
        }
      } else if (msg.type === 'match_found') {
        set({ matchedOpponent: { public_id: msg.opponent_id, username: msg.opponent_username, avatar: msg.opponent_avatar } })
      } else if (msg.type === 'match_offer') {
        set({ matchOffer: { from_id: msg.from_id, from_username: msg.from_username, time_limit: msg.time_limit, time_increment: msg.time_increment } })
      } else if (msg.type === 'user_status') {
        set(state => ({
          leaderboard: state.leaderboard.map(u => u.public_id === msg.public_id ? { ...u, is_online: msg.online } : u),
          friends: state.friends.map(u => u.public_id === msg.public_id ? { ...u, is_online: msg.online } : u)
        }))
      } else if (msg.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
      }
    }

    socket.onclose = () => {
      clearInterval(pingInterval);
      setTimeout(() => {
        const currentUser = get().user;
        if (currentUser) get().initSocket(currentUser.public_id);
      }, 3000);
    };

    set({ socket })
  },

  respondToInvite: (accept: boolean) => {
    const { inviteRequest, socket } = get();
    if (!inviteRequest || !socket) return;
    if (accept) {
      socket.send(JSON.stringify({ type: 'accept_invite', target_id: inviteRequest.from_id }));
      get().createGame('Person', inviteRequest.from_id, undefined, inviteRequest.time_limit, inviteRequest.time_increment);
    }
    set({ inviteRequest: null });
  },
  goBackToMenu: () => {
    const { socket, gameId, isSpectator, user, searchUser } = get()
    if (socket && gameId && isSpectator) {
      socket.send(JSON.stringify({ type: 'leave_spectate', game_id: gameId }))
    }
    if (user) {
      searchUser(user.public_id).then(updatedUser => {
        if (updatedUser) {
          set({ user: updatedUser })
          localStorage.setItem('shaxmat_user', JSON.stringify(updatedUser))
        }
      })
    }
    localStorage.removeItem('shaxmat_game_id')
    localStorage.removeItem('shaxmat_spectator')
    set({
      gameId: null,
      game: null,
      selectedSquare: null,
      legalMoves: [],
      pendingPromotion: null,
      opponentResignedName: null,
      reviewMode: false,
      reviewBoardData: null,
      isSpectator: false
    })
  },
  searchUser: async (publicId: string) => {
    try {
      const res = await fetch(`/game/users/search/${publicId}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await fetch(`/game/leaderboard`)
      if (res.ok) {
        const data = await res.json()
        set({ leaderboard: data })
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e)
    }
  },

  fetchFriends: async () => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/users/friends/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        set({ friends: data })
      }
    } catch (e) {
      console.error("Failed to fetch friends", e)
    }
  },

  fetchFriendRequests: async () => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/users/friend-requests/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        set({ pendingRequests: data })
      }
    } catch (e) {
      console.error("Failed to fetch friend requests", e)
    }
  },

  fetchNotifications: async () => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/notifications/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        const unread = data.filter((n: any) => !n.is_read).length
        set({ notifications: data, unreadCount: unread })
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e)
    }
  },

  markNotificationRead: async (id: number) => {
    try {
      const res = await fetch(`/game/notifications/mark-read/${id}`, { method: 'POST' })
      if (res.ok) {
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      }
    } catch (e) {
      console.error("Failed to mark notification as read", e)
    }
  },

  sendFriendRequest: async (targetId: string) => {
    const { user, socket } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/users/friend-request/${targetId}?current_user_id=${user.id}`, { method: 'POST' })
      if (res.ok && socket) {
        socket.send(JSON.stringify({ type: 'friend_request', target_id: targetId }))
      }
    } catch (e) {
      console.error("Failed to send friend request", e)
    }
  },

  respondToFriendRequest: async (requestId: number, accept: boolean) => {
    const { socket, pendingRequests } = get()
    const request = pendingRequests.find(r => r.id === requestId)
    if (!request) return
    try {
      const res = await fetch(`/game/users/friend-respond/${requestId}?accept=${accept}`, { method: 'POST' })
      if (res.ok) {
        if (socket) {
          socket.send(JSON.stringify({ type: 'friend_respond', target_id: request.from_user.public_id, accepted: accept }))
        }
        await get().fetchFriends()
        await get().fetchFriendRequests()
      }
    } catch (e) {
      console.error("Failed to respond to friend request", e)
    }
  },

  followUser: async (pid: string) => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/users/follow/${pid}?current_user_id=${user.id}`, { method: 'POST' })
      if (res.ok) { await get().fetchFriends() }
    } catch (e) { console.error("Follow failed", e) }
  },

  unfollowUser: async (pid: string) => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/users/unfollow/${pid}?current_user_id=${user.id}`, { method: 'POST' })
      if (res.ok) { await get().fetchFriends() }
    } catch (e) { console.error("Unfollow failed", e) }
  },

  sendInvite: (targetPublicId: string, timeLimit?: number, timeIncrement?: number) => {
    const { socket } = get()
    if (socket) {
      socket.send(JSON.stringify({ 
        type: 'invite', 
        target_id: targetPublicId,
        time_limit: timeLimit || 600,
        time_increment: timeIncrement || 0
      }))
      set({ isInviting: targetPublicId })
    }
  },

  createGame: async (mode: string, opponentId?: string, aiDifficulty?: string, timeLimit?: number, timeIncrement?: number) => {
    set({ loading: true, error: null, vsAI: mode === 'AI' })
    try {
      const { user } = get()
      const res = await fetch(`/game/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_mode: mode,
          opponent_public_id: opponentId,
          creator_public_id: user?.public_id,
          time_limit: timeLimit || 600,
          time_increment: timeIncrement || 0,
          ai_difficulty: aiDifficulty || 'normal'
        })
      })
      if (!res.ok) throw new Error('Failed to create game')
      const data = await res.json().catch(() => ({}))
      set({ gameId: data.id })
      localStorage.setItem('shaxmat_game_id', data.id.toString())
      if (mode === 'Person' && opponentId) {
        const { socket } = get()
        if (socket) { socket.send(JSON.stringify({ type: 'game_start', target_id: opponentId, game_id: data.id })) }
      }
      await get().fetchGame()
    } catch (e: any) { set({ error: e.message }) } finally { set({ loading: false }) }
  },

  fetchGame: async () => {
    const { gameId } = get()
    if (!gameId) return
    try {
      const res = await fetch(`/game/game/${gameId}`)
      if (!res.ok) {
        set({ error: `Game not found (${res.status})` });
        return;
      }
      const data = await res.json().catch(() => null);
      if (!data || !data.board) {
        set({ error: "Received invalid board data from server" });
        return;
      }
      const oldGame = get().game
      const oldHistoryLen = oldGame?.move_history?.length || 0
      const newHistoryLen = data.move_history?.length || 0
      if (data.status !== 'active' && oldGame?.status === 'active') {
        const { user, searchUser } = get()
        if (user) { searchUser(user.public_id).then(u => { if (u) { set({ user: u }); localStorage.setItem('shaxmat_user', JSON.stringify(u)) } }) }
      }
      if (newHistoryLen > oldHistoryLen) {
        if (data.status !== 'active') playSound('end')
        else if (data.in_check) playSound('check')
        else {
          const lastMove = data.move_history[data.move_history.length - 1]
          if (lastMove.includes('x')) playSound('capture')
          else playSound('move')
        }
      }
      set({ game: data, selectedSquare: null, legalMoves: [], vsAI: data.game_mode === 'AI', error: null })
      if (data.game_mode === 'AI' && data.turn === 'black' && data.status === 'active') {
        const { aiMove, loading } = get()
        if (!loading) { setTimeout(() => aiMove(), 600) }
      }
    } catch (e: any) { set({ error: e.message }) }
  },

  fetchLiveGames: async () => {
    try {
      const res = await fetch(`/game/game/live`)
      if (res.ok) { const data = await res.json(); set({ liveGames: data }) }
    } catch (e) { console.error("Failed to fetch live games", e) }
  },

  fetchMatchHistory: async () => {
    const { user } = get()
    if (!user) return
    try {
      const res = await fetch(`/game/game/user/${user.id}/history`)
      if (res.ok) { const data = await res.json(); set({ matchHistory: data }) }
    } catch (e) { console.error("Failed to fetch match history", e) }
  },

  spectateGame: async (gid: number) => {
    set({ loading: true, isSpectator: true, gameId: gid })
    localStorage.setItem('shaxmat_game_id', gid.toString())
    localStorage.setItem('shaxmat_spectator', 'true')
    const { socket } = get()
    if (socket) { socket.send(JSON.stringify({ type: 'spectate', game_id: gid })) }
    await get().fetchGame()
    set({ loading: false })
  },

  selectSquare: (square: string) => {
    const { game, selectedSquare, legalMoves, vsAI, user, isSpectator } = get()
    if (!game || game.status !== 'active' || isSpectator) return
    let userColor: string | null = null
    if (game.game_mode === 'AI') userColor = 'white'
    else {
      if (user?.id === game.white_player_id) userColor = 'white'
      else if (user?.id === game.black_player_id) userColor = 'black'
    }
    if (vsAI && game.turn === 'black') return
    if (game.game_mode === 'Person' && game.turn !== userColor) return
    if (selectedSquare && legalMoves.includes(square)) {
      const piece = getPieceAt(game.board, selectedSquare)
      if (piece && isPromotionMove(piece, square)) { set({ pendingPromotion: { from: selectedSquare, to: square, color: piece.color } }) }
      else { get().makeMove(selectedSquare, square) }
      return
    }
    const piece = getPieceAt(game.board, square)
    if (piece && piece.color === game.turn && piece.color === userColor) {
      const moves = game.legal_moves?.[square] ?? []
      set({ selectedSquare: square, legalMoves: moves })
    } else { set({ selectedSquare: null, legalMoves: [] }) }
  },

  makeMove: async (from: string, to: string, promotion?: string) => {
    const { gameId } = get()
    if (!gameId) return
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/${gameId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_square: from, to_square: to, promotion }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Illegal move' }))
        set({ error: err.detail || 'Illegal move', selectedSquare: null, legalMoves: [] })
        return
      }
      set({ selectedSquare: null, legalMoves: [], pendingPromotion: null })
      await get().fetchGame()
    } catch (e: any) { set({ error: e.message }) } finally { set({ loading: false }) }
  },

  aiMove: async () => {
    const { gameId } = get()
    if (!gameId) return
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/${gameId}/ai-move`, { method: 'POST' })
      if (!res.ok) throw new Error('AI failed to generate move')
      await get().fetchGame()
    } catch (e: any) { set({ error: e.message }) } finally { set({ loading: false }) }
  },

  resign: async () => {
    const { gameId, user, goBackToMenu } = get()
    if (!gameId || !user) return
    try {
      await fetch(`/game/game/${gameId}/resign?user_id=${user.id}`, { method: 'POST' })
      goBackToMenu()
    } catch (e) { console.error("Resign failed", e); goBackToMenu() }
  },

  offerDraw: () => {
    const { socket, game, user } = get()
    if (!socket || !game || !user) return
    const target_id = user.id === game.white_player_id ? game.black_player_public_id : game.white_player_public_id
    if (target_id) {
      socket.send(JSON.stringify({ type: 'draw_offer', target_id }))
      get().setNotification({ text: "Draw offer sent!", type: 'info' })
    }
  },

  respondToDraw: async (accept: boolean) => {
    const { socket, game, user, drawOffer } = get()
    if (!socket || !game || !user || !drawOffer) return
    socket.send(JSON.stringify({ type: 'draw_respond', target_id: drawOffer.from_id, accepted: accept }))
    if (accept) { await fetch(`/game/game/${game.id}/draw`, { method: 'POST' }); get().fetchGame() }
    set({ drawOffer: null })
  },

  toggleAI: () => { set({ vsAI: !get().vsAI }) },
  sendChatMessage: (text: string) => {
    const { socket, game, user } = get()
    if (!socket || !game || !user || !text.trim()) return
    const target_id = user.id === game.white_player_id ? game.black_player_public_id : game.white_player_public_id
    if (target_id) {
      socket.send(JSON.stringify({ type: 'chat', target_id, text }))
      set(state => ({ chatMessages: [...state.chatMessages, { from: user.username, text }] }))
    }
  },

  startMatchmaking: () => {
    const { socket } = get()
    if (socket) { socket.send(JSON.stringify({ type: 'find_match' })); set({ isSearching: true }) }
  },

  cancelMatchmaking: () => {
    const { socket } = get()
    if (socket) { socket.send(JSON.stringify({ type: 'leave_queue' })) }
    set({ isSearching: false, matchedOpponent: null, matchOffer: null })
  },

  sendMatchStart: (targetId: string, timeLimit: number, timeIncrement: number) => {
    const { socket } = get()
    if (socket) {
      socket.send(JSON.stringify({ type: 'match_start', target_id: targetId, time_limit: timeLimit, time_increment: timeIncrement }))
    }
  },

  acceptMatchOffer: () => {
    const { matchOffer, socket } = get()
    if (!matchOffer || !socket) return
    socket.send(JSON.stringify({ type: 'accept_invite', target_id: matchOffer.from_id }))
    get().createGame('Person', matchOffer.from_id, undefined, matchOffer.time_limit, matchOffer.time_increment)
    set({ matchedOpponent: null, matchOffer: null, isSearching: false })
  },

  startReview: () => {
    const { game } = get()
    if (!game) return
    set({ reviewMode: true, reviewIndex: game.move_history.length, reviewBoardData: null })
  },

  setReviewIndex: async (index: number) => {
    const { gameId, game } = get()
    if (!gameId || !game) return
    const targetIndex = Math.max(0, Math.min(index, game.move_history.length))
    if (targetIndex === game.move_history.length) { set({ reviewIndex: targetIndex, reviewBoardData: null }); return }
    try {
      const res = await fetch(`/game/game/${gameId}/review/${targetIndex}`)
      if (res.ok) { const data = await res.json(); set({ reviewIndex: targetIndex, reviewBoardData: data }) }
    } catch (e) { console.error("Failed to fetch review state", e) }
  },

  resolvePromotion: async (piece: string) => {
    const { pendingPromotion } = get()
    if (!pendingPromotion) return
    await get().makeMove(pendingPromotion.from, pendingPromotion.to, piece)
  },
  cancelPromotion: () => { set({ pendingPromotion: null, selectedSquare: null, legalMoves: [] }) },
  newGame: async () => {
    localStorage.removeItem('shaxmat_game_id')
    set({ gameId: null, game: null, selectedSquare: null, legalMoves: [], pendingPromotion: null })
    await get().createGame('AI', undefined, 'normal', 600, 0)
  },
}))
