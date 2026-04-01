import { Controller, Post, Get, Delete, Patch, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createHash } from 'crypto';
import { createDiskStorage } from '@/common/storage/multer.config';
import { AIService } from '@/modules/ai/ai.service';
import { StudyPlanService } from '@/modules/ai/study-plan.service';
import { AITutorService } from '@/modules/ai/ai-tutor.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

/** Convert any string user ID to a valid 24-char hex ObjectId */
function toObjectId(id: string): string {
  if (/^[a-f\d]{24}$/i.test(id)) return id;
  return createHash('md5').update(id).digest('hex').substring(0, 24);
}

@ApiTags('AI')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AIController {
  constructor(
    private aiService: AIService,
    private studyPlanService: StudyPlanService,
    private aiTutorService: AITutorService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI tutor' })
  async chat(
    @CurrentUser('sub') userId: string,
    @Body() body: { message: string; conversationId?: string; courseId?: string; lessonId?: string; documentId?: string },
  ): Promise<any> {
    userId = toObjectId(userId);
    return this.aiService.chat(userId, body.conversationId || null, body.courseId || null, body.lessonId || null, body.message, body.documentId || null);
  }

  @Post('documents/upload')
  @ApiOperation({ summary: 'Upload a PDF document for AI context' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage('textbooks'),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      },
    }),
  )
  async uploadDocument(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    userId = toObjectId(userId);
    const document = await this.aiService.uploadDocument(userId, file);
    return {
      success: true,
      data: {
        id: document._id,
        filename: document.originalName,
        pageCount: document.pageCount,
        size: document.size,
        extractedText: document.extractedText,
        createdAt: (document as any).createdAt,
      },
    };
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get user uploaded documents' })
  async getDocuments(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const documents = await this.aiService.getUserDocuments(userId);
    return { success: true, data: documents };
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete an uploaded document' })
  async deleteDocument(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<any> {
    userId = toObjectId(userId);
    const deleted = await this.aiService.deleteDocument(id, userId);
    return { success: true, deleted };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    return this.aiService.getUserConversations(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation' })
  async getConversation(@Param('id') id: string): Promise<any> {
    return this.aiService.getConversation(id);
  }

  @Post('lesson/:lessonId/summarize')
  @ApiOperation({ summary: 'Generate lesson summary' })
  async summarizeLesson(@Param('lessonId') lessonId: string): Promise<any> {
    const summary = await this.aiService.generateLessonSummary(lessonId);
    return { summary };
  }

  @Post('lesson/:lessonId/revision-notes')
  @ApiOperation({ summary: 'Generate revision notes' })
  async generateRevisionNotes(@Param('lessonId') lessonId: string): Promise<any> {
    const notes = await this.aiService.generateRevisionNotes(lessonId);
    return { notes };
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get learning recommendations' })
  async getRecommendations(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const recommendations = await this.aiService.getRecommendations(userId);
    return { recommendations };
  }

  // ─── Study Plans ────────────────────────────────────────

  @Get('study-plans')
  @ApiOperation({ summary: 'Get all study plans for the current user' })
  async getStudyPlans(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const plans = await this.studyPlanService.getStudyPlans(userId);
    return { success: true, data: plans };
  }

  @Post('study-plans')
  @ApiOperation({ summary: 'Create or update a study plan' })
  async upsertStudyPlan(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      clientId: string;
      textbookId: string;
      title: string;
      totalDays: number;
      hoursPerDay: number;
      chapters: Array<{
        id: string;
        title: string;
        description: string;
        days: number;
        topics: string[];
        objectives: string[];
        completed: boolean;
      }>;
    },
  ): Promise<any> {
    userId = toObjectId(userId);
    const plan = await this.studyPlanService.upsertStudyPlan(userId, body);
    return { success: true, data: plan };
  }

  @Patch('study-plans/:clientId/chapters/:chapterId/toggle')
  @ApiOperation({ summary: 'Toggle chapter completion' })
  async toggleChapter(
    @CurrentUser('sub') userId: string,
    @Param('clientId') clientId: string,
    @Param('chapterId') chapterId: string,
  ): Promise<any> {
    userId = toObjectId(userId);
    const plan = await this.studyPlanService.toggleChapter(userId, clientId, chapterId);
    return { success: true, data: plan };
  }

  @Delete('study-plans/:clientId')
  @ApiOperation({ summary: 'Delete a study plan' })
  async deleteStudyPlan(
    @CurrentUser('sub') userId: string,
    @Param('clientId') clientId: string,
  ): Promise<any> {
    userId = toObjectId(userId);
    const deleted = await this.studyPlanService.deleteStudyPlan(userId, clientId);
    return { success: true, deleted };
  }

  // ─── Quizzes ────────────────────────────────────────────

  @Get('quizzes')
  @ApiOperation({ summary: 'Get all quizzes for the current user' })
  async getQuizzes(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.getQuizzes(userId);
    return { success: true, data };
  }

  @Post('quizzes')
  @ApiOperation({ summary: 'Create or update a quiz' })
  async upsertQuiz(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      clientId: string;
      textbookId: string;
      title: string;
      questions: Array<{ id: string; question: string; options: string[]; correctIndex: number; explanation: string }>;
    },
  ): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.upsertQuiz(userId, body);
    return { success: true, data };
  }

  @Delete('quizzes/:clientId')
  @ApiOperation({ summary: 'Delete a quiz' })
  async deleteQuiz(
    @CurrentUser('sub') userId: string,
    @Param('clientId') clientId: string,
  ): Promise<any> {
    userId = toObjectId(userId);
    const deleted = await this.aiTutorService.deleteQuiz(userId, clientId);
    return { success: true, deleted };
  }

  // ─── Quiz Attempts ───────────────────────────────────────

  @Get('quiz-attempts')
  @ApiOperation({ summary: 'Get all quiz attempts for the current user' })
  async getQuizAttempts(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.getAttempts(userId);
    return { success: true, data };
  }

  @Post('quiz-attempts')
  @ApiOperation({ summary: 'Save a quiz attempt' })
  async saveQuizAttempt(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      clientId: string;
      quizId: string;
      textbookId: string;
      answers: Record<string, number>;
      score: number;
      total: number;
      completedAt: string;
    },
  ): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.saveAttempt(userId, body);
    return { success: true, data };
  }

  // ─── AI Lessons ──────────────────────────────────────────

  @Get('lessons')
  @ApiOperation({ summary: 'Get all lessons for the current user' })
  async getLessons(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.getLessons(userId);
    return { success: true, data };
  }

  @Post('lessons')
  @ApiOperation({ summary: 'Save an AI lesson' })
  async saveLesson(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      clientId: string;
      textbookId: string;
      topic: string;
      content: string;
      completedAt: string;
    },
  ): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.saveLesson(userId, body);
    return { success: true, data };
  }

  // ─── Revision Plans ──────────────────────────────────────

  @Get('revision-plans')
  @ApiOperation({ summary: 'Get all revision plans for the current user' })
  async getRevisionPlans(@CurrentUser('sub') userId: string): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.getRevisionPlans(userId);
    return { success: true, data };
  }

  @Post('revision-plans')
  @ApiOperation({ summary: 'Save a revision plan' })
  async saveRevisionPlan(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      clientId: string;
      quizAttemptId: string;
      textbookId: string;
      quizTitle: string;
      score: number;
      total: number;
      weakAreas: Array<{ topic: string; weakness: string; action: string; priority: string }>;
      summary: string;
    },
  ): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.saveRevisionPlan(userId, body);
    return { success: true, data };
  }

  @Patch('revision-plans/:clientId/dismiss')
  @ApiOperation({ summary: 'Dismiss a revision plan' })
  async dismissRevisionPlan(
    @CurrentUser('sub') userId: string,
    @Param('clientId') clientId: string,
  ): Promise<any> {
    userId = toObjectId(userId);
    const data = await this.aiTutorService.dismissRevisionPlan(userId, clientId);
    return { success: true, data };
  }
}
