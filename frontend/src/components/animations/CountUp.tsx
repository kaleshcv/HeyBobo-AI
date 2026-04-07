import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import React, { useEffect, useRef } from 'react'

interface CountUpProps {
  from?: number
  to: number
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
  decimals?: number
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 1.5,
  delay = 0,
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0,
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)
  const rounded = useTransform(motionValue, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(motionValue, to, {
        duration,
        ease: 'easeOut',
      })
      return () => controls.stop()
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [motionValue, to, duration, delay])

  return (
    <motion.span
      ref={nodeRef}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  )
}

export default CountUp
