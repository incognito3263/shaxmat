import type { WikimediaPieceColor } from './wikimediaPaths'

const SUPPLIER_PATH =
  'M28 174 H112 Q118 174 118 168 V148 Q118 142 112 142 H98 C91 142 86 137 84 131 C81 123 82 116 86 109 C90 102 92 95 92 87 V83 H101 Q106 83 106 78 V74 Q106 69 101 69 H94 C90 69 87 67 85 63 L75 42 Q73 37 70 37 Q67 37 65 42 L55 63 C53 67 50 69 46 69 H39 Q34 69 34 74 V78 Q34 83 39 83 H48 V87 C48 95 50 102 54 109 C58 116 59 123 56 131 C54 137 49 142 42 142 H28 Q22 142 22 148 V168 Q22 174 28 174 Z'

export function SupplierPiece({ color }: { color: WikimediaPieceColor }) {
  const isWhite = color === 'white'
  const fill = isWhite ? '#f7f7f4' : '#3e3e3e'
  const stroke = isWhite ? '#3a3a3a' : '#242424'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 190"
      width="100%"
      height="100%"
      className="max-h-[92%] max-w-[72%] object-contain select-none"
      aria-hidden
    >
      <path
        d={SUPPLIER_PATH}
        fill={fill}
        stroke={stroke}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
