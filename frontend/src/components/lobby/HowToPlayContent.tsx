import { useGameStore } from '../../store'

function Section({ title, body }: { title: string; body: string }) {
  const paragraphs = body.split('\n\n').filter(Boolean)
  return (
    <section className="border-b border-[var(--border)]/60 py-5 last:border-0">
      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-green)]">{title}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-main)]">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </section>
  )
}

/** Shared manual sections — used by modal and lobby Guide page. */
export function HowToPlaySections() {
  const { t } = useGameStore()
  return (
    <>
      <Section title={t.howToPlayBasicsTitle} body={t.howToPlayBasicsBody} />
      <Section title={t.howToPlayBoardTitle} body={t.howToPlayBoardBody} />
      <Section title={t.howToPlaySuppliersTitle} body={t.howToPlaySuppliersBody} />
      <Section title={t.howToPlayPlatformTitle} body={t.howToPlayPlatformBody} />
    </>
  )
}
