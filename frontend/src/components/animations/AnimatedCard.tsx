import { motion } from 'framer-motion'
import React from 'react'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
  onClick?: () => void
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  hover = true,
  onClick,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    whileHover={
      hover
        ? { y: -4, scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }
        : undefined
    }
    whileTap={onClick ? { scale: 0.98 } : undefined}
    onClick={onClick}
    className={className}
  >
    {children}
  </motion.div>
)

export default AnimatedCard
