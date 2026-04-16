import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store'
import PieceSvg from '../pieces/PieceSvg'

type LessonId = 'overview' | 'setup' | 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'supplier'
type ArrowTone = 'move' | 'capture' | 'special'

type Arrow = {
  from: [number, number]
  to: [number, number]
  tone: ArrowTone
  dashed?: boolean
}

type Lesson = {
  id: LessonId
  label: string
  short: string
}

const LESSONS: Lesson[] = [
  { id: 'overview', label: "Umumiy ko'rinish", short: "Nima o'zgarganini tez tushunish uchun" },
  { id: 'setup', label: 'Taxta va boshlanish', short: "10x8 doska va boshlang'ich joylashuv" },
  { id: 'pawn', label: 'Piyoda', short: 'Oddiy yurish va urish' },
  { id: 'rook', label: 'Ruh', short: "To'g'ri chiziqlardagi kuch" },
  { id: 'knight', label: 'Ot', short: 'Sakrash xususiyati' },
  { id: 'bishop', label: 'Fil', short: 'Diagonal nazorat' },
  { id: 'queen', label: 'Vazir', short: 'Eng moslashuvchan dona' },
  { id: 'king', label: 'Shoh', short: 'Himoya markazi' },
  { id: 'supplier', label: "Ta'minotchi", short: "Shaxmat+ ning maxsus donasi" },
]

const PIECE_TIPS: Record<string, { move: string; capture: string; special?: string; summary: string }> = {
  pawn: {
    move: "Oldinga 1 katak yuradi. Boshlang'ich yurishda 2 katakka ham chiqishi mumkin.",
    capture: "Diagonal bo'ylab uradi.",
    special: "So'nggi qatorda vazir, ruh, fil yoki otga aylanishi mumkin.",
    summary: "Piyoda kichik ko'rinsa ham, o'yinning markaziy strategiyasini belgilaydi.",
  },
  rook: {
    move: "Gorizontal yoki vertikal bo'ylab xohlagancha yuradi.",
    capture: "Shu yo'nalishlarda uradi.",
    summary: "Ruh ochiq chiziqlarda juda kuchli va oxirgi hujumlarda hal qiluvchi rol o'ynaydi.",
  },
  knight: {
    move: "L shaklida yuradi: 2 katak bir tomonga va 1 katak yon tomonga.",
    capture: "U yuradigan katakka kelib uradi, ustidan sakrab o'tadi.",
    summary: "Ot bloklarni aylanib o'ta oladi, shu sababli yopiq pozitsiyalarda juda foydali.",
  },
  bishop: {
    move: "Diagonallar bo'ylab xohlagancha yuradi.",
    capture: "Xuddi shu diagonal bo'ylab uradi.",
    summary: "Fil bir rangdagi maydonlarni nazorat qiladi va uzoq diagonal bosim yaratadi.",
  },
  queen: {
    move: "Ruh va fil kuchini birlashtiradi: istalgan yo'nalishda uzoqqa yuradi.",
    capture: "Harakat qilgan yo'nalishida uradi.",
    summary: "Vazir - eng faol dona. Uni erta yo'qotish odatda katta yo'qotishdir.",
  },
  king: {
    move: "Har tomonga faqat 1 katak yuradi.",
    capture: "1 katak masofadagi donani uradi.",
    special: "Rokirovka bilan xavfsiz joyga ko'chishi mumkin.",
    summary: "Shohning xavfsizligi butun partiyaning markazi hisoblanadi.",
  },
  supplier: {
    move: "1 katak diagonal oldinga yuradi.",
    capture: "1 katak to'g'riga, vertikal oldinga uradi.",
    special: "Boshlanishida oq uchun 3-qator, qora uchun 8-qator; oxirgi qatorda vazir, ruh, fil yoki otga aylanadi.",
    summary: "Ta'minotchi oddiy piyodadan boshqacha ishlaydi va 10x8 taxtaga yangi taktika olib kiradi.",
  },
}

function pieceTypeFromLesson(id: Exclude<LessonId, 'overview' | 'setup'>): string {
  switch (id) {
    case 'pawn':
      return 'P'
    case 'rook':
      return 'R'
    case 'knight':
      return 'N'
    case 'bishop':
      return 'B'
    case 'queen':
      return 'Q'
    case 'king':
      return 'K'
    case 'supplier':
      return 'S'
  }
}

