import { PIECE_BLACK_FILL, PIECE_WHITE_FILL, PIECE_WHITE_STROKE } from './pieceColors'

/** SVG filters for Wikimedia <img> pieces — fills match supplier (pieceColors). */
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
        <filter id="piece-white-supplier-fill" colorInterpolationFilters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.15" result="dilated" />
          <feComposite in="dilated" in2="SourceAlpha" operator="out" result="ringAlpha" />
          <feFlood floodColor={PIECE_WHITE_STROKE} result="strokeFlood" />
          <feComposite in="strokeFlood" in2="ringAlpha" operator="in" result="stroke" />
          <feFlood floodColor={PIECE_WHITE_FILL} result="fillFlood" />
          <feComposite in="fillFlood" in2="SourceAlpha" operator="in" result="fill" />
          <feMerge>
            <feMergeNode in="stroke" />
            <feMergeNode in="fill" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
