import { motion } from 'framer-motion'
import React from 'react'
import { CountUp } from './CountUp'

interface ScoreRevealProps {
  score: number
  total: number
  label?: string
  className?: string
}

export const ScoreReveal: React.FC<ScoreRevealProps> = ({
  score,
  total,
  label = 'Score',
  className = '',
}) => {
  const percentage = Math.round((score / total) * 100)
  const isGreat = percentage >= 80
  const isGood = percentage >= 60
  const color = isGreat ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      className={`flex flex-col items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
      >
        <svg width={140} height={140} className="-rotate-90">
          <circle cx={70} cy={70} r={60} fill="none" stroke="#e5e7eb" strokeWidth={10} />
          <motion.circle
            cx={70}
            cy={70}
            r={60}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={377}
            initial={{ strokeDashoffset: 377 }}
            animate={{ strokeDashoffset: 377 - (percentage / 100) * 377 }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
          >
            <CountUp
              to={percentage}
              duration={1}
              delay={1}
              suffix="%"
              className="text-3xl font-bold"
              // style color in parent
            />
          </motion.div>
          <span className="text-xs text-gray-400 mt-0.5">{label}</span>
        </div>
      </motion.div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-lg font-semibold">
          {score} / {total}
        </span>
        {isGreat && (
          <motion.div
            className="text-sm mt-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [0, 1.2, 1] }}
            transition={{ delay: 2 }}
          >
            🌟 Excellent!
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default ScoreReveal
