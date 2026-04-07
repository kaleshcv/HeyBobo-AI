import { motion } from 'framer-motion'
import React from 'react'

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

const containerVariants = (staggerDelay: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
})

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.08,
}) => (
  <motion.div
    variants={containerVariants(staggerDelay)}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
)

export const StaggerItem: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <motion.div variants={staggerItemVariants} className={className}>
    {children}
  </motion.div>
)

export default StaggerContainer
