import { Controller, Post, Get, Delete, Body, Param, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Types } from 'mongoose';
import { createHash } from 'crypto';
import { createDiskStorage } from '@/common/storage/multer.config';
import { AIService } from '@/modules/ai/ai.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

/** Convert any string user ID to a valid 24-char hex ObjectId */
function toObjectId(id: string): string {
  if (/^[a-f\d]{24}$/i.test(id)) return id;
  return createHash('md5').update(id).digest('hex').substring(0, 24);
}

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

  @Public()
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
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    // Fall back to x-user-id header when JWT is not available (local auth mode)
    if (!userId) userId = req.headers['x-user-id'] as string || 'anonymous';
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

  @Public()
  @Get('documents')
  @ApiOperation({ summary: 'Get user uploaded documents' })
  async getDocuments(@CurrentUser('sub') userId: string, @Req() req: Request): Promise<any> {
    if (!userId) userId = req.headers['x-user-id'] as string || 'anonymous';
    userId = toObjectId(userId);
    const documents = await this.aiService.getUserDocuments(userId);
    return { success: true, data: documents };
  }

  @Public()
  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete an uploaded document' })
  async deleteDocument(
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<any> {
    if (!userId) userId = req.headers['x-user-id'] as string || 'anonymous';
    userId = toObjectId(userId);
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
