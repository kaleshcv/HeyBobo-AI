import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Course } from '@/types/index'
import { formatCurrency } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface CourseCardProps {
  course: Course
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate()

  return (
    <Card
      hover
      onClick={() => navigate(`/courses/${course.slug}`)}
      className="overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.certificateEnabled && (
          <Badge variant="success" size="sm" className="absolute top-2 right-2">
            Certificate
          </Badge>
        )}
      </div>

      {/* Category and Rating */}
      <div className="flex items-start justify-between mb-3">
        <Badge variant="info" size="sm">
          {course.category.name}
        </Badge>
        <div className="flex items-center gap-1">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">
            {course.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-600">({course.ratingCount})</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
        {course.title}
      </h3>

      {/* Instructor */}
      <div className="flex items-center gap-2 mb-4">
        <Avatar
          initials={getInitials(course.instructor.firstName, course.instructor.lastName)}
          size="sm"
        />
        <span className="text-sm text-gray-600">
          {course.instructor.firstName} {course.instructor.lastName}
        </span>
      </div>

      {/* Course Info */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{(course.totalDuration / 3600).toFixed(1)}h</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{course.lessonCount} lessons</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between">
        {course.price === 0 ? (
          <Badge variant="success">FREE</Badge>
        ) : (
          <span className="font-bold text-primary-600">
            {formatCurrency(course.price)}
          </span>
        )}
        <span className="text-xs text-gray-500">
          {course.enrollmentCount} enrolled
        </span>
      </div>
    </Card>
  )
}
