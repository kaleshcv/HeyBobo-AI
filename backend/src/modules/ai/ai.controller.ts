import { Controller, Post, Get, Delete, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createDiskStorage } from '@/common/storage/multer.config';
import { AIService } from '@/modules/ai/ai.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI tutor' })
  async chat(
    @CurrentUser('sub') userId: string,
    @Body() body: { message: string; conversationId?: string; courseId?: string; lessonId?: string; documentId?: string },
  ): Promise<any> {
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
    const documents = await this.aiService.getUserDocuments(userId);
    return { success: true, data: documents };
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete an uploaded document' })
  async deleteDocument(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<any> {
    const deleted = await this.aiService.deleteDocument(id, userId);
    return { success: true, deleted };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@CurrentUser('sub') userId: string): Promise<any> {
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
    const recommendations = await this.aiService.getRecommendations(userId);
    return { recommendations };
  }
}
