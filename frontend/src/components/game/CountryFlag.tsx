type CountryFlagProps = {
  code: string | null | undefined
  className?: string
}

export function CountryFlag({ code, className = '' }: CountryFlagProps) {
  const c = code?.trim().toLowerCase()
  if (!c || c.length < 2) return null
  const iso = c.slice(0, 2)
  return (
    <img
      src={`https://flagcdn.com/w20/${iso}.png`}
      srcSet={`https://flagcdn.com/w40/${iso}.png 2x`}
      alt=""
      width={20}
      height={14}
      className={`h-3.5 w-[1.4rem] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/25 ${className}`}
      loading="lazy"
    />
  )
}
