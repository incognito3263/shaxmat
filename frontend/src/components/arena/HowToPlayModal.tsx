import { motion } from 'framer-motion'
import { useGameStore } from '../../store'
import { HowToPlaySections } from '../lobby/HowToPlayContent'

export function HowToPlayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useGameStore()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex max-h-[min(90dvh,800px)] w-full max-w-2xl flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-[var(--text-main)] sm:text-2xl">{t.howToPlayTitle}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t.howToPlayIntro}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-2xl leading-none text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
            aria-label={t.cancel}
          >
            ✕
          </button>
        </div>
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 sm:px-8">
          <HowToPlaySections />
        </div>
        <div className="shrink-0 border-t border-[var(--border)] p-4 sm:p-6">
          <button type="button" onClick={onClose} className="btn-primary w-full py-3 font-bold">
            {t.howToPlayClose}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
