import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { CourseProgress } from '@/components/common/CourseProgress'
import { useMyEnrollments } from '@/hooks/useEnrollment'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedPage } from '@/components/animations'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'

export default function MyLearningPage() {
  const navigate = useNavigate()
  const { data: enrollments = [] } = useMyEnrollments()
  const { language } = useUIStore()

  const active = enrollments.filter((e) => e.status === 'active')
  const completed = enrollments.filter((e) => e.status === 'completed')

  const EnrollmentCard = ({ enrollment }: any) => (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
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
          {t(language, 'continueBtn')}
        </Button>
      </Card>
    </motion.div>
  )

  const tabs = [
    {
      id: 'all',
      label: t(language, 'allCoursesTab'),
      content: (
        <div>
          {enrollments.length > 0 ? (
            <div>
              {enrollments.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                >
                  <EnrollmentCard enrollment={e} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={48} />}
              title={t(language, 'noCoursesYetMsg')}
              description={t(language, 'startByEnrolling')}
              actionLabel={t(language, 'browseCoursesBtn')}
              onAction={() => navigate('/courses')}
            />
          )}
        </div>
      ),
    },
    {
      id: 'inprogress',
      label: t(language, 'inProgressTab'),
      content: (
        <div>
          {active.length > 0 ? (
            <div>
              {active.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                >
                  <EnrollmentCard enrollment={e} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={48} />}
              title={t(language, 'noInProgress')}
              description={t(language, 'startByEnrolling')}
              actionLabel={t(language, 'browseCoursesBtn')}
              onAction={() => navigate('/courses')}
            />
          )}
        </div>
      ),
    },
    {
      id: 'completed',
      label: t(language, 'completedTab'),
      content: (
        <div>
          {completed.length > 0 ? (
            <div>
              {completed.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                >
                  <EnrollmentCard enrollment={e} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={48} />}
              title={t(language, 'noCompleted')}
              description={t(language, 'startByEnrolling')}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-navy-800">{t(language, 'myLearningTitle')}</h1>
          <p className="text-navy-500 mt-2">{t(language, 'trackProgress')}</p>
        </div>

        <Tabs tabs={tabs} defaultTab="all" />
      </div>
    </AnimatedPage>
  )
}
