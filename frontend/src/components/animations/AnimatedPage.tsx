import { motion } from 'framer-motion'
import React from 'react'

interface AnimatedPageProps {
  children: React.ReactNode
  className?: string
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
)

export default AnimatedPage
