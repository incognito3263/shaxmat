import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Avatar } from '../Avatar'
import { CountryFlag } from '../game/CountryFlag'
import type { User } from '../../store'
import { useGameStore } from '../../store'
import type { Language } from '../../translations'
import type { LobbyPage } from './LobbyPage'

type LobbySidebarProps = {
  user: User
  activePage: LobbyPage
  t: Record<string, string>
  language: Language
  uiTheme: 'dark' | 'light'
  onNavigate: (page: LobbyPage) => void
  onEditProfile: () => void
  onLogout: () => void
  onSetLanguage: (lang: Language) => void
  onToggleTheme: () => void
  onCopyPublicId: () => void
  isOpen?: boolean
  onClose?: () => void
}

const langs: { id: Language; label: string }[] = [
  { id: 'uz', label: 'UZ' },
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
]

function NavItem({
  icon,
  label,
  onClick,
  active,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
        active
          ? 'bg-[var(--surface-2)] text-[var(--text-main)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]/80 hover:text-[var(--text-main)]'
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center opacity-90">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function BottomIcon({
  children,
  onClick,
  badge,
  label,
}: {
  children: ReactNode
  onClick: () => void
  badge?: number
  label: string
}) {
  const show = badge != null && badge > 0
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-main)]"
    >
      {children}
      {show && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e53935] px-1 text-[10px] font-bold leading-none text-white">
          {badge! > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

export function LobbySidebar({
  user,
  activePage,
  t,
  language,
  uiTheme,
  onNavigate,
  onEditProfile,
  onLogout,
  onSetLanguage,
  onToggleTheme,
  onCopyPublicId,
  isOpen,
  onClose,
}: LobbySidebarProps) {
  const isDark = uiTheme === 'dark'
  const pendingRequests = useGameStore((s) => s.pendingRequests)
  const notifications = useGameStore((s) => s.notifications)
  const fetchFriendRequests = useGameStore((s) => s.fetchFriendRequests)
  const fetchNotifications = useGameStore((s) => s.fetchNotifications)
  const respondToFriendRequest = useGameStore((s) => s.respondToFriendRequest)
  const markNotificationRead = useGameStore((s) => s.markNotificationRead)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const dockRef = useRef<HTMLDivElement>(null)

  const requestCount = pendingRequests?.length ?? 0
  const unreadNotifCount = (notifications ?? []).filter((n: { is_read?: boolean }) => !n.is_read).length

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!settingsOpen && !notifOpen && !messagesOpen) return
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
        setNotifOpen(false)
        setMessagesOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [settingsOpen, notifOpen, messagesOpen])

  useEffect(() => {
    if (messagesOpen) void fetchFriendRequests()
  }, [messagesOpen, fetchFriendRequests])

  useEffect(() => {
    if (notifOpen) void fetchNotifications()
  }, [notifOpen, fetchNotifications])

  const openSettings = () => {
    setNotifOpen(false)
    setMessagesOpen(false)
    setSettingsOpen((v) => !v)
  }

  const openNotifs = () => {
    setSettingsOpen(false)
    setMessagesOpen(false)
    setNotifOpen((v) => !v)
  }

  const openMessages = () => {
    setSettingsOpen(false)
    setNotifOpen(false)
    setMessagesOpen((v) => !v)
  }

  const goPlaySearch = () => {
    onNavigate('play')
    onClose?.()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="font-black tracking-tighter text-[#81b64c]">SHAXMAT+</span>
          <button type="button" onClick={onClose} className="p-2 text-[var(--text-muted)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search — chess.com uslubida, raqib ID qidirish uchun O'ynash sahifasiga yo'naltiradi */}
        <div className="shrink-0 px-3 pb-2 pt-1">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2">
            <button type="button" onClick={goPlaySearch} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-main)]" aria-label={t.lobbyNavPlay}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') goPlaySearch()
              }}
              placeholder={t.sidebarSearchPlaceholder || 'Search'}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none"
            />
          </div>
        </div>

        {/* Profil — rasm: avatar + ism */}
        <button
          type="button"
          onClick={() => {
            onEditProfile()
            onClose?.()
          }}
          className="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-2)]/60"
        >
          <Avatar src={user.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-[var(--text-main)]">{user.username}</span>
              <CountryFlag code={user.country_code} />
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">{t.lobbyEditProfileHint}</span>
          </div>
        </button>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
            label={t.lobbyNavHome}
            active={activePage === 'home'}
            onClick={() => onNavigate('home')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            }
            label={t.lobbyNavPlay}
            active={activePage === 'play'}
            onClick={() => onNavigate('play')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            label={t.leaderboard}
            active={activePage === 'leaderboard'}
            onClick={() => onNavigate('leaderboard')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            }
            label={t.lobbyNavHistory}
            active={activePage === 'history'}
            onClick={() => onNavigate('history')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            label={t.friends}
            active={activePage === 'friends'}
            onClick={() => onNavigate('friends')}
          />
          <NavItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
            label={t.lobbyNavLearn}
            active={activePage === 'guide'}
            onClick={() => onNavigate('guide')}
          />
        </nav>

        {/* Pastki ikonlar + sozlamalar / bildirishnomalar paneli */}
        <div ref={dockRef} className="relative shrink-0 border-t border-[var(--border)]">
          {settingsOpen && (
            <div className="absolute bottom-full left-2 right-2 z-20 mb-2 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl">
              <div className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">{t.settings}</div>

              <div className="mb-3">
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.sidebarLanguage}</div>
                <div className="flex gap-0.5 rounded-lg bg-[var(--surface-3)] p-0.5">
                  {langs.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onSetLanguage(l.id)}
                      className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold ${
                        language === l.id ? 'bg-[var(--surface-2)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleTheme}
                className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 text-left text-xs font-bold text-[var(--text-main)] hover:bg-[var(--surface-2)]"
              >
                {isDark ? t.darkMode : t.lightMode}
              </button>

              <button
                type="button"
                onClick={() => {
                  onCopyPublicId()
                }}
                className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 text-left transition-colors hover:bg-[var(--surface-2)]"
              >
                <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.copyID}</span>
                <span className="mt-0.5 block truncate font-mono text-[11px] font-bold tracking-widest text-[#81b64c]">{user.public_id}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogout()
                  setSettingsOpen(false)
                }}
                className="w-full rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider text-[var(--check-red)] hover:bg-[var(--surface-2)]"
              >
                {t.logout}
              </button>
            </div>
          )}

          {messagesOpen && (
            <div className="absolute bottom-full left-2 right-2 z-20 mb-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
              <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                {t.sidebarMessagesTitle}
              </div>
              {!pendingRequests || pendingRequests.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-[var(--text-muted)]">{t.sidebarNoMessages}</p>
              ) : (
                <ul className="space-y-1.5">
                  {pendingRequests.slice(0, 12).map(
                    (req: { id: number; from_user: { username: string; avatar: string } }) => (
                      <li
                        key={req.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-2)] px-2 py-2"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Avatar src={req.from_user.avatar} size="sm" />
                          <span className="truncate text-xs font-semibold text-[var(--text-main)]">
                            {req.from_user.username}
                          </span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => void respondToFriendRequest(req.id, false)}
                            className="rounded-md border border-[var(--border)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                          >
                            {t.decline}
                          </button>
                          <button
                            type="button"
                            onClick={() => void respondToFriendRequest(req.id, true)}
                            className="rounded-md bg-[#81b64c] px-2 py-1 text-[10px] font-bold uppercase text-white hover:brightness-110"
                          >
                            {t.accept}
                          </button>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          )}

          {notifOpen && (
            <div className="absolute bottom-full left-2 right-2 z-20 mb-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
              <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{t.sidebarNotificationsTitle}</div>
              {!notifications || notifications.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-[var(--text-muted)]">{t.sidebarNoNotifications}</p>
              ) : (
                <ul className="space-y-1">
                  {notifications.slice(0, 12).map((n: { id: number; text: string; is_read: boolean }) => (
                    <li
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!n.is_read) void markNotificationRead(n.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (!n.is_read) void markNotificationRead(n.id)
                        }
                      }}
                      className={`rounded-lg px-2 py-2 text-left text-xs leading-snug transition-colors ${n.is_read ? 'text-[var(--text-muted)]' : 'cursor-pointer bg-[var(--surface-2)] text-[var(--text-main)] font-medium hover:bg-[var(--surface-3)]'}`}
                    >
                      {n.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-1 px-2 py-2">
            <BottomIcon
              label={t.friends}
              onClick={() => {
                onNavigate('friends')
                onClose?.()
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </BottomIcon>

            <BottomIcon
              label={t.sidebarMessagesTitle}
              badge={requestCount}
              onClick={openMessages}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </BottomIcon>

            <BottomIcon label="Notifications" badge={unreadNotifCount} onClick={openNotifs}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </BottomIcon>

            <BottomIcon label={t.settings} onClick={openSettings}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </BottomIcon>
          </div>
        </div>
      </aside>
    </>
  )
}

export type { LobbyPage }
