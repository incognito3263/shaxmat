/**
 * Cburnett chess SVGs (45×45) from Wikimedia Commons.
 * @see https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
 *
 * Direct stable URLs on upload.wikimedia.org (CC BY-SA 3.0).
 * In-game suppliers (S) use Commoner (x…), distinct from pawns (p…), for the four “front” pieces.
 */
export type WikimediaPieceColor = 'white' | 'black'

const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons'

/** Piece letter → [white URL, black URL] */
const PIECE_URLS: Record<string, [string, string]> = {
  K: [`${COMMONS}/4/42/Chess_klt45.svg`, `${COMMONS}/f/f0/Chess_kdt45.svg`],
  Q: [`${COMMONS}/1/15/Chess_qlt45.svg`, `${COMMONS}/4/47/Chess_qdt45.svg`],
  R: [`${COMMONS}/7/72/Chess_rlt45.svg`, `${COMMONS}/f/ff/Chess_rdt45.svg`],
  B: [`${COMMONS}/b/b1/Chess_blt45.svg`, `${COMMONS}/9/98/Chess_bdt45.svg`],
  N: [`${COMMONS}/7/70/Chess_nlt45.svg`, `${COMMONS}/e/ef/Chess_ndt45.svg`],
  P: [`${COMMONS}/4/45/Chess_plt45.svg`, `${COMMONS}/c/c7/Chess_pdt45.svg`],
  S: [`${COMMONS}/e/eb/Chess_xlt45.svg`, `${COMMONS}/c/c4/Chess_xdt45.svg`],
}

export function wikimediaPieceSrc(type: string, color: WikimediaPieceColor): string {
  const t = type.toUpperCase()
  const pair = PIECE_URLS[t] ?? PIECE_URLS.P
  return color === 'white' ? pair[0] : pair[1]
}
