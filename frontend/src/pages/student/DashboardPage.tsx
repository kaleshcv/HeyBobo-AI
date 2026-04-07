import { useNavigate } from 'react-router-dom'
import { Zap, Award, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CourseProgress } from '@/components/common/CourseProgress'
import { useAuth } from '@/hooks/useAuth'
import { useMyEnrollments } from '@/hooks/useEnrollment'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
  CountUp,
  XPBar,
  StreakFlame,
} from '@/components/animations'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: enrollments } = useMyEnrollments()
  const { language } = useUIStore()

  const inProgress = enrollments?.filter((e) => e.status === 'active') || []
  const completed = enrollments?.filter((e) => e.status === 'completed') || []

  // Gamification calculations
  const coursesCount = enrollments?.length || 0
  const lessonsEstimate = coursesCount * 5 // estimate
  const totalXP = (completed.length * 50) + (lessonsEstimate * 10)
  const currentLevel = Math.floor(totalXP / 100) + 1
  const streakDays = 7 // placeholder

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-gold-500/15 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-white">
                {t(language, 'welcomeBackUser')}, {user?.firstName}
              </h1>
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                👋
              </motion.span>
            </div>
            <p className="text-navy-200 mt-2">{t(language, 'continuelearningJourney')}</p>
          </div>
        </motion.div>

        {/* XP Bar and Level */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <XPBar currentXP={totalXP % 100} maxXP={100} level={currentLevel} />
          </div>
        </div>

        {/* Stats Grid */}
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StaggerItem>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(10, 22, 40, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-navy-500 mb-1">{t(language, 'coursesEnrolledLabel')}</p>
                      <p className="text-3xl font-bold text-navy-800">
                        <CountUp to={enrollments?.length || 0} />
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                      <TrendingUp className="text-gold-500" size={20} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(10, 22, 40, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-navy-500 mb-1">{t(language, 'completedTab')}</p>
                      <p className="text-3xl font-bold text-navy-800">
                        <CountUp to={completed.length} />
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Award className="text-emerald-600" size={20} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(10, 22, 40, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-navy-500 mb-1">{t(language, 'hoursWatchedLabel')}</p>
                      <p className="text-3xl font-bold text-navy-800">
                        <CountUp to={24} duration={2} />h
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                      <Clock className="text-gold-600" size={20} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(10, 22, 40, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-navy-500 mb-1">{t(language, 'learningStreakLabel')}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-navy-800">
                          <CountUp to={streakDays} />
                        </p>
                        <StreakFlame streak={streakDays} />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Zap className="text-orange-500" size={20} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </StaggerItem>
          </div>
        </StaggerContainer>

        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-navy-800 mb-6">{t(language, 'continueLearning')}</h2>
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {inProgress.slice(0, 3).map((enrollment) => (
                  <StaggerItem key={enrollment.id}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(10, 22, 40, 0.15)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <Card hover>
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
                          {t(language, 'continueBtn')}
                        </Button>
                      </Card>
                    </motion.div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  )
}
