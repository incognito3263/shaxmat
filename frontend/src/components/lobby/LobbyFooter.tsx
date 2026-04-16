import { useGameStore } from '../../store'

export function LobbyFooter() {
  const { t, setNotification } = useGameStore()
  const dot = <span className="mx-1.5 text-[var(--border)]">·</span>
  const link = (label: string, onClick?: () => void) => (
    <button
      type="button"
      onClick={() => {
        if (onClick) onClick()
        else setNotification({ text: label, type: 'info' })
      }}
      className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
    >
      {label}
    </button>
  )

  return (
    <footer className="mt-auto w-full border-t border-[var(--border)] bg-[var(--bg)] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <nav className="flex flex-wrap items-center justify-center gap-y-2 text-center">
          {link(t.footerSupport)}
          {dot}
          {link(t.footerLanguage)}
          {dot}
          {link(t.footerAbout)}
          {dot}
          {link(t.footerJobs)}
          {dot}
          {link(t.footerDevelopers)}
          {dot}
          {link(t.footerTerms)}
          {dot}
          {link(t.footerPrivacy)}
          {dot}
          {link(t.footerPrivacySettings)}
          {dot}
          {link(t.footerFairPlay)}
          {dot}
          {link(t.footerPartners)}
          {dot}
          {link(t.footerCompliance)}
        </nav>
        <p className="text-center text-[11px] text-[var(--text-muted)]">
          {t.footerCopyright} © {new Date().getFullYear()}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[var(--text-muted)]">
          <span className="text-lg" aria-hidden>
            🍎
          </span>
          <span className="text-lg" aria-hidden>
            🤖
          </span>
          <span className="text-lg" aria-hidden>
            ▶
          </span>
          <span className="text-lg" aria-hidden>
            𝕏
          </span>
          <span className="text-lg" aria-hidden>
            ▶
          </span>
          <span className="text-lg" aria-hidden>
            💬
          </span>
        </div>
      </div>
    </footer>
  )
}
