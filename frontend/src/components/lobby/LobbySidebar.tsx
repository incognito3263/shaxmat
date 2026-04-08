import type { ReactNode } from 'react'
import { Avatar } from '../Avatar'
import { CountryFlag } from '../game/CountryFlag'
import type { User } from '../../store'
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
           <span className="font-black tracking-tighter text-[#81b64c]">SHAXMAT+</span>
           <button onClick={onClose} className="p-2 text-[var(--text-muted)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <path d="M18 6L6 18M6 6l12 12" />
              </svg>
           </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
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

      <div className="shrink-0 border-t border-[var(--border)] px-2 py-2">
        <div className="mb-2 flex gap-0.5 rounded-lg bg-[var(--surface-3)] p-0.5">
          {langs.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onSetLanguage(l.id)}
              className={`flex-1 rounded px-1.5 py-1 text-[10px] font-bold ${
                language === l.id ? 'bg-[var(--surface-2)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="mb-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface-3)] px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        >
          {isDark ? t.darkMode : t.lightMode}
        </button>

        <button
          type="button"
          onClick={onEditProfile}
          className="flex w-full items-center gap-2 rounded-lg bg-[var(--surface-3)] p-2 text-left transition-colors hover:bg-[var(--surface-2)]"
        >
          <Avatar src={user.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-bold">{user.username}</span>
              <CountryFlag code={user.country_code} />
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">{t.lobbyEditProfileHint}</span>
          </div>
        </button>
        <button
          type="button"
          onClick={onCopyPublicId}
          className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--surface-3)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-2)]"
        >
          <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.copyID}</span>
          <span className="mt-0.5 block truncate font-mono text-[11px] font-bold tracking-widest text-[#81b64c]">{user.public_id}</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1.5 w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--check-red)]"
        >
          {t.logout}
        </button>
      </div>
    </aside>
    </>
  )
}

export type { LobbyPage }
