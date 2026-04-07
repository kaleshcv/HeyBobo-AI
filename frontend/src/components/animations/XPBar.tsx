import { motion } from 'framer-motion'
import React from 'react'
import { CountUp } from './CountUp'

interface XPBarProps {
  currentXP: number
  maxXP: number
  level: number
  className?: string
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  maxXP,
  level,
  className = '',
}) => {
  const percentage = Math.min((currentXP / maxXP) * 100, 100)

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Level Badge */}
      <motion.div
        className="relative flex-shrink-0"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">{level}</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-400/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* XP Bar */}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            <CountUp to={currentXP} duration={1} /> / {maxXP} XP
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Level {level}
          </span>
        </div>
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default XPBar
