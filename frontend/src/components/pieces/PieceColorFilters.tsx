import { PIECE_BLACK_FILL } from './pieceColors'

/** Defines SVG filter id used by Wikimedia black piece <img>s — must match pieceColors. */
export function PieceColorFilters() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={0}
      height={0}
      className="pointer-events-none absolute overflow-hidden"
      style={{ position: 'fixed' }}
      aria-hidden
    >
      <defs>
        <filter id="piece-black-supplier-fill" colorInterpolationFilters="sRGB">
          <feFlood floodColor={PIECE_BLACK_FILL} result="flood" />
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored" />
          <feMerge>
            <feMergeNode in="colored" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
