import type { NavigatorScreenParams } from '@react-navigation/native'

// ── Auth Stack ────────────────────────────────────────────
export type AuthStackParamList = {
  Login:           undefined
  Register:        undefined
  ForgotPassword:  undefined
  ResetPassword:   { token: string }
  OAuthCallback:   { token?: string; refresh?: string }
}

// ── Learn Stack ────────────────────────────────────────────
export type LearnStackParamList = {
  CoursesList:   undefined
  CoursePlayer:  { courseId: string }
  LessonPlayer:  { courseId: string; lessonId: string }
  Quiz:          { courseId: string; quizId: string }
  Assignment:    { courseId: string; assignmentId: string }
  Certificates:  undefined
  Search:        undefined
}

// ── Health Stack ───────────────────────────────────────────
export type HealthStackParamList = {
  HealthHub:          undefined
  FitnessProfile:     undefined
  Workouts:           undefined
  LiveWorkout:        { planId?: string }
  ActivityTracking:   undefined
  Wearables:          undefined
  DietaryDashboard:   undefined
  MealLog:            { date?: string }
  NutritionTracker:   { date?: string }
  MealPlanner:        undefined
  DietaryProfile:     undefined
  DietaryGoals:       undefined
  Grocery:            undefined
  GroomingDashboard:  undefined
  VisualAnalysis:     undefined
  Recommendations:    undefined
}

// ── Teacher Stack ──────────────────────────────────────────
export type TeacherStackParamList = {
  TeacherDashboard:    undefined
  TeacherCourses:      undefined
  CourseBuilder:       { courseId?: string }
  SectionManager:      { courseId: string }
  LessonEditor:        { courseId: string; sectionId: string; lessonId: string }
  QuizBuilder:         { courseId: string; quizId: string }
  AssignmentManager:   { courseId: string }
  TeacherStudents:     { courseId: string }
  TeacherAnalytics:    { courseId: string }
}

// ── Admin Stack ────────────────────────────────────────────
export type AdminStackParamList = {
  AdminDashboard:    undefined
  AdminUsers:        undefined
  AdminTeachers:     undefined
  AdminCourses:      undefined
  AdminCategories:   undefined
  AdminAnalytics:    undefined
  AdminCertificates: undefined
}

// ── Profile Stack ──────────────────────────────────────────
export type ProfileStackParamList = {
  Profile:       undefined
  Settings:      undefined
  Notifications: undefined
  TeacherPortal: NavigatorScreenParams<TeacherStackParamList>
  AdminPortal:   NavigatorScreenParams<AdminStackParamList>
}

// ── Bottom Tabs ────────────────────────────────────────────
export type MainTabsParamList = {
  Home:    undefined
  Learn:   NavigatorScreenParams<LearnStackParamList>
  AITutor: undefined
  Health:  NavigatorScreenParams<HealthStackParamList>
  Account: NavigatorScreenParams<ProfileStackParamList>
}

// ── Root ───────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabsParamList>
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
