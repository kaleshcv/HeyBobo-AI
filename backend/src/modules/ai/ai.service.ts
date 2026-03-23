import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFParse } from 'pdf-parse';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { AIConversation } from '@/modules/ai/schemas/ai-conversation.schema';
import { AIDocument } from '@/modules/ai/schemas/ai-document.schema';
import { Lesson } from '@/modules/education/lessons/schemas/lesson.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    @InjectModel(AIConversation.name) private conversationModel: Model<AIConversation>,
    @InjectModel(AIDocument.name) private documentModel: Model<AIDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async chat(studentId: string, conversationId: string | null, courseId: string | null, lessonId: string | null, message: string, documentId: string | null = null): Promise<any> {
    if (!this.genAI) {
      this.logger.warn('Gemini not configured');
      return {
        conversation: null,
        message: null,
      };
    }

    // Find existing conversation by ID, or create a new one
    let conversation: AIConversation | null = null;
    if (conversationId) {
      conversation = await this.conversationModel.findById(conversationId);
    }

    if (!conversation) {
      conversation = await this.conversationModel.create({
        studentId: new Types.ObjectId(studentId),
        courseId: courseId ? new Types.ObjectId(courseId) : undefined,
        lessonId: lessonId ? new Types.ObjectId(lessonId) : undefined,
        messages: [],
        tokenCount: 0,
      });
    }

    // Build context
    let context = '';
    if (lessonId) {
      const lesson = await this.lessonModel.findById(lessonId);
      if (lesson) {
        context = `Lesson: ${lesson.title}\n${lesson.description || ''}\n${lesson.transcript || lesson.content || ''}`;
      }
    }

    // Add document context if provided
    if (documentId) {
      const document = await this.documentModel.findOne({
        _id: new Types.ObjectId(documentId),
        studentId: new Types.ObjectId(studentId),
      });
      if (document) {
        // Truncate to ~100k chars to stay within Gemini context limits
        const docText = document.extractedText.substring(0, 100000);
        context += `\n\nUploaded Document: "${document.originalName}"\n--- Document Content ---\n${docText}\n--- End Document ---`;
      }
    }

    // Build conversation history
    const conversationHistory = conversation.messages
      .slice(-10)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // Get AI response
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an educational tutor. Answer questions based on the provided context. If a document is provided, focus your answers on its content and help the student understand the material.

Context:
${context}

Previous conversation:
${conversationHistory}

Student: ${message}

Provide a helpful, educational response. When referencing the document, cite specific sections or concepts from it.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Save conversation
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      conversation.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      await conversation.save();

      const assistantMsg = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        createdAt: new Date().toISOString(),
      };

      return {
        conversation: {
          id: conversation._id,
          messages: conversation.messages.map((m, i) => ({
            id: `msg-${i}`,
            role: m.role,
            content: m.content,
            createdAt: m.timestamp?.toISOString() || new Date().toISOString(),
          })),
        },
        message: assistantMsg,
      };
    } catch (error) {
      this.logger.error('Gemini API error', error);
      throw error;
    }
  }

  async generateLessonSummary(lessonId: string): Promise<string> {
    if (!this.genAI) {
      this.logger.warn('Gemini not configured');
      return '';
    }

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) return '';

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Create a concise summary of this lesson for a student to study:

Title: ${lesson.title}
Description: ${lesson.description}
Content: ${lesson.transcript || lesson.content}

Provide key points in bullet format.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Failed to generate summary', error);
      return '';
    }
  }

  async generateRevisionNotes(lessonId: string): Promise<string> {
    if (!this.genAI) {
      this.logger.warn('Gemini not configured');
      return '';
    }

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) return '';

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Create detailed revision notes for studying this lesson:

Title: ${lesson.title}
Content: ${lesson.transcript || lesson.content}

Include:
1. Main concepts
2. Key definitions
3. Important formulas/ideas
4. Practice questions`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Failed to generate revision notes', error);
      return '';
    }
  }

  async getRecommendations(studentId: string): Promise<string> {
    if (!this.genAI) {
      this.logger.warn('Gemini not configured');
      return '';
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Based on educational best practices, provide personalized learning recommendations for a student.

Include:
1. Study techniques
2. Time management tips
3. Resource suggestions`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Failed to generate recommendations', error);
      return '';
    }
  }

  async getConversation(conversationId: string): Promise<AIConversation | null> {
    return this.conversationModel.findById(conversationId);
  }

  async getUserConversations(studentId: string): Promise<AIConversation[]> {
    return this.conversationModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .sort({ updatedAt: -1 });
  }

  // --- Document management ---

  async uploadDocument(
    studentId: string,
    file: Express.Multer.File,
  ): Promise<AIDocument> {
    const fileData = readFileSync(file.path);
    const parser = new PDFParse({ data: new Uint8Array(fileData) });
    const info = await parser.getInfo();
    const textResult = await parser.getText();
    await parser.destroy();

    const document = await this.documentModel.create({
      studentId: new Types.ObjectId(studentId),
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extractedText: textResult.text,
      pageCount: info.total || 0,
      filePath: `/uploads/documents/${file.filename}`,
    });

    this.logger.log(`Uploaded document: ${file.originalname} (${info.total} pages, ${textResult.text.length} chars)`);

    return document;
  }

  async getUserDocuments(studentId: string): Promise<AIDocument[]> {
    return this.documentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 });
  }

  async getDocument(documentId: string, studentId: string): Promise<AIDocument | null> {
    return this.documentModel.findOne({
      _id: new Types.ObjectId(documentId),
      studentId: new Types.ObjectId(studentId),
    });
  }

  async deleteDocument(documentId: string, studentId: string): Promise<boolean> {
    const doc = await this.documentModel.findOne({
      _id: new Types.ObjectId(documentId),
      studentId: new Types.ObjectId(studentId),
    });
    if (!doc) return false;

    // Remove file from disk
    if (doc.filePath) {
      const fullPath = join(process.cwd(), doc.filePath);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }
    }

    const result = await this.documentModel.deleteOne({ _id: doc._id });
    return result.deletedCount > 0;
  }
}
