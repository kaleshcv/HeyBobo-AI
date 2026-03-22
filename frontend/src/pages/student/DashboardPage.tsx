import { useNavigate } from 'react-router-dom'
import { Zap, Award, Clock, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CourseProgress } from '@/components/common/CourseProgress'
import { useAuth } from '@/hooks/useAuth'
import { useMyEnrollments } from '@/hooks/useEnrollment'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: enrollments } = useMyEnrollments()

  const inProgress = enrollments?.filter((e) => e.status === 'active') || []
  const completed = enrollments?.filter((e) => e.status === 'completed') || []

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Courses Enrolled</p>
              <p className="text-3xl font-bold text-gray-900">{enrollments?.length || 0}</p>
            </div>
            <TrendingUp className="text-primary-600" size={24} />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completed.length}</p>
            </div>
            <Award className="text-green-600" size={24} />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hours Watched</p>
              <p className="text-3xl font-bold text-gray-900">24h</p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Learning Streak</p>
              <p className="text-3xl font-bold text-gray-900">7 days</p>
            </div>
            <Zap className="text-orange-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inProgress.slice(0, 3).map((enrollment) => (
              <Card key={enrollment.id} hover>
                <h3 className="font-semibold text-gray-900 mb-4">
                  {enrollment.course?.title}
                </h3>
                <CourseProgress
                  percentage={enrollment.progressPercentage}
                  variant="linear"
                  showLabel={false}
                />
                <Button
                  variant="outline"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate(`/student/my-learning`)}
                >
                  Continue
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
