import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wikimediaPieceSrc, type WikimediaPieceColor } from './wikimediaPaths'

const PieceRenderer: React.FC<{ type: string; color: string; size?: number | string }> = ({
  type,
  color,
  size: _size,
}) => {
  const colorKey: WikimediaPieceColor = color === 'white' ? 'white' : 'black'
  const t = type.toUpperCase()
  if (!['K', 'Q', 'R', 'B', 'N', 'P', 'S'].includes(t)) return null
  const src = wikimediaPieceSrc(type, colorKey)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${src}-${type}-${color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full h-full flex items-center justify-center pointer-events-none"
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className={`w-[88%] h-[88%] object-contain select-none ${
            colorKey === 'black' ? 'piece-black-soft' : ''
          }`}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default PieceRenderer
