import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wikimediaPieceSrc, type WikimediaPieceColor } from './wikimediaPaths'
import { SupplierPiece } from './SupplierPiece'

const PieceRenderer: React.FC<{ type: string; color: string; size?: number | string }> = ({
  type,
  color,
  size: _size,
}) => {
  const colorKey: WikimediaPieceColor = color === 'white' ? 'white' : 'black'
  const t = type.toUpperCase()
  if (!['K', 'Q', 'R', 'B', 'N', 'P', 'S'].includes(t)) return null

  const src = t === 'S' ? '' : wikimediaPieceSrc(type, colorKey)
  const motionKey = t === 'S' ? `supplier-${color}` : `${src}-${type}-${color}`

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={motionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full h-full flex items-center justify-center pointer-events-none"
      >
        {t === 'S' ? (
          <SupplierPiece color={colorKey} />
        ) : (
          <img
            src={src}
            alt=""
            draggable={false}
            className="w-[88%] h-[88%] object-contain select-none"
            style={
              colorKey === 'black'
                ? { filter: 'url(#piece-black-supplier-fill)' }
                : undefined
            }
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default PieceRenderer
