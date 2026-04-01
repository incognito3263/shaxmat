import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store'
import { Avatar } from './Avatar'
import { AVATARS } from '../data/avatars'
import { COUNTRY_OPTIONS } from '../data/countryOptions'

export function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, t, uploadAvatar, updateProfile } = useGameStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-8 top-8 text-3xl text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
        >
          ✕
        </button>
        <h2 className="mb-10 text-center text-2xl font-black uppercase tracking-widest text-[var(--text-main)]">{t.editProfile}</h2>
        <div className="flex flex-col items-center gap-8">
          <Avatar src={user.avatar} size="lg" />
          <label className="w-full text-left text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {t.countryRegion}
            <select
              value={user.country_code || ''}
              onChange={(e) => void updateProfile({ country_code: e.target.value || null })}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-green)]"
            >
              {COUNTRY_OPTIONS.map((o) => (
                <option key={o.code || 'none'} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[10px] normal-case font-normal tracking-normal text-[var(--text-muted)] opacity-80">{t.countryRegionHint}</p>
          </label>
          <div className="w-full space-y-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn-secondary w-full py-5 text-base"
            >
              {isUploading ? '...' : t.chooseAvatar}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) {
                  setIsUploading(true)
                  const url = await uploadAvatar(f)
                  if (url) await updateProfile({ avatar: url })
                  setIsUploading(false)
                }
              }}
              className="hidden"
              accept="image/*"
            />
            <div className="grid grid-cols-4 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => void updateProfile({ avatar: a })}
                  className={`rounded p-4 text-4xl transition-all hover:bg-[var(--surface-2)] ${
                    user.avatar === a ? 'scale-110 bg-[var(--surface-2)] shadow-xl' : 'opacity-30 hover:opacity-100'
                  }`}
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
