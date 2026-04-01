import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { UserRole } from '@/types/index'
import { LoadingScreen } from '@/components/common/LoadingScreen'

// Layout imports
import RootLayout from '@/components/layout/RootLayout'
import AppShell from '@/components/layout/AppShell'
import StudentLayout from '@/components/layout/StudentLayout'
import TeacherLayout from '@/components/layout/TeacherLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Public pages (lazy loaded)
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))

// Auth pages (lazy loaded)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const OAuthCallbackPage = lazy(() => import('@/pages/auth/OAuthCallbackPage'))

// Student pages (lazy loaded)
const StudentDashboardPage = lazy(() => import('@/pages/student/DashboardPage'))
const MyLearningPage = lazy(() => import('@/pages/student/MyLearningPage'))
const LessonPlayerPage = lazy(() => import('@/pages/student/LessonPlayerPage'))
const QuizPage = lazy(() => import('@/pages/student/QuizPage'))
const AssignmentPage = lazy(() => import('@/pages/student/AssignmentPage'))
const AiTutorPage = lazy(() => import('@/pages/student/AiTutorPage'))
const CertificatesPage = lazy(() => import('@/pages/student/CertificatesPage'))
const StudentProfilePage = lazy(() => import('@/pages/student/ProfilePage'))
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage'))
const SearchPage = lazy(() => import('@/pages/student/SearchPage'))

// Teacher pages (lazy loaded)
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/DashboardPage'))
const TeacherCoursesPage = lazy(() => import('@/pages/teacher/CoursesPage'))
const CourseBuilderPage = lazy(() => import('@/pages/teacher/CourseBuilderPage'))
const SectionManagerPage = lazy(() => import('@/pages/teacher/SectionManagerPage'))
const LessonEditorPage = lazy(() => import('@/pages/teacher/LessonEditorPage'))
const QuizBuilderPage = lazy(() => import('@/pages/teacher/QuizBuilderPage'))
const AssignmentManagerPage = lazy(() => import('@/pages/teacher/AssignmentManagerPage'))
const TeacherStudentsPage = lazy(() => import('@/pages/teacher/StudentsPage'))
const TeacherAnalyticsPage = lazy(() => import('@/pages/teacher/AnalyticsPage'))
const TeacherOnboardingPage = lazy(() => import('@/pages/teacher/OnboardingPage'))

// Admin pages (lazy loaded)
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AdminTeachersPage = lazy(() => import('@/pages/admin/TeachersPage'))
const AdminCoursesPage = lazy(() => import('@/pages/admin/CoursesPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'))
const AdminCertificatesPage = lazy(() => import('@/pages/admin/CertificatesPage'))
const AdminDatabasePage = lazy(() => import('@/pages/admin/DatabasePage'))

// App module pages (lazy loaded)
const EducationPage = lazy(() => import('@/pages/app/EducationPage'))
const CoursePlayerPage = lazy(() => import('@/pages/app/CoursePlayerPage'))
const AITutorAppPage = lazy(() => import('@/pages/app/AITutorPage'))
const CoursesListPage = lazy(() => import('@/pages/app/CoursesListPage'))
const GroupsPage = lazy(() => import('@/pages/app/GroupsPage'))
const GroupDetailPage = lazy(() => import('@/pages/app/GroupDetailPage'))
const MeetingsPage = lazy(() => import('@/pages/app/MeetingsPage'))

// Health pages (lazy loaded)
const HealthFitnessPage = lazy(() => import('@/pages/app/HealthFitnessPage'))
const FitnessProfilePage = lazy(() => import('@/pages/app/FitnessProfilePage'))
const ActivityTrackingPage = lazy(() => import('@/pages/app/ActivityTrackingPage'))
const WearablesPage = lazy(() => import('@/pages/app/WearablesPage'))
const InjuryPage = lazy(() => import('@/pages/app/InjuryPage'))

