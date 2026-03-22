import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblings?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
}) => {
  const renderPageNumbers = () => {
    const pages: (number | string)[] = []

    const leftSibling = Math.max(currentPage - siblings, 1)
    const rightSibling = Math.min(currentPage + siblings, totalPages)

    if (leftSibling > 1) {
      pages.push(1)
      if (leftSibling > 2) pages.push('...')
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i)
    }

    if (rightSibling < totalPages) {
      if (rightSibling < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} />
      </Button>

      {renderPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={cn(
            'w-10 h-10 rounded-lg font-medium transition-colors',
            page === currentPage
              ? 'bg-primary-600 text-white'
              : page === '...'
                ? 'cursor-default'
                : 'hover:bg-gray-100 text-gray-900'
          )}
        >
          {page}
        </button>
      ))}

      <Button
        variant="outline"
        size="md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  )
}
