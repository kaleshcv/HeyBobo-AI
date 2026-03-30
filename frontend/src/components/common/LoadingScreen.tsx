import React from 'react'
import { Spinner } from '@/components/ui/Spinner'

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #F8F6F1 0%, #fef9ef 100%)' }}>
      <Spinner size="lg" />
      <p className="mt-4 text-navy-500 font-medium">Loading...</p>
    </div>
  )
}
