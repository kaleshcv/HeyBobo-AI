import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { CourseProgress } from '@/components/common/CourseProgress'
import { useMyEnrollments } from '@/hooks/useEnrollment'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MyLearningPage() {
  const navigate = useNavigate()
  const { data: enrollments = [] } = useMyEnrollments()

  const active = enrollments.filter((e) => e.status === 'active')
  const completed = enrollments.filter((e) => e.status === 'completed')

  const EnrollmentCard = ({ enrollment }: any) => (
    <Card hover className="flex items-start justify-between p-6 mb-4">
      <div className="flex-1">
        <h3 className="font-semibold text-navy-800 mb-2">
          {enrollment.course?.title}
        </h3>
        <CourseProgress
          percentage={enrollment.progressPercentage}
          variant="linear"
          showLabel={true}
        />
      </div>
      <Button
        variant="outline"
        onClick={() => navigate(`/student/my-learning`)}
        className="ml-4"
      >
        Continue
      </Button>
    </Card>
  )

  const tabs = [
    {
      id: 'all',
      label: 'All Courses',
      content: (
        <div>
          {enrollments.length > 0 ? (
            enrollments.map((e) => <EnrollmentCard key={e.id} enrollment={e} />)
          ) : (
            <EmptyState
              icon={<BookOpen size={48} />}
              title="No courses yet"
              description="Start learning by enrolling in a course"
              actionLabel="Browse Courses"
              onAction={() => navigate('/courses')}
            />
          )}
        </div>
      ),
    },
    {
      id: 'inprogress',
      label: 'In Progress',
      content: (
        <div>
          {active.length > 0 ? (
            active.map((e) => <EnrollmentCard key={e.id} enrollment={e} />)
          ) : (
            <EmptyState
              icon={<BookOpen size={48} />}
              title="No courses in progress"
              description="Enroll in a course to get started"
              actionLabel="Browse Courses"
              onAction={() => navigate('/courses')}
            />
          )}
        </div>
      ),
    },
    {
      id: 'completed',
      label: 'Completed',
      content: (
        <div>
          {completed.length > 0 ? (
            completed.map((e) => <EnrollmentCard key={e.id} enrollment={e} />)
          ) : (
            <EmptyState
              icon={<BookOpen size={48} />}
              title="No completed courses"
              description="Complete a course to see it here"
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-navy-800">My Learning</h1>
        <p className="text-navy-500 mt-2">Track your progress and continue learning</p>
      </div>

      <Tabs tabs={tabs} defaultTab="all" />
    </div>
  )
}
