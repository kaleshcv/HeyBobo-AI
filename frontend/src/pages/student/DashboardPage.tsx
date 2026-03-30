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
      <div className="relative overflow-hidden rounded-2xl p-8" style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)',
      }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-gold-500/15 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-navy-200 mt-2">Continue your learning journey</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-navy-500 mb-1">Courses Enrolled</p>
              <p className="text-3xl font-bold text-navy-800">{enrollments?.length || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
              <TrendingUp className="text-gold-500" size={20} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-navy-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-navy-800">{completed.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Award className="text-emerald-600" size={20} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-navy-500 mb-1">Hours Watched</p>
              <p className="text-3xl font-bold text-navy-800">24h</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
              <Clock className="text-gold-600" size={20} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-navy-500 mb-1">Learning Streak</p>
              <p className="text-3xl font-bold text-navy-800">7 days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Zap className="text-orange-500" size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-navy-800 mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inProgress.slice(0, 3).map((enrollment) => (
              <Card key={enrollment.id} hover>
                <h3 className="font-semibold text-navy-800 mb-4">
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
