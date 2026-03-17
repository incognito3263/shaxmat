import React from 'react'

interface PieceProps {
  isWhite: boolean
  size: number | string
}

interface Props {
  type: string
  color: string
  size?: number | string
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

// ── Cburnett Premium Set (Lichess/Wikipedia Standard) ────────────────────────

function KingSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const innerStroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fill} strokeLinecap="butt" strokeLinejoin="miter" />
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill={fill} />
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke={innerStroke} />
      </g>
    </svg>
  )
}

function QueenSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const innerStroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" fill={fill} />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" fill={fill} strokeLinecap="butt" />
        <path d="M9 26c0 2 1.5 2 2.5 4 2.5-1 10-1 12.5 0 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-25 0z" fill={fill} strokeLinecap="butt" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" stroke={innerStroke} />
      </g>
    </svg>
  )
}

function RookSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" fill={fill} strokeLinecap="butt" />
        <path d="M34 14l-3 3H14l-3-3" fill={fill} />
        <path d="M31 17v12.5H14V17" fill={fill} strokeLinecap="butt" strokeLinejoin="miter" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill={fill} />
        <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
      </g>
    </svg>
  )
}

function BishopSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const innerStroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill={fill} strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke={innerStroke} strokeLinejoin="miter" />
      </g>
    </svg>
  )
}

function KnightSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const eyeColor = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={fill} />
        <path d="M24 18c.38 2.43-4.65 7.32-6 10-3 4-3 11-3 11" fill={fill} />
        <path d="M9.5 25.5A.5.5 0 1 1 8.5 25.5A.5.5 0 1 1 9.5 25.5z" fill={eyeColor} stroke="none" />
        <path d="M15 15.5c4.5 2 5 2 10 2 0 0-2.5-2.5-2.5-4s.5-4 1-7c-6 1-9 4-11 9z" fill={fill} />
      </g>
    </svg>
  )
}

function PawnSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill={fill} stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SupplierSvg({ isWhite, size }: PieceProps) {
  const fill = isWhite ? "#fff" : "#000"
  const innerStroke = isWhite ? "#000" : "#fff"
  return (
    <svg width={size} height={size} viewBox="0 0 45 45">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3z" fill={fill} />
        <path d="M15 36v-5l7.5-15 7.5 15v5H15z" fill={fill} />
        <path d="M22.5 5l6 6-6 6-6-6 6-6z" fill={fill} />
        <path d="M22.5 17v14" stroke={innerStroke} strokeWidth="1" />
      </g>
    </svg>
  )
}
