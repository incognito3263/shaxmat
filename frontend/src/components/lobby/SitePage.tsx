import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGameStore } from '../../store'
import type { Language } from '../../translations'

type PagePayload = { slug: string; lang: string; title: string; body: string }

export function SitePage() {
  const { slug } = useParams<{ slug: string }>()
  const { language, t, setLanguage } = useGameStore()
  const [page, setPage] = useState<PagePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('shaxmat_lang') as Language | null
    if (saved === 'en' || saved === 'uz' || saved === 'ru') setLanguage(saved)
    const theme = localStorage.getItem('shaxmat_ui_theme') as 'dark' | 'light' | null
    if (theme === 'dark' || theme === 'light') document.documentElement.setAttribute('data-theme', theme)
  }, [setLanguage])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setPage(null)
    setError(null)
    void (async () => {
      try {
        const res = await fetch(`/api/pages/${encodeURIComponent(slug)}?lang=${language}`)
        if (!res.ok) {
          if (!cancelled) setError(res.status === 404 ? 'Not found' : 'Error')
          return
        }
        const data = (await res.json()) as PagePayload
        if (!cancelled) setPage(data)
      } catch {
        if (!cancelled) setError('Network error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, language])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm font-black uppercase tracking-wider text-[#81b64c] transition-colors hover:brightness-110"
          >
            ← {t.backToMenu}
          </Link>
          <span className="font-black tracking-tighter text-[#81b64c]">SHAXMAT+</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {error && <p className="text-[var(--check-red)]">{error}</p>}
        {!error && !page && <p className="text-[var(--text-muted)]">…</p>}
        {page && (
          <article className="space-y-6">
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)] sm:text-3xl">{page.title}</h1>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {page.body}
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