// Fitness pages (lazy loaded)
const FitnessDashboardPage = lazy(() => import('@/pages/app/FitnessDashboardPage'))
const WorkoutsPage = lazy(() => import('@/pages/app/WorkoutsPage'))
const HealthGamePage = lazy(() => import('@/pages/app/HealthGamePage'))

// Dietary pages (lazy loaded)
const DietaryDashboardPage = lazy(() => import('@/pages/app/dietary/DietaryDashboardPage'))
const DietaryMealLogPage = lazy(() => import('@/pages/app/dietary/MealLogPage'))
const NutritionTrackerPage = lazy(() => import('@/pages/app/dietary/NutritionTrackerPage'))
const DietaryProfilePage = lazy(() => import('@/pages/app/dietary/DietaryProfilePage'))
const DietaryGoalsPage = lazy(() => import('@/pages/app/dietary/DietaryGoalsPage'))
const MealPlannerPage = lazy(() => import('@/pages/app/dietary/MealPlannerPage'))
const GroceryPage = lazy(() => import('@/pages/app/dietary/GroceryPage'))
const ShoppingPage = lazy(() => import('@/pages/app/ShoppingPage'))
const SmartShoppingListsPage = lazy(() => import('@/pages/app/shopping/SmartShoppingListsPage'))
const CampusMarketplacePage = lazy(() => import('@/pages/app/shopping/CampusMarketplacePage'))
const BudgetExpensesPage = lazy(() => import('@/pages/app/shopping/BudgetExpensesPage'))
const OrdersReviewsPage = lazy(() => import('@/pages/app/shopping/OrdersReviewsPage'))
const GroomingPage = lazy(() => import('@/pages/app/GroomingPage'))
const GroomingDashboardPage = lazy(() => import('@/pages/app/grooming/GroomingDashboardPage'))
const GroomingRecommendationPage = lazy(() => import('@/pages/app/grooming/GroomingRecommendationPage'))
const VisualAnalysisPage = lazy(() => import('@/pages/app/grooming/VisualAnalysisPage'))
const AIBrainPage = lazy(() => import('@/pages/app/AIBrainPage'))

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },

  // Auth routes
  {
    path: 'auth',
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'reset-password/:token',
        element: (
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'callback',
        element: (
          <SuspenseWrapper>
            <OAuthCallbackPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Student routes
  {
    path: 'student',
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <StudentDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'my-learning',
        element: (
          <SuspenseWrapper>
            <MyLearningPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/learn/:lessonId',
        element: (
          <SuspenseWrapper>
            <LessonPlayerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/quiz/:quizId',
        element: (
          <SuspenseWrapper>
            <QuizPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/assignment/:assignmentId',
        element: (
          <SuspenseWrapper>
            <AssignmentPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'ai-tutor',
        element: (
          <SuspenseWrapper>
            <AiTutorPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'certificates',
        element: (
          <SuspenseWrapper>
            <CertificatesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <StudentProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'notifications',
        element: (
          <SuspenseWrapper>
            <NotificationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'search',
        element: (
          <SuspenseWrapper>
            <SearchPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Teacher routes
  {
    path: 'teacher',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={[UserRole.TEACHER, UserRole.CREATOR]}>
          <TeacherLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <TeacherDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses',
        element: (
          <SuspenseWrapper>
            <TeacherCoursesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/new',
        element: (
          <SuspenseWrapper>
            <CourseBuilderPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/edit',
        element: (
          <SuspenseWrapper>
            <CourseBuilderPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/sections',
        element: (
          <SuspenseWrapper>
            <SectionManagerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/sections/:sectionId/lessons/:lessonId/edit',
        element: (
          <SuspenseWrapper>
            <LessonEditorPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/quiz/:quizId/edit',
        element: (
          <SuspenseWrapper>
            <QuizBuilderPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/assignments',
        element: (
          <SuspenseWrapper>
            <AssignmentManagerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/students',
        element: (
          <SuspenseWrapper>
            <TeacherStudentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses/:courseId/analytics',
        element: (
          <SuspenseWrapper>
            <TeacherAnalyticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <SuspenseWrapper>
            <TeacherOnboardingPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Admin routes
  {
    path: 'admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={UserRole.ADMIN}>
          <AdminLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <AdminDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <SuspenseWrapper>
            <AdminUsersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'teachers',
        element: (
          <SuspenseWrapper>
            <AdminTeachersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses',
        element: (
          <SuspenseWrapper>
            <AdminCoursesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories',
        element: (
          <SuspenseWrapper>
            <AdminCategoriesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'analytics',
        element: (
          <SuspenseWrapper>
            <AdminAnalyticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'certificates',
        element: (
          <SuspenseWrapper>
            <AdminCertificatesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'database',
        element: (
          <SuspenseWrapper>
            <AdminDatabasePage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // App shell (Claude.ai-style unified UI)
  {
    path: 'app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <AIBrainPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'ai-brain',
        element: (
          <SuspenseWrapper>
            <AIBrainPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'education',
        element: (
          <SuspenseWrapper>
            <EducationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'education/:courseId',
        element: (
          <SuspenseWrapper>
            <CoursePlayerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'courses',
        element: (
          <SuspenseWrapper>
            <CoursesListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'ai-tutor',
        element: (
          <SuspenseWrapper>
            <AITutorAppPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'groups',
        element: (
          <SuspenseWrapper>
            <GroupsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'groups/:groupId',
        element: (
          <SuspenseWrapper>
            <GroupDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'meetings',
        element: (
          <SuspenseWrapper>
            <MeetingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health',
        element: (
          <SuspenseWrapper>
            <HealthFitnessPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health/fitness-profile',
        element: (
          <SuspenseWrapper>
            <FitnessProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health/activity-tracking',
        element: (
          <SuspenseWrapper>
            <ActivityTrackingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health/wearables',
        element: (
          <SuspenseWrapper>
            <WearablesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health/injury',
        element: (
          <SuspenseWrapper>
            <InjuryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health/workouts',
        element: (
          <SuspenseWrapper>
            <WorkoutsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'health/game',
        element: (
          <SuspenseWrapper>
            <HealthGamePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'fitness',
        element: (
          <SuspenseWrapper>
            <FitnessDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'fitness/workouts',
        element: (
          <SuspenseWrapper>
            <WorkoutsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary',
        element: <Navigate to="/app/dietary/dashboard" replace />,
      },
      {
        path: 'dietary/dashboard',
        element: (
          <SuspenseWrapper>
            <DietaryDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary/meals',
        element: (
          <SuspenseWrapper>
            <DietaryMealLogPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary/meal-planner',
        element: (
          <SuspenseWrapper>
            <MealPlannerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary/nutrition',
        element: (
          <SuspenseWrapper>
            <NutritionTrackerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary/profile',
        element: (
          <SuspenseWrapper>
            <DietaryProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary/goals',
        element: (
          <SuspenseWrapper>
            <DietaryGoalsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dietary/grocery',
        element: (
          <SuspenseWrapper>
            <GroceryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shopping',
        element: (
          <SuspenseWrapper>
            <ShoppingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shopping/lists',
        element: (
          <SuspenseWrapper>
            <SmartShoppingListsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shopping/marketplace',
        element: (
          <SuspenseWrapper>
            <CampusMarketplacePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shopping/budget',
        element: (
          <SuspenseWrapper>
            <BudgetExpensesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shopping/orders',
        element: (
          <SuspenseWrapper>
            <OrdersReviewsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'grooming',
        element: (
          <SuspenseWrapper>
            <GroomingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'grooming/dashboard',
        element: (
          <SuspenseWrapper>
            <GroomingDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'grooming/recommendations',
        element: (
          <SuspenseWrapper>
            <GroomingRecommendationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'grooming/visual-analysis',
        element: (
          <SuspenseWrapper>
            <VisualAnalysisPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
])
