import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from '@/modules/education/courses/courses.service';
import { CoursesController } from '@/modules/education/courses/courses.controller';
import { Course, CourseSchema } from '@/modules/education/courses/schemas/course.schema';
import { Section, SectionSchema } from '@/modules/education/sections/schemas/section.schema';
import { Lesson, LessonSchema } from '@/modules/education/lessons/schemas/lesson.schema';
import { LessonProgress, LessonProgressSchema } from '@/modules/education/lessons/schemas/lesson-progress.schema';
import { Enrollment, EnrollmentSchema } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { Quiz, QuizSchema } from '@/modules/education/quizzes/schemas/quiz.schema';
import { QuizQuestion, QuizQuestionSchema } from '@/modules/education/quizzes/schemas/quiz-question.schema';
import { QuizAttempt, QuizAttemptSchema } from '@/modules/education/quizzes/schemas/quiz-attempt.schema';
import { Assignment, AssignmentSchema } from '@/modules/education/assignments/schemas/assignment.schema';
import { AssignmentSubmission, AssignmentSubmissionSchema } from '@/modules/education/assignments/schemas/assignment-submission.schema';
import { Review, ReviewSchema } from '@/modules/education/reviews/schemas/review.schema';
import { Category, CategorySchema } from '@/modules/education/categories/schemas/category.schema';
import { CategoriesService } from '@/modules/education/categories/categories.service';
import { CategoriesController } from '@/modules/education/categories/categories.controller';
import { SectionsService } from '@/modules/education/sections/sections.service';
import { SectionsController } from '@/modules/education/sections/sections.controller';
import { LessonsService } from '@/modules/education/lessons/lessons.service';
import { LessonsController } from '@/modules/education/lessons/lessons.controller';
import { EnrollmentsService } from '@/modules/education/enrollments/enrollments.service';
import { EnrollmentsController } from '@/modules/education/enrollments/enrollments.controller';
import { QuizzesService } from '@/modules/education/quizzes/quizzes.service';
import { QuizzesController } from '@/modules/education/quizzes/quizzes.controller';
import { AssignmentsService } from '@/modules/education/assignments/assignments.service';
import { AssignmentsController } from '@/modules/education/assignments/assignments.controller';
import { ReviewsService } from '@/modules/education/reviews/reviews.service';
import { ReviewsController } from '@/modules/education/reviews/reviews.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizQuestion.name, schema: QuizQuestionSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: AssignmentSubmission.name, schema: AssignmentSubmissionSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [
    CoursesController,
    CategoriesController,
    SectionsController,
    LessonsController,
    EnrollmentsController,
    QuizzesController,
    AssignmentsController,
    ReviewsController,
  ],
  providers: [
    CoursesService,
    CategoriesService,
    SectionsService,
    LessonsService,
    EnrollmentsService,
    QuizzesService,
    AssignmentsService,
    ReviewsService,
  ],
  exports: [
    CoursesService,
    CategoriesService,
    SectionsService,
    LessonsService,
    EnrollmentsService,
    QuizzesService,
    AssignmentsService,
    ReviewsService,
  ],
})
export class EducationModule {}
