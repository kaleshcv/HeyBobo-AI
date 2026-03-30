import React from 'react'
import { CircularProgress } from '@/components/ui/Progress'
import { Progress } from '@/components/ui/Progress'

interface CourseProgressProps {
  percentage: number
  courseTitle?: string
  showLabel?: boolean
  variant?: 'circular' | 'linear'
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
  percentage,
  courseTitle,
  showLabel = true,
  variant = 'circular',
}) => {
  if (variant === 'circular') {
    return (
      <div className="text-center">
        <CircularProgress value={percentage} size={120} color="#2563eb">
          <div>
            <p className="text-2xl font-bold text-navy-800">{Math.round(percentage)}%</p>
            {courseTitle && (
              <p className="text-xs text-navy-500 max-w-xs mt-2">{courseTitle}</p>
            )}
          </div>
        </CircularProgress>
      </div>
    )
  }

  return (
    <div className="w-full">
      {courseTitle && (
        <h3 className="font-semibold text-navy-800 mb-2">{courseTitle}</h3>
      )}
      <Progress value={percentage} showLabel={showLabel} />
      <p className="text-xs text-navy-500 mt-2">
        {Math.round(percentage)}% complete
      </p>
    </div>
  )
}
