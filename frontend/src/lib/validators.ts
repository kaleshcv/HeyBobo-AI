import { z } from 'zod'

// Auth validators
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens allowed'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/\d/, 'Must contain a number')
      .regex(/[@$!%*?&]/, 'Must contain a special character (@$!%*?&)'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'teacher']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Profile validators
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

// Course validators
export const courseBasicInfoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().min(10, 'Subtitle must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().min(1, 'Language is required'),
  price: z.number().nonnegative('Price must be non-negative'),
  certificateEnabled: z.boolean().optional(),
  whatYouWillLearn: z.array(z.string()).min(1, 'Add at least one learning outcome'),
})

export const courseSettingsSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(50),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string(),
  price: z.number().nonnegative(),
  certificateEnabled: z.boolean(),
})

// Section validators
export const sectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  description: z.string().optional(),
})

// Lesson validators
export const lessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional(),
  type: z.enum(['video', 'article', 'quiz', 'assignment', 'practice']),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  duration: z.number().nonnegative(),
  isPreview: z.boolean().optional(),
})

// Quiz validators
export const quizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay']),
  options: z.array(
    z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ),
  explanation: z.string().optional(),
  points: z.number().positive(),
})

export const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100),
  timeLimit: z.number().nonnegative().optional(),
  attemptsAllowed: z.number().positive(),
  questions: z.array(quizQuestionSchema).min(1),
})

// Assignment validators
export const assignmentSchema = z.object({
  title: z.string().min(1, 'Assignment title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dueDate: z.string().optional(),
  maxScore: z.number().positive(),
})

// Review validators
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Review must be at least 20 characters'),
})

// AI Chat validators
export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
})

// Submission validators
export const assignmentSubmissionSchema = z.object({
  content: z.string().min(10, 'Submission must be at least 10 characters'),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CourseBasicInfoInput = z.infer<typeof courseBasicInfoSchema>
export type CourseSettingsInput = z.infer<typeof courseSettingsSchema>
export type SectionInput = z.infer<typeof sectionSchema>
export type LessonInput = z.infer<typeof lessonSchema>
export type QuizInput = z.infer<typeof quizSchema>
export type AssignmentInput = z.infer<typeof assignmentSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type AIChatInput = z.infer<typeof aiChatSchema>
export type AssignmentSubmissionInput = z.infer<typeof assignmentSubmissionSchema>
