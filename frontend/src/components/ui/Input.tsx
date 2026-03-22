import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-3.5 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'placeholder:text-gray-400 text-gray-900',
              'transition-colors duration-200',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
