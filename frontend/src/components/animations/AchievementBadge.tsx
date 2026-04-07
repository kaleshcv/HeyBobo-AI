import { motion, AnimatePresence } from 'framer-motion'
import React, { useState, useEffect } from 'react'

interface AchievementBadgeProps {
  icon: string
  title: string
  description: string
  show: boolean
  onClose?: () => void
  autoHide?: number
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  title,
  description,
  show,
  onClose,
  autoHide = 4000,
}) => {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setVisible(true)
      if (autoHide > 0) {
        const t = setTimeout(() => {
          setVisible(false)
          onClose?.()
        }, autoHide)
        return () => clearTimeout(t)
      }
    }
  }, [show, autoHide, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-6 left-1/2 z-[9999] pointer-events-auto"
          initial={{ x: '-50%', y: -100, opacity: 0, scale: 0.8 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div
            className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700 rounded-2xl shadow-2xl cursor-pointer"
            onClick={() => {
              setVisible(false)
              onClose?.()
            }}
          >
            {/* Animated icon */}
            <motion.div
              className="text-4xl"
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: [0, 1.3, 1] }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              {icon}
            </motion.div>

            <div>
              <motion.div
                className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Achievement Unlocked!
              </motion.div>
              <motion.div
                className="font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                {title}
              </motion.div>
              <motion.div
                className="text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                {description}
              </motion.div>
            </div>

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 120,
                  y: (Math.random() - 0.5) * 80,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AchievementBadge
