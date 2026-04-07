import { motion } from 'framer-motion'
import React from 'react'
import { CountUp } from './CountUp'

interface AnimatedCounterProps {
  value: number
  label: string
  icon: React.ReactNode
  color?: string
  delay?: number
  suffix?: string
  className?: string
  onClick?: () => void
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  label,
  icon,
  color = '#3b82f6',
  delay = 0,
  suffix = '',
  className = '',
  onClick,
}) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${
      onClick ? 'cursor-pointer' : ''
    } ${className}`}
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, type: 'spring', stiffness: 120 }}
    whileHover={onClick ? { y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : undefined}
    whileTap={onClick ? { scale: 0.97 } : undefined}
    onClick={onClick}
  >
    {/* Background glow */}
    <motion.div
      className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20"
      style={{ backgroundColor: color }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 3, repeat: Infinity }}
    />

    <div className="relative flex items-center gap-4">
      <motion.div
        className="flex items-center justify-center w-12 h-12 rounded-xl"
        style={{ backgroundColor: `${color}15` }}
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <span style={{ color }}>{icon}</span>
      </motion.div>

      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          <CountUp to={value} delay={delay + 0.3} suffix={suffix} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  </motion.div>
)

export default AnimatedCounter
