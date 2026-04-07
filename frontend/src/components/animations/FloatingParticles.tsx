import { motion } from 'framer-motion'
import React, { useMemo } from 'react'

interface FloatingParticlesProps {
  count?: number
  className?: string
  colors?: string[]
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 15,
  className = '',
  colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'],
}) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        color: colors[i % colors.length],
      })),
    [count, colors]
  )

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.15, 0.3, 0.15, 0.25, 0.15],
            scale: [1, 1.3, 0.9, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default FloatingParticles
