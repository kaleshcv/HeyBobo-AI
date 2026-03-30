import React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-800 hover:from-gold-600 hover:to-gold-500 shadow-gold',
  secondary: 'bg-navy-800 text-gold-400 hover:bg-navy-700',
  outline: 'border-2 border-gold-300 text-navy-800 hover:border-gold-400 hover:bg-gold-50',
  ghost: 'text-navy-800 hover:bg-gold-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded',
  md: 'px-4 py-2.5 text-base font-medium rounded-lg',
  lg: 'px-6 py-3.5 text-lg font-semibold rounded-lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <span className="loader mr-2" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
