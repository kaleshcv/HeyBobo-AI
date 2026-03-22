import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  maxValue?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  count?: number
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export const Rating: React.FC<RatingProps> = ({
  value,
  maxValue = 5,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = true,
  count,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxValue }).map((_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= value
          const isHalf = starValue - 0.5 === value

          return (
            <button
              key={index}
              onClick={() => !readOnly && onChange?.(starValue)}
              onMouseEnter={() => !readOnly && onChange?.(starValue)}
              disabled={readOnly}
              className={cn(
                'transition-colors duration-200',
                !readOnly && 'hover:text-yellow-500 cursor-pointer'
              )}
            >
              <Star
                size={24}
                className={cn(
                  sizeStyles[size],
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isHalf
                      ? 'fill-yellow-400 text-yellow-400 opacity-50'
                      : 'text-gray-300'
                )}
              />
            </button>
          )
        })}
      </div>
      {showLabel && (
        <div className="text-sm text-gray-600">
          {value.toFixed(1)} {count && `(${count})`}
        </div>
      )}
    </div>
  )
}