function pieceTitle(id: Exclude<LessonId, 'overview' | 'setup'>): string {
  switch (id) {
    case 'pawn':
      return 'Piyoda'
    case 'rook':
      return 'Ruh'
    case 'knight':
      return 'Ot'
    case 'bishop':
      return 'Fil'
    case 'queen':
      return 'Vazir'
    case 'king':
      return 'Shoh'
    case 'supplier':
      return "Ta'minotchi"
  }
}

function getArrowPath(from: [number, number], to: [number, number]) {
  const step = 20
  return {
    startX: from[0] * step + 10,
    startY: from[1] * step + 10,
    endX: to[0] * step + 10,
    endY: to[1] * step + 10,
  }
}

function MovementDiagram({ type, arrows, label }: { type: string; arrows: Arrow[]; label: string }) {
  const icon = type.toUpperCase() === 'S' ? <PieceSvg type="S" color="white" /> : <PieceSvg type={type} color="white" />

  return (
    <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#221f1b] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
        {Array.from({ length: 25 }).map((_, index) => {
          const row = Math.floor(index / 5)
          const col = index % 5
          const light = (row + col) % 2 === 0
          return <div key={index} className={light ? 'bg-[#ead7b3]' : 'bg-[#b8895f]'} />
        })}
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <marker id="arrow-move" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#8bc34a" />
          </marker>
          <marker id="arrow-capture" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#ef5350" />
          </marker>
          <marker id="arrow-special" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#f6d57a" />
          </marker>
        </defs>
        {arrows.map((arrow, index) => {
          const { startX, startY, endX, endY } = getArrowPath(arrow.from, arrow.to)
          const stroke = arrow.tone === 'capture' ? '#ef5350' : arrow.tone === 'special' ? '#f6d57a' : '#8bc34a'
          const marker = arrow.tone === 'capture' ? 'url(#arrow-capture)' : arrow.tone === 'special' ? 'url(#arrow-special)' : 'url(#arrow-move)'
          return (
            <line
              key={index}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={stroke}
              strokeWidth="3.2"
              strokeLinecap="round"
              markerEnd={marker}
              strokeDasharray={arrow.dashed ? '5 5' : undefined}
              opacity="0.95"
            />
          )
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-[#1d1b19]/70 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="h-16 w-16">{icon}</div>
        </div>
      </div>

      <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
        {label}
      </div>
    </div>
  )
}

function PieceDiagramSet({ id, pieceType }: { id: Exclude<LessonId, 'overview' | 'setup'>; pieceType: string }) {
  const diagrams = useMemo(() => {
    const from: [number, number] = [2, 2]
    const makeArrow = (to: [number, number], tone: ArrowTone, dashed = false): Arrow => ({
      from,
      to,
      tone,
      dashed: dashed || undefined,
    })

    switch (id) {
      case 'pawn':
        return {
          move: [
            makeArrow([2, 1], 'move'),
            makeArrow([2, 0], 'special', true),
          ],
          capture: [
            makeArrow([1, 1], 'capture'),
            makeArrow([3, 1], 'capture'),
          ],
        }
      case 'rook':
        return {
          move: [
            makeArrow([0, 2], 'move'),
            makeArrow([4, 2], 'move'),
            makeArrow([2, 0], 'move'),
            makeArrow([2, 4], 'move'),
          ],
          capture: [
            makeArrow([1, 2], 'capture'),
            makeArrow([3, 2], 'capture'),
            makeArrow([2, 1], 'capture'),
            makeArrow([2, 3], 'capture'),
          ],
        }
      case 'knight':
        return {
          move: [
            makeArrow([0, 1], 'move'),
            makeArrow([1, 0], 'move'),
            makeArrow([3, 0], 'move'),
            makeArrow([4, 1], 'move'),
          ],
          capture: [
            makeArrow([0, 3], 'capture'),
            makeArrow([1, 4], 'capture'),
            makeArrow([3, 4], 'capture'),
            makeArrow([4, 3], 'capture'),
          ],
        }
      case 'bishop':
        return {
          move: [
            makeArrow([0, 0], 'move'),
            makeArrow([4, 0], 'move'),
            makeArrow([0, 4], 'move'),
            makeArrow([4, 4], 'move'),
          ],
          capture: [
            makeArrow([1, 1], 'capture'),
            makeArrow([3, 1], 'capture'),
            makeArrow([1, 3], 'capture'),
            makeArrow([3, 3], 'capture'),
          ],
        }
      case 'queen':
        return {
          move: [
            makeArrow([0, 2], 'move'),
            makeArrow([4, 2], 'move'),
            makeArrow([2, 0], 'move'),
            makeArrow([2, 4], 'move'),
            makeArrow([0, 0], 'move'),
            makeArrow([4, 4], 'move'),
          ],
          capture: [
            makeArrow([1, 2], 'capture'),
            makeArrow([3, 2], 'capture'),
            makeArrow([2, 1], 'capture'),
            makeArrow([2, 3], 'capture'),
            makeArrow([1, 1], 'capture'),
            makeArrow([3, 3], 'capture'),
          ],
        }
      case 'king':
        return {
          move: [
            makeArrow([1, 2], 'move'),
            makeArrow([3, 2], 'move'),
            makeArrow([2, 1], 'move'),
            makeArrow([2, 3], 'move'),
            makeArrow([1, 1], 'move'),
            makeArrow([1, 3], 'move'),
            makeArrow([3, 1], 'move'),
            makeArrow([3, 3], 'move'),
          ],
          capture: [
            makeArrow([1, 2], 'capture'),
            makeArrow([3, 2], 'capture'),
            makeArrow([2, 1], 'capture'),
            makeArrow([2, 3], 'capture'),
          ],
        }
      case 'supplier':
        return {
          move: [
            makeArrow([1, 1], 'move'),
            makeArrow([3, 1], 'move'),
          ],
          capture: [makeArrow([2, 1], 'capture')],
        }
    }
  }, [id]) as { move: Arrow[]; capture: Arrow[] }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MovementDiagram type={pieceType} arrows={diagrams.move} label="Yurish rasmi" />
      <MovementDiagram type={pieceType} arrows={diagrams.capture} label="Urish rasmi" />
    </div>
  )
}

function overviewPieceAt(r: number, c: number): string | null {
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'] as const
  if (r === 0 || r === 9) return back[c] ?? null
  if (r === 1 || r === 8) return 'P'
  if (r === 2 || r === 7) {
    if (c === 1 || c === 3 || c === 5 || c === 7) return 'S'
    return null
  }
  return null
}

function OverviewBoard() {
  const rows = 10
  const cols = 8

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Boshlang'ich doska</div>
          <div className="mt-1 text-lg font-black text-[var(--text-main)]">Shaxmat+ taxtasining ko'rinishi</div>
        </div>
        <div className="rounded-full border border-[#8bc34a]/20 bg-[#8bc34a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#8bc34a]">
          8 × 10
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[#2b231e]">
        <div className="mx-auto w-full max-w-full aspect-[8/10] min-w-0" dir="ltr" style={{ direction: 'ltr' }}>
          <div
            className="grid h-full w-full grid-cols-8"
            style={{
              gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
              gridAutoFlow: 'row',
              direction: 'ltr',
            }}
          >
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const rankFromBottom = rows - 1 - r
                const rankNumber = rankFromBottom + 1
                const light = (rankNumber + c) % 2 === 0
                const piece = overviewPieceAt(r, c)
                const isSupplier = piece === 'S'
                const pieceType = piece && piece !== 'S' ? piece : isSupplier ? 'S' : null
                const isBlackSide = r < 3
                return (
                  <div
                    key={`ov-${r}-${c}`}
                    className={`relative min-h-0 min-w-0 ${light ? 'bg-[#edd6ae]' : 'bg-[#b8865b]'}`}
                  >
                    {pieceType && (
                      <div className="absolute inset-0 flex items-center justify-center p-[8%]">
                        <div className="h-full w-full max-h-full max-w-full">
                          <PieceSvg type={pieceType} color={isBlackSide ? 'black' : 'white'} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ).flat()}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewPanel() {
  return (
    <div className="space-y-6">
      <OverviewBoard />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(139,195,74,0.2),rgba(36,32,28,0.95)_32%,rgba(15,14,13,1))] p-6 shadow-2xl">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#a6dc62]">
            <span className="rounded-full border border-[#8bc34a]/25 bg-[#8bc34a]/10 px-3 py-1">Rasmiy o'quv qo'llanma</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">10x8 doska</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Ta'minotchi dona</span>
          </div>
          <h3 className="mt-5 text-3xl font-black tracking-tight text-[var(--text-main)]">Shaxmat+ nima bilan boshqacha?</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            Oddiy shaxmat qoidalari saqlanadi, lekin taxta kattalashadi va ta'minotchi degan yangi dona qo'shiladi.
            Natijada o'yin ko'proq reja, logistika va pozitsion fikrlash talab qiladi.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8bc34a]">Maydon</div>
              <div className="mt-2 text-2xl font-black text-white">8x10</div>
              <div className="mt-2 text-xs leading-6 text-white/70">Oddiy doskaga nisbatan qo'shimcha vertikal makon.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8bc34a]">Qo'shin</div>
              <div className="mt-2 text-2xl font-black text-white">20 dona</div>
              <div className="mt-2 text-xs leading-6 text-white/70">Har ikki tomonda kengroq tarkib mavjud.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8bc34a]">Maxsus dona</div>
              <div className="mt-2 text-2xl font-black text-white">S</div>
              <div className="mt-2 text-xs leading-6 text-white/70">Ta'minotchi qo'shimcha taktika va tempo beradi.</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Asosiy g'oya</div>
          <div className="mt-1 text-lg font-black text-[var(--text-main)]">Ta'minotchi toshining vazifasi</div>
          <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">
            Maqsad avvalgidek: shohni mot qilish. Ammo 10x8 format va ta'minotchi sababli markazni boshqarish,
            qanotlarni tez ochish va oxirgi qatorga chiqish yanada muhim bo'ladi.
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Rokirovka</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-main)]">Shoh va ruh bir harakatda joyini almashtirib, himoya va faollikni muvozanatlashtiradi.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">O'tib urish</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-main)]">Piyodaning ikki katakli yurishiga javoban qo'llaniladigan maxsus urish qoidasidir.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Promotsiya</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-main)]">Oxirgi qatorga yetgan dona kuchliroq figuraga aylanadi.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Taqqoslash</div>
          <h4 className="mt-2 text-xl font-black text-[var(--text-main)]">Klassik shaxmat va Shaxmat+</h4>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--border)]">
            <div className="grid grid-cols-[1.1fr_0.9fr_1fr] bg-[var(--surface-2)] text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
              <div className="px-4 py-3">Xususiyat</div>
              <div className="px-4 py-3">Klassik</div>
              <div className="px-4 py-3 text-[#8bc34a]">Shaxmat+</div>
            </div>
            {[
              ['Maydon hajmi', '8x8', '8x10'],
              ["Qo'shin tarkibi", '16 dona', '20 dona'],
              ["Ta'minot qatlami", "Yo'q", "Ta'minotchi bor"],
              ['Strategiya', "Tezkor to'qnashuv", 'Chuqur rejalashtirish'],
            ].map(([label, classic, plus]) => (
              <div key={String(label)} className="grid grid-cols-[1.1fr_0.9fr_1fr] border-t border-[var(--border)] bg-[var(--surface)]">
                <div className="px-4 py-4 text-sm font-semibold text-[var(--text-main)]">{label}</div>
                <div className="px-4 py-4 text-sm text-[var(--text-muted)]">{classic}</div>
                <div className="px-4 py-4 text-sm font-semibold text-[#8bc34a]">{plus}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(20,18,16,1),rgba(28,25,22,0.95))] p-6 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Qanday o'rganasiz</div>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-main)]">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4">1. Har bir dona uchun yurish va urish rasmlarini alohida ko'ring.</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4">2. Boshlang'ich doskani yaxshilab eslab qoling.</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4">3. Ta'minotchi qaysi vaziyatda kuchayishini tushuning.</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4">4. So'ngra real partiyada kombinatsiyalarni sinab ko'ring.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function PieceLesson({ id }: { id: Exclude<LessonId, 'overview' | 'setup'> }) {
  const lesson = PIECE_TIPS[id]
  const pieceType = pieceTypeFromLesson(id)
  const title = pieceTitle(id)

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Dona</div>
              <h3 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-main)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{lesson.summary}</p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(139,195,74,0.15),rgba(255,255,255,0.03))]">
              <div className="h-20 w-20">
                <PieceSvg type={pieceType} color="white" />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Harakat</div>
              <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{lesson.move}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Urish</div>
              <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{lesson.capture}</p>
            </div>
            {lesson.special && (
              <div className="rounded-2xl border border-[#8bc34a]/30 bg-[#8bc34a]/10 p-4">
                <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Maxsus</div>
                <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">{lesson.special}</p>
              </div>
            )}
          </div>
        </div>

        <PieceDiagramSet id={id} pieceType={pieceType} />
      </div>
    </div>
  )
}

