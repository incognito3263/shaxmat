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
  white_username?: string | null
  black_username?: string | null
  white_country_code?: string | null
  black_country_code?: string | null
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
  country_code?: string | null
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
  isAiMoving: boolean
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
  matchedOpponent: { public_id: string; username: string; avatar: string; country_code?: string | null } | null
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
  aiTimeout: any

  signup: (username: string, password: string, avatar: string) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  clearAuthError: () => void
  uploadAvatar: (file: File) => Promise<string | null>
  updateProfile: (avatar?: string, countryCode?: string) => Promise<void>
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
  tickClock: () => void
}

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
  const audio = SOUNDS[type];
  if (audio && (soundSettings as any)[type] !== false) {
    audio.currentTime = 0; audio.play().catch(() => {});
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null, token: null, gameId: null, game: null, selectedSquare: null, legalMoves: [],
  pendingPromotion: null, loading: false, isAiMoving: false, error: null, authError: null, vsAI: true,
  socket: null, inviteRequest: null, language: 'uz', t: translations.uz,
  leaderboard: [], opponentResignedName: null, chatMessages: [],
  isSearching: false, matchedOpponent: null, matchOffer: null, isInviting: null,
  soundSettings: { move: true, capture: true, check: true, end: true },
  boardTheme: localStorage.getItem('shaxmat_theme') || 'wood',
  pieceTheme: 'classic', uiTheme: (localStorage.getItem('shaxmat_ui_theme') as 'dark' | 'light') || 'dark',
  viewMode: (localStorage.getItem('shaxmat_view') as '2d' | '3d') || '2d',
  drawOffer: null, friendRequest: null, reviewMode: false, reviewIndex: 0,
  reviewBoardData: null, liveGames: [], isSpectator: false, matchHistory: [],
  friends: [], notification: null, pendingRequests: [], notifications: [], aiTimeout: null,

  tickClock: () => {
    const { game } = get(); if (!game || game.status !== 'active') return;
    if (game.turn === 'white') set({ game: { ...game, white_time_left: Math.max(0, game.white_time_left - 1) } })
    else set({ game: { ...game, black_time_left: Math.max(0, game.black_time_left - 1) } })
  },

  clearAuthError: () => set({ authError: null }),

  signup: async (username, password, avatar) => {
    set({ loading: true, authError: null })
    try {
      const res = await fetch(`/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, avatar }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Signup failed'))
      set({ user: data.user, token: data.access_token }); localStorage.setItem('shaxmat_token', data.access_token); localStorage.setItem('shaxmat_user', JSON.stringify(data.user)); get().initSocket(data.user.public_id)
    } catch (e: any) { set({ authError: e.message }) } finally { set({ loading: false }) }
  },

  login: async (username, password) => {
    set({ loading: true, authError: null })
    try {
      const res = await fetch(`/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Login failed'))
      set({ user: data.user, token: data.access_token }); localStorage.setItem('shaxmat_token', data.access_token); localStorage.setItem('shaxmat_user', JSON.stringify(data.user)); get().initSocket(data.user.public_id)
    } catch (e: any) { set({ authError: e.message }) } finally { set({ loading: false }) }
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData(); formData.append('file', file)
    try {
      const res = await fetch('/upload-avatar', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json(); return data.url
    } catch (e) { console.error(e); return null }
  },

  updateProfile: async (avatar, countryCode) => {
    const { user } = get(); if (!user) return
    try {
      const res = await fetch('/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: user.public_id, avatar: avatar || user.avatar, country_code: countryCode ?? user.country_code }) })
      if (res.ok) { const updated = await res.json(); set({ user: updated }); localStorage.setItem('shaxmat_user', JSON.stringify(updated)) }
    } catch (e) { console.error(e) }
  },

  logout: () => {
    localStorage.removeItem('shaxmat_token'); localStorage.removeItem('shaxmat_user'); localStorage.removeItem('shaxmat_game_id')
    get().socket?.close(); set({ user: null, token: null, gameId: null, game: null, socket: null })
  },

  setLanguage: (lang: Language) => { set({ language: lang, t: translations[lang] }); localStorage.setItem('shaxmat_lang', lang) },
  setTheme: (theme: string) => { set({ boardTheme: theme }); localStorage.setItem('shaxmat_theme', theme) },
  setUiTheme: (theme: 'dark' | 'light') => { set({ uiTheme: theme }); localStorage.setItem('shaxmat_ui_theme', theme); document.documentElement.setAttribute('data-theme', theme) },
  setViewMode: (mode: '2d' | '3d') => { set({ viewMode: mode }); localStorage.setItem('shaxmat_view', mode) },
  setNotification: (notif) => { set({ notification: notif }); if (notif) setTimeout(() => set({ notification: null }), 5000) },

  initSocket: (publicId: string) => {
    const existing = get().socket; if (existing?.readyState === WebSocket.OPEN) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/${publicId}`)
    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'game_invite') set({ inviteRequest: msg })
      else if (msg.type === 'game_start') { set({ gameId: msg.game_id }); localStorage.setItem('shaxmat_game_id', msg.game_id.toString()); get().fetchGame(); playSound('start') }
      else if (msg.type === 'move_made') get().fetchGame()
      else if (msg.type === 'chat') set(state => ({ chatMessages: [...state.chatMessages, { from: msg.from_username, text: msg.text }] }))
      else if (msg.type === 'match_found') set({ matchedOpponent: { public_id: msg.opponent_id, username: msg.opponent_username, avatar: msg.opponent_avatar } })
      else if (msg.type === 'match_offer') set({ matchOffer: msg })
    }
    set({ socket })
  },

  fetchLeaderboard: async () => {
    try {
      const res = await fetch(`/leaderboard`)
      if (res.ok) { const data = await res.json(); set({ leaderboard: data }) }
    } catch (e) { console.error(e) }
  },

  fetchFriends: async () => {
    const { user } = get(); if (!user) return
    try {
      const res = await fetch(`/users/friends/${user.id}`)
      if (res.ok) { const data = await res.json(); set({ friends: data }) }
    } catch (e) { console.error(e) }
  },

  fetchFriendRequests: async () => {
    const { user } = get(); if (!user) return
    try {
      const res = await fetch(`/users/friend-requests/${user.id}`)
      if (res.ok) { const data = await res.json(); set({ pendingRequests: data }) }
    } catch (e) { console.error(e) }
  },

  fetchNotifications: async () => {
    const { user } = get(); if (!user) return
    try {
      const res = await fetch(`/notifications/${user.id}`)
      if (res.ok) { const data = await res.json(); set({ notifications: data }) }
    } catch (e) { console.error(e) }
  },

  fetchLiveGames: async () => {
    try {
      const res = await fetch(`/game/live`)
      if (res.ok) { const data = await res.json(); set({ liveGames: data }) }
    } catch (e) { console.error(e) }
  },

  createGame: async (mode, opponentId, aiDifficulty, timeLimit, timeIncrement) => {
    set({ loading: true, error: null, isAiMoving: false })
    try {
      const res = await fetch(`/game/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game_mode: mode, opponent_public_id: opponentId, creator_public_id: get().user?.public_id, time_limit: timeLimit, time_increment: timeIncrement, ai_difficulty: aiDifficulty }) })
      if (res.ok) { const data = await res.json(); set({ gameId: data.id }); localStorage.setItem('shaxmat_game_id', data.id.toString()); get().fetchGame() }
    } catch (e: any) { set({ error: e.message }) } finally { set({ loading: false }) }
  },

  fetchGame: async () => {
    const { gameId, isAiMoving } = get(); if (!gameId) return
    try {
      const res = await fetch(`/game/${gameId}`)
      if (res.ok) {
        const data = await res.json()
        const oldHistoryLen = get().game?.move_history?.length || 0
        if (data.move_history?.length > oldHistoryLen) {
          if (data.status !== 'active') playSound('end')
          else if (data.in_check) playSound('check')
          else playSound('move')
        }
        set({ game: data, error: null })
        if (data.game_mode === 'AI' && data.turn === 'black' && data.status === 'active' && !isAiMoving) {
          if (get().aiTimeout) clearTimeout(get().aiTimeout)
          const timeout = setTimeout(() => get().aiMove(), 3000)
          set({ aiTimeout: timeout })
        }
      }
    } catch (e: any) { set({ error: e.message }) }
  },

  fetchMatchHistory: async () => {
    const { user } = get(); if (!user) return
    try {
      const res = await fetch(`/game/user/${user.id}/history`)
      if (res.ok) { const data = await res.json(); set({ matchHistory: data }) }
    } catch (e) { console.error(e) }
  },

  selectSquare: (square) => {
    const { game, user, isSpectator, selectedSquare, legalMoves, isAiMoving } = get()
    if (!game || game.status !== 'active' || isSpectator || isAiMoving) return
    const userColor = game.game_mode === 'AI' ? 'white' : (user?.id === game.white_player_id ? 'white' : 'black')
    if (game.turn !== userColor) return
    if (selectedSquare && legalMoves.includes(square)) {
      const piece = getPieceAt(game.board, selectedSquare)
      if (piece && isPromotionMove(piece, square)) set({ pendingPromotion: { from: selectedSquare, to: square, color: piece.color } })
      else get().makeMove(selectedSquare, square)
      return
    }
    const piece = getPieceAt(game.board, square)
    if (piece?.color === game.turn && piece?.color === userColor) {
      set({ selectedSquare: square, legalMoves: game.legal_moves?.[square] || [] })
    } else set({ selectedSquare: null, legalMoves: [] })
  },

  makeMove: async (from, to, promotion) => {
    try {
      const res = await fetch(`/game/${get().gameId}/move`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from_square: from, to_square: to, promotion }) })
      if (res.ok) { set({ selectedSquare: null, legalMoves: [], pendingPromotion: null }); get().fetchGame() }
    } catch (e) { console.error(e) }
  },

  aiMove: async () => {
    const { gameId, isAiMoving, aiTimeout } = get();
    if (!gameId || isAiMoving) return;
    if (aiTimeout) { clearTimeout(aiTimeout); set({ aiTimeout: null }) }
    set({ isAiMoving: true });
    try { 
      const res = await fetch(`/game/${gameId}/ai-move`, { method: 'POST' }); 
      if (res.ok) get().fetchGame();
    }
    catch (e) { console.error(e) }
    finally { set({ isAiMoving: false }) }
  },

  toggleAI: () => set(s => ({ vsAI: !s.vsAI })),
  goBackToMenu: () => { localStorage.removeItem('shaxmat_game_id'); set({ gameId: null, game: null, isSpectator: false, isAiMoving: false }) },
  searchUser: async (pid) => { try { const res = await fetch(`/users/search/${pid}`); return res.ok ? await res.json() : null } catch { return null } },
  sendInvite: (pid, limit, inc) => get().socket?.send(JSON.stringify({ type: 'invite', target_id: pid, time_limit: limit, time_increment: inc })),
  respondToInvite: (accept) => { if (accept && get().inviteRequest) { get().socket?.send(JSON.stringify({ type: 'accept_invite', target_id: get().inviteRequest!.from_id })); get().createGame('Person', get().inviteRequest!.from_id) }; set({ inviteRequest: null }) },
  startMatchmaking: () => get().socket?.send(JSON.stringify({ type: 'find_match' })),
  cancelMatchmaking: () => { get().socket?.send(JSON.stringify({ type: 'leave_queue' })); set({ isSearching: false }) },
  acceptMatchOffer: () => { if (get().matchOffer) { get().socket?.send(JSON.stringify({ type: 'accept_invite', target_id: get().matchOffer!.from_id })); get().createGame('Person', get().matchOffer!.from_id) }; set({ matchOffer: null, isSearching: false }) },
  spectateGame: async (gid) => { set({ isSpectator: true, gameId: gid }); get().fetchGame() },
  resign: async () => { await fetch(`/game/${get().gameId}/resign?user_id=${get().user?.id}`, { method: 'POST' }); get().goBackToMenu() },
  startReview: () => set({ reviewMode: true }),
  setReviewIndex: async (idx) => { const res = await fetch(`/game/${get().gameId}/review/${idx}`); if (res.ok) set({ reviewIndex: idx, reviewBoardData: await res.json() }) },
  resolvePromotion: async (p) => { if (get().pendingPromotion) get().makeMove(get().pendingPromotion!.from, get().pendingPromotion!.to, p) },
  cancelPromotion: () => set({ pendingPromotion: null }),
  setPieceTheme: () => {}, setSoundSettings: () => {}, markNotificationRead: async () => {}, sendFriendRequest: async () => {}, respondToFriendRequest: async () => {}, followUser: async () => {}, unfollowUser: async () => {}, offerDraw: () => {}, respondToDraw: () => {}, sendChatMessage: () => {}, sendMatchStart: () => {}, newGame: async () => {}
}))
