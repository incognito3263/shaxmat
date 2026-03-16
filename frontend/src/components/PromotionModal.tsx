import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store'
import PieceSvg from './pieces/PieceSvg'

const PIECES = [
  { type: 'Q', label: 'Queen' },
  { type: 'R', label: 'Rook' },
  { type: 'B', label: 'Bishop' },
  { type: 'N', label: 'Knight' },
]

export default function PromotionModal() {
  const { pendingPromotion, resolvePromotion, cancelPromotion } = useGameStore()

  return (
    <AnimatePresence>
      {pendingPromotion && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,12,16,0.75)', backdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cancelPromotion}
        >
          <motion.div
            className="glass rounded-2xl p-6 shadow-2xl"
            style={{
              border: '1px solid rgba(77,217,232,0.2)',
              boxShadow: '0 0 60px rgba(77,217,232,0.1), 0 24px 60px rgba(0,0,0,0.8)',
              minWidth: 300,
            }}
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold tracking-widest text-accentCyan uppercase">
                Promotion
              </h2>
              <p className="text-sm text-gray-500 mt-1">Choose your piece</p>
            </div>

            {/* Piece grid */}
            <div className="grid grid-cols-4 gap-3">
              {PIECES.map(({ type, label }) => (
                <motion.button
                  key={type}
                  onClick={() => resolvePromotion(type)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  whileHover={{
                    scale: 1.08,
                    background: 'rgba(77,217,232,0.12)',
                    borderColor: 'rgba(77,217,232,0.4)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                >
                  <PieceSvg type={type} color={pendingPromotion.color} size={52} />
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                </motion.button>
              ))}
            </div>

            {/* Cancel */}
            <button
              onClick={cancelPromotion}
              className="mt-4 w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-2"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
