export function Avatar({ src, size = 'sm' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xs' }) {
  const sizeClass =
    size === '2xs'
      ? 'w-8 h-8 text-base'
      : size === 'sm'
        ? 'w-10 h-10 text-xl'
        : size === 'md'
          ? 'w-12 h-12 text-2xl'
          : size === 'lg'
            ? 'w-16 h-16 text-4xl'
            : 'w-24 h-24 text-6xl'
  const isImage = src && (src.startsWith('/') || src.startsWith('http'))
  return (
    <div
      className={`${sizeClass} bg-[var(--surface-2)] rounded flex items-center justify-center border border-[var(--border)] overflow-hidden shrink-0 shadow-lg`}
    >
      {isImage ? <img src={src} alt="" className="w-full h-full object-cover" /> : <span>{src || '👤'}</span>}
    </div>
  )
}
