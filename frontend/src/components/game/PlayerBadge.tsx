import { useEffect, useState } from 'react'
import { useGameStore } from '../../store'
import { CountryFlag } from './CountryFlag'

type PlayerBadgeProps = {
  color: 'white' | 'black'
  isActive: boolean
  displayName: string
  countryCode?: string | null
}

export function PlayerBadge({ color, isActive, displayName, countryCode }: PlayerBadgeProps) {
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
    <div className="flex w-full max-w-full items-center gap-2 py-1 md:gap-3 md:py-1.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-[#5c5c5c] md:h-9 md:w-9">
        {avatar && (avatar.startsWith('/') || avatar.startsWith('http')) ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg md:text-xl">{avatar || '👤'}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-white md:text-[15px]">{displayName}</span>
          <CountryFlag code={countryCode} />
        </div>
        {capturedPieces.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-0.5 text-[10px] leading-none text-white/45 md:text-[11px]">
            {capturedPieces.map((p: string, i: number) => (
              <span key={i}>{p}</span>
            ))}
          </div>
        )}
      </div>
      <div
        className={`min-w-[4rem] shrink-0 rounded border border-black/30 px-2 py-1.5 text-center font-mono text-sm tabular-nums text-white shadow-inner md:min-w-[4.75rem] md:px-2.5 md:text-base ${
          isActive ? (localTimeLeft < 30 ? 'bg-red-600 animate-pulse' : 'bg-[#312e2b]') : 'bg-[#262421] text-white/55'
        }`}
      >
        {formatTime(localTimeLeft)}
      </div>
    </div>
  )
}
