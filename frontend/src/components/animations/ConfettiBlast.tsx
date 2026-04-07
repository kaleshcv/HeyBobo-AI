import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState, useMemo } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  shape: 'circle' | 'square' | 'triangle'
}

interface ConfettiBlastProps {
  trigger: boolean
  particleCount?: number
  duration?: number
  colors?: string[]
  onComplete?: () => void
}

const defaultColors = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
]

export const ConfettiBlast: React.FC<ConfettiBlastProps> = ({
  trigger,
  particleCount = 50,
  duration = 2500,
  colors = defaultColors,
  onComplete,
}) => {
  const [isActive, setIsActive] = useState(false)

  const particles = useMemo<Particle[]>(() => {
    if (!trigger) return []
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 100),
      rotation: Math.random() * 720 - 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    }))
  }, [trigger, particleCount, colors])

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: '50vw',
                y: '40vh',
                scale: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: `calc(50vw + ${p.x}px)`,
                y: `calc(40vh + ${p.y}px)`,
                scale: [0, 1.5, 1],
                rotate: p.rotation,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'triangle' ? '0' : '2px',
                clipPath: p.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfettiBlast
