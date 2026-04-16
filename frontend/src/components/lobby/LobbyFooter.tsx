import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../../store'
import {
  IconWrap,
  AppStoreIcon,
  GooglePlayIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  TwitchIcon,
  InstagramIcon,
  DiscordIcon,
} from './FooterBrandIcons'

type SiteLinks = {
  app_store?: string
  google_play?: string
  tiktok?: string
  x?: string
  youtube?: string
  twitch?: string
  instagram?: string
  discord?: string
}

export function LobbyFooter() {
  const { t, setNotification } = useGameStore()
  const dot = <span className="mx-1.5 inline text-[var(--border)]">·</span>
  const year = new Date().getFullYear()
  const [siteLinks, setSiteLinks] = useState<SiteLinks | null>(null)

  useEffect(() => {
    void fetch('/api/site-links')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { links?: SiteLinks } | null) => {
        if (d?.links) setSiteLinks(d.links)
      })
      .catch(() => {})
  }, [])

  const textLink = (to: string, label: string) => (
    <Link
      to={to}
      className="inline text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
    >
      {label}
    </Link>
  )

  const iconRow: {
    key: keyof SiteLinks
    label: string
    Icon: typeof AppStoreIcon
  }[] = [
    { key: 'app_store', label: t.footerAriaAppStore, Icon: AppStoreIcon },
    { key: 'google_play', label: t.footerAriaGooglePlay, Icon: GooglePlayIcon },
    { key: 'tiktok', label: t.footerAriaTikTok, Icon: TikTokIcon },
    { key: 'x', label: t.footerAriaX, Icon: XIcon },
    { key: 'youtube', label: t.footerAriaYouTube, Icon: YouTubeIcon },
    { key: 'twitch', label: t.footerAriaTwitch, Icon: TwitchIcon },
    { key: 'instagram', label: t.footerAriaInstagram, Icon: InstagramIcon },
    { key: 'discord', label: t.footerAriaDiscord, Icon: DiscordIcon },
  ]

  return (
    <footer className="mt-auto w-full border-t border-[var(--border)] bg-[var(--bg)] px-4 py-6 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:gap-6">
        <nav
          className="flex flex-wrap items-center justify-center gap-y-1.5 text-center leading-relaxed"
          aria-label="Footer"
        >
          {textLink('/p/support', t.footerSupport)}
          {dot}
          {textLink('/p/language', t.footerLanguage)}
          {dot}
          {textLink('/p/about', t.footerAbout)}
          {dot}
          {textLink('/p/jobs', t.footerJobs)}
          {dot}
          {textLink('/p/developers', t.footerDevelopers)}
          {dot}
          {textLink('/p/terms', t.footerTerms)}
          {dot}
          {textLink('/p/privacy', t.footerPrivacy)}
          {dot}
          {textLink('/p/privacy-settings', t.footerPrivacySettings)}
          {dot}
          {textLink('/p/fair-play', t.footerFairPlay)}
          {dot}
          {textLink('/p/partners', t.footerPartners)}
          {dot}
          {textLink('/p/compliance', t.footerCompliance)}
          {dot}
          <span className="text-[11px] text-[var(--text-muted)]">
            {t.footerCopyright} © {year}
          </span>
        </nav>

        <div
          className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
          role="navigation"
          aria-label={t.footerSocialAriaLabel}
        >
          {iconRow.map(({ key, label, Icon }) => {
            const raw = siteLinks?.[key]
            const href = raw && !raw.startsWith('#') ? raw : undefined
            return (
              <IconWrap
                key={key}
                label={label}
                href={href}
                onPlaceholder={() => setNotification({ text: t.footerComingSoon, type: 'info' })}
              >
                <Icon />
              </IconWrap>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
