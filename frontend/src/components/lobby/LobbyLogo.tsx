/** Logo for lobby sidebar — green hex mark matching App header. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M16 4L26 10V22L16 28L6 22V10L16 4Z" stroke="#81b64c" strokeWidth="2" />
      <path d="M16 10V22M10 13L22 19M22 13L10 19" stroke="#81b64c" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="16" r="4" fill="#81b64c" fillOpacity="0.2" />
    </svg>
  )
}
