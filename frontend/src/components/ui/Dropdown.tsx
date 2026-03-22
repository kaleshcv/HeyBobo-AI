import React, { useRef, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface DropdownItem {
  id: string
  label: string
  onClick?: () => void
  divider?: boolean
  danger?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50',
            'min-w-48',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.id} className="h-px bg-gray-200 my-1" />
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors',
                  item.danger && 'text-red-600 hover:bg-red-50'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
