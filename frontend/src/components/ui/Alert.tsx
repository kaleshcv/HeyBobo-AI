import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType
  title?: string
  message: string
  onClose?: () => void
  closeable?: boolean
}

const typeStyles: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
  },
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  closeable = false,
  className,
  ...props
}) => {
  const style = typeStyles[type]

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        style.bg,
        style.border,
        style.text,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {closeable && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-navy-400 hover:text-gold-500"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
