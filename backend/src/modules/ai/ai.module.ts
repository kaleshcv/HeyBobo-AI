import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIController } from '@/modules/ai/ai.controller';
import { AIService } from '@/modules/ai/ai.service';
import { StudyPlanService } from '@/modules/ai/study-plan.service';
import { AITutorService } from '@/modules/ai/ai-tutor.service';
import { AIConversation, AIConversationSchema } from '@/modules/ai/schemas/ai-conversation.schema';
import { AIDocument, AIDocumentSchema } from '@/modules/ai/schemas/ai-document.schema';
import { StudyPlan, StudyPlanSchema } from '@/modules/ai/schemas/study-plan.schema';
import { Quiz, QuizSchema, QuizAttempt, QuizAttemptSchema } from '@/modules/ai/schemas/quiz.schema';
import { AILesson, AILessonSchema, RevisionPlan, RevisionPlanSchema } from '@/modules/ai/schemas/lesson.schema';
import { Lesson, LessonSchema } from '@/modules/education/lessons/schemas/lesson.schema';
import { Course, CourseSchema } from '@/modules/education/courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AIConversation.name, schema: AIConversationSchema },
      { name: AIDocument.name, schema: AIDocumentSchema },
      { name: StudyPlan.name, schema: StudyPlanSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: AILesson.name, schema: AILessonSchema },
      { name: RevisionPlan.name, schema: RevisionPlanSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [AIController],
  providers: [AIService, StudyPlanService, AITutorService],
  exports: [AIService, StudyPlanService, AITutorService],
})
export class AIModule {}
