import { useEffect, useState } from 'react'
import { useGameStore } from '../../store'
import { CountryFlag } from './CountryFlag'

type PlayerBadgeProps = {
  color: 'white' | 'black'
  isActive: boolean
  displayName: string
  countryCode?: string | null
  isMobile?: boolean
}

export function PlayerBadge({ color, isActive, displayName, countryCode, isMobile }: PlayerBadgeProps) {
  const { game } = useGameStore()
  const isWhite = color === 'white'
  const capturedPieces = game?.captured_pieces?.[color] || []
  const avatar = isWhite ? game?.white_avatar : game?.black_avatar
  
  // Get initial time from server
  const serverTimeLeft = isWhite ? (game?.white_time_left || 0) : (game?.black_time_left || 0)
  
  // Local state for smooth countdown
  const [localTimeLeft, setLocalTimeLeft] = useState(serverTimeLeft)

  // Sync local time with server time whenever server time updates
  useEffect(() => {
    setLocalTimeLeft(serverTimeLeft)
  }, [serverTimeLeft])

  // Real-time countdown effect
  useEffect(() => {
    let interval: any = null
    
    if (isActive && localTimeLeft > 0 && game?.status === 'active') {
      interval = setInterval(() => {
        setLocalTimeLeft((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, localTimeLeft, game?.status])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex w-full items-center ${isMobile ? 'gap-2 p-1.5' : 'gap-3 p-3'} rounded-xl border transition-all duration-300 ${
      isActive 
        ? 'bg-[var(--surface-3)] border-[#81b64c]/40 shadow-[0_0_20px_rgba(129,182,76,0.1)] ring-1 ring-[#81b64c]/20' 
        : 'bg-[var(--surface)] border-[var(--border)] opacity-80'
    }`}>
      {/* Avatar Section */}
      <div className="relative shrink-0">
        <div className={`${isMobile ? 'h-8 w-8' : 'h-11 w-11'} overflow-hidden rounded-lg border-2 ${isActive ? 'border-[#81b64c]' : 'border-[var(--border)]'} bg-[var(--surface-2)] shadow-lg`}>
          {avatar && (avatar.startsWith('/') || avatar.startsWith('http')) ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${isMobile ? 'text-sm' : 'text-xl'} text-[var(--text-main)]`}>{avatar || '👤'}</div>
          )}
        </div>
        {isActive && (
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81b64c] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#81b64c]"></span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className={`truncate ${isMobile ? 'text-[11px]' : 'text-[13px]'} font-black uppercase tracking-tight ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
            {displayName}
          </span>
          <div className="shrink-0 scale-75 lg:scale-100"><CountryFlag code={countryCode} /></div>
        </div>
        {!isMobile && capturedPieces.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-0.5 opacity-60 overflow-hidden">
            {capturedPieces.slice(0, 8).map((p: string, i: number) => (
              <span key={i} className="text-[9px] font-black text-[var(--text-main)] bg-[var(--surface-2)] px-1 rounded">{p}</span>
            ))}
            {capturedPieces.length > 8 && <span className="text-[9px] font-black text-[var(--text-muted)]">+{capturedPieces.length - 8}</span>}
          </div>
        )}
      </div>

      {/* Timer Section */}
      <div
        className={`${isMobile ? 'w-16 text-sm py-1.5' : 'w-[5.2rem] text-lg py-2.5'} shrink-0 rounded-lg text-center font-mono font-black tabular-nums transition-all duration-300 shadow-xl ${
          isActive 
            ? (localTimeLeft < 30 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#81b64c] text-white') 
            : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
        }`}
      >
        {formatTime(localTimeLeft)}
      </div>
    </div>
  )
}
