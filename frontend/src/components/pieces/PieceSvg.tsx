interface PieceProps {
  isWhite: boolean
  size: number
}

interface Props {
  type: string
  color: string
  size?: number
}

export default function PieceSvg({ type, color, size = 45 }: Props) {
  const isWhite = color === 'white'
  const props: PieceProps = { isWhite, size }

  switch (type.toUpperCase()) {
    case 'K': return <KingSvg {...props} />
    case 'Q': return <QueenSvg {...props} />
    case 'R': return <RookSvg {...props} />
    case 'B': return <BishopSvg {...props} />
    case 'N': return <KnightSvg {...props} />
    case 'P': return <PawnSvg {...props} />
    case 'S': return <SupplierSvg {...props} />
    default: return null
  }
}

// ── Chess.com Style SVGs (Refined Paths) ───────────────────────────────────────

function KingSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6 0-1.5 2.5 3 10 3 10" />
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-4-6-4-2 0-2.5 2-4 2-1.5 0-2-2-4-2s-2.5 2-4 2c-1.5 0-2-2-4-2-5 0-2 3-6 4-3 6 6 10.5 6 10.5v7z" />
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
      </g>
    </svg>
  )
}

function QueenSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z" />
        <path d="M9 26c0 2 1.5 2 2.5 4 2.5 4 4.5 1 12 1s9.5 3 12 1c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 18.5-1 22 0" />
      </g>
    </svg>
  )
}

function RookSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" strokeLinecap="butt" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
      </g>
    </svg>
  )
}

function BishopSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1 1 1 3H8c0-2 1-3 1-3z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
        </g>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinejoin="miter" />
      </g>
    </svg>
  )
}

function KnightSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
        <path d="M24 18c.38 2.43-4.65 1.47-5 0 3.42-1.41 4.44-5.22 2-8-1.5-1.5-2-1-2.5-1-1.5-1-1-1.5-2.5-1-1.5 1-1.5 3-4 3-2.5 0-3 1.5-3 3 0 3 2 5 3 5 1 1 2 1 3 0 1 1 3 0 4-1 1.42 2.1 3.48 4 6 5z" />
        <path d="M9.5 25.5A.5.5 0 1 1 8.5 25.5.5.5 0 1 1 9.5 25.5z" />
        <path d="M15 15.5c4.5 2 5 2 5 2" fill="none" />
      </g>
    </svg>
  )
}

function PawnSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SupplierSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const stroke = isWhite ? "#000" : "#fff"
  // A custom stylized piece for SHAXMAT+, keeping the Chess.com aesthetic
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3z" />
        <path d="M15 36v-5l7.5-15 7.5 15v5H15z" />
        <path d="M22.5 5l6 6-6 6-6-6 6-6z" />
        <path d="M22.5 17v14" fill="none" strokeWidth="1" />
      </g>
    </svg>
  )
}