function SetupLesson() {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Boshlanish</div>
          <h3 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-main)]">10x8 doska qanday ko'rinadi?</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Qora donalar yuqorida, oq donalar pastda turadi. Ta'minotchilar esa klassik piyodalar bilan bir qatorda,
            3 va 8-qatorlarda maxsus joylashadi.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Oq ta'minotchilar</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-main)]">3-qatorning oq kataklarida joylashadi.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Qora ta'minotchilar</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-main)]">8-qatorning qora kataklarida joylashadi.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#8bc34a]/20 bg-[#8bc34a]/10 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-[#8bc34a]">Nega bu muhim?</div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">
              Qo'shimcha ikki qator ochilishlarni cho'zadi, markaz uchun kurashni murakkablashtiradi va oxirgi bosqichga ko'proq hisob-kitob olib kiradi.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Boshlang'ich ritm</div>
          <div className="mt-4 grid gap-3">
            {[
              "Ruhlar ochilishi uchun chiziqlarni erta tayyorlang.",
              "Otlar va fillar orasidagi muvozanatni saqlang.",
              "Ta'minotchini himoya qilish bilan birga, uni bosim vositasiga aylantiring.",
              "Shoh xavfsizligi doim birinchi o'rinda bo'lsin.",
            ].map((text) => (
              <div key={text} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-main)]">
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LessonMenu({ active, onSelect }: { active: LessonId; onSelect: (id: LessonId) => void }) {
  return (
    <aside className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
      <div className="px-2 pb-3 pt-1">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Darslar menyusi</div>
        <div className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Har bir dona uchun yurish va urish alohida ko'rsatiladi.
        </div>
      </div>

      <div className="space-y-2">
        {LESSONS.map((lesson) => {
          const selected = lesson.id === active
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onSelect(lesson.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                selected
                  ? 'border-[#8bc34a]/30 bg-[#8bc34a]/10 shadow-[0_8px_24px_rgba(139,195,74,0.15)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#8bc34a]/20 hover:bg-white/5'
              }`}
            >
              <div className={`text-sm font-black ${selected ? 'text-[#8bc34a]' : 'text-[var(--text-main)]'}`}>{lesson.label}</div>
              <div className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{lesson.short}</div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

/** Shared manual sections - used by modal and lobby Guide page. */
export function HowToPlaySections() {
  const [active, setActive] = useState<LessonId>('overview')
  const { t } = useGameStore()

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(29,26,23,1),rgba(19,17,15,0.96))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Shaxmat+ o'rganish markazi</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-main)] sm:text-4xl">{t.howToPlayTitle}</h2>
            <p className="mt-3 max-w-none text-sm leading-7 text-[var(--text-muted)]">{t.howToPlayIntro}</p>
          </div>
          <div className="rounded-2xl border border-[#8bc34a]/20 bg-[#8bc34a]/10 px-4 py-3 text-right shrink-0">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Doska</div>
            <div className="mt-1 text-2xl font-black text-[var(--text-main)]">8 × 10</div>
          </div>
        </div>
      </div>

      <div className="grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <LessonMenu active={active} onSelect={setActive} />

        <div className="min-w-0 w-full max-w-full space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              {active === 'overview' && <OverviewPanel />}
              {active === 'setup' && <SetupLesson />}
              {active === 'pawn' && <PieceLesson id="pawn" />}
              {active === 'rook' && <PieceLesson id="rook" />}
              {active === 'knight' && <PieceLesson id="knight" />}
              {active === 'bishop' && <PieceLesson id="bishop" />}
              {active === 'queen' && <PieceLesson id="queen" />}
              {active === 'king' && <PieceLesson id="king" />}
              {active === 'supplier' && <PieceLesson id="supplier" />}
            </motion.div>
          </AnimatePresence>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">Asosiy g'oya</div>
                <div className="mt-1 text-lg font-black text-[var(--text-main)]">Ta'minotchi toshining vazifasi</div>
              </div>
              <div className="rounded-full border border-[#8bc34a]/25 bg-[#8bc34a]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#8bc34a]">
                Taktika va logistika
              </div>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--text-muted)]">
              Ta'minotchi oddiy shaxmatdagi piyodaga o'xshab ketadi, lekin u diagonal yuradi, to'g'riga uradi va oxirgi qatorga chiqsa kuchli figuralardan biriga aylanishi mumkin.
              Aynan shu dona Shaxmat+ ni boshqalardan ajratib turadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
