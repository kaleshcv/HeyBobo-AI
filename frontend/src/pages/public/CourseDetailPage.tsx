import { useParams, useNavigate } from 'react-router-dom'
import { Star, Users, Clock, Award } from 'lucide-react'
import { useCourse } from '@/hooks/useCourses'
import { useEnrollCourse } from '@/hooks/useEnrollment'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { Spinner } from '@/components/ui/Spinner'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { formatCurrency, getInitials } from '@/lib/utils'

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading } = useCourse(slug || '')
  const enrollMutation = useEnrollCourse()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <p className="text-gray-600">Course not found</p>
          <Button onClick={() => navigate('/courses')} className="mt-6">
            Back to Courses
          </Button>
        </Card>
      </div>
    )
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">About This Course</h3>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">What You'll Learn</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.whatYouWillLearn?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold mt-1">✓</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Instructor</h3>
            <Card>
              <div className="flex items-center gap-4">
                <Avatar
                  initials={getInitials(course.instructor.firstName, course.instructor.lastName)}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{course.instructor.bio}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'curriculum',
      label: 'Curriculum',
      content: (
        <div className="space-y-4">
          {course.sections?.map((section) => (
            <Card key={section.id}>
              <h4 className="font-semibold text-gray-900">{section.title}</h4>
              <p className="text-sm text-gray-600 mt-2">
                {section.lessons?.length || 0} lessons
              </p>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: 'reviews',
      label: 'Reviews',
      content: (
        <div>
          <div className="flex items-center gap-6 mb-8">
            <div>
              <p className="text-4xl font-bold text-gray-900">{course.rating.toFixed(1)}</p>
              <Rating value={course.rating} readOnly showLabel={false} />
              <p className="text-sm text-gray-600 mt-2">{course.ratingCount} ratings</p>
            </div>
          </div>
          <p className="text-gray-600">Reviews coming soon</p>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{course.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star size={20} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{course.rating.toFixed(1)}</span>
              <span className="text-gray-600">({course.ratingCount} ratings)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={20} />
              <span>{course.enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span>{(course.totalDuration / 3600).toFixed(1)}h duration</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="info">{course.level}</Badge>
            <Badge variant="default">{course.category.name}</Badge>
            {course.certificateEnabled && (
              <Badge variant="success">
                <Award size={16} className="mr-1" />
                Certificate Included
              </Badge>
            )}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <Card className="lg:sticky lg:top-24 h-fit">
          <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
          <div className="text-3xl font-bold text-primary-600 mb-4">
            {course.price === 0 ? 'FREE' : formatCurrency(course.price)}
          </div>
          <Button
            fullWidth
            onClick={() => enrollMutation.mutate(course.id)}
            isLoading={enrollMutation.isPending}
          >
            Enroll Now
          </Button>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  )
}
