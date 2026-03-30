import React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeButton?: boolean
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        role="presentation"
      />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-xl max-w-full mx-4 border border-gold-100/30',
          'transform transition-all duration-300',
          sizeStyles[size]
        )}
      >
        {(title || closeButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gold-100/30">
            {title && <h2 className="text-lg font-semibold text-navy-800">{title}</h2>}
            {closeButton && (
              <button
                onClick={onClose}
                className="ml-auto text-navy-400 hover:text-gold-500 transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
