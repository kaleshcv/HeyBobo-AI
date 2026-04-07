import { motion } from 'framer-motion'
import React from 'react'

interface StreakFlameProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { icon: 'text-lg', text: 'text-xs', container: 'gap-1' },
  md: { icon: 'text-2xl', text: 'text-sm', container: 'gap-1.5' },
  lg: { icon: 'text-4xl', text: 'text-base', container: 'gap-2' },
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  streak,
  size = 'md',
  className = '',
}) => {
  const s = sizeMap[size]
  const isHot = streak >= 7
  const isBlazing = streak >= 30

  return (
    <motion.div
      className={`flex items-center ${s.container} ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.span
        className={s.icon}
        animate={
          isBlazing
            ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }
            : isHot
            ? { scale: [1, 1.1, 1] }
            : {}
        }
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {isBlazing ? '🔥' : isHot ? '🔥' : '🔥'}
      </motion.span>

      <div className="flex flex-col">
        <motion.span
          className={`font-bold ${s.text} ${
            isBlazing
              ? 'text-orange-500'
              : isHot
              ? 'text-amber-500'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          key={streak}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {streak} day{streak !== 1 ? 's' : ''}
        </motion.span>
        {size !== 'sm' && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            streak
          </span>
        )}
      </div>

      {/* Glow effect for hot streaks */}
      {isHot && (
        <motion.div
          className="absolute -inset-2 rounded-full bg-orange-400/20 blur-md -z-10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}

export default StreakFlame
