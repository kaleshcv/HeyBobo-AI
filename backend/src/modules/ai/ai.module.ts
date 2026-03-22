import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIController } from '@/modules/ai/ai.controller';
import { AIService } from '@/modules/ai/ai.service';
import { AIConversation, AIConversationSchema } from '@/modules/ai/schemas/ai-conversation.schema';
import { AIDocument, AIDocumentSchema } from '@/modules/ai/schemas/ai-document.schema';
import { Lesson, LessonSchema } from '@/modules/education/lessons/schemas/lesson.schema';
import { Course, CourseSchema } from '@/modules/education/courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AIConversation.name, schema: AIConversationSchema },
      { name: AIDocument.name, schema: AIDocumentSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
