import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizAttempt } from './schemas/quiz.schema';
import { AILesson, RevisionPlan } from './schemas/lesson.schema';

@Injectable()
export class AITutorService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttempt>,
    @InjectModel(AILesson.name) private lessonModel: Model<AILesson>,
    @InjectModel(RevisionPlan.name) private revisionModel: Model<RevisionPlan>,
  ) {}

  // ═══════════ QUIZZES ═══════════════════════════════════

  async upsertQuiz(userId: string, dto: {
    clientId: string; textbookId: string; title: string;
    questions: Array<{ id: string; question: string; options: string[]; correctIndex: number; explanation: string }>;
  }): Promise<Quiz> {
    const existing = await this.quizModel.findOne({ userId, clientId: dto.clientId });
    if (existing) { Object.assign(existing, dto); return existing.save(); }
    return this.quizModel.create({ userId, ...dto });
  }

  async getQuizzes(userId: string): Promise<Quiz[]> {
    return this.quizModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  async deleteQuiz(userId: string, clientId: string): Promise<boolean> {
    const r = await this.quizModel.deleteOne({ userId, clientId });
    return r.deletedCount > 0;
  }

  // ═══════════ QUIZ ATTEMPTS ══════════════════════════════

  async saveAttempt(userId: string, dto: {
    clientId: string; quizId: string; textbookId: string;
    answers: Record<string, number>; score: number; total: number; completedAt: string;
  }): Promise<QuizAttempt> {
    const answersArray = Object.entries(dto.answers).map(([questionId, answerIndex]) => ({ questionId, answerIndex }));
    const existing = await this.attemptModel.findOne({ userId, clientId: dto.clientId });
    if (existing) return existing;
    return this.attemptModel.create({ userId, ...dto, answersArray });
  }

  async getAttempts(userId: string): Promise<QuizAttempt[]> {
    const docs = await this.attemptModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      answers: Object.fromEntries((d.answersArray ?? []).map((e: any) => [e.questionId, e.answerIndex])),
    })) as any;
  }

  // ═══════════ LESSONS ════════════════════════════════════

  async saveLesson(userId: string, dto: {
    clientId: string; textbookId: string; topic: string; content: string; completedAt: string;
  }): Promise<AILesson> {
    const existing = await this.lessonModel.findOne({ userId, clientId: dto.clientId });
    if (existing) return existing;
    return this.lessonModel.create({ userId, ...dto });
  }

  async getLessons(userId: string): Promise<AILesson[]> {
    return this.lessonModel.find({ userId }).sort({ createdAt: -1 }).select('-content').lean() as any;
  }

  // ═══════════ REVISION PLANS ═════════════════════════════

  async saveRevisionPlan(userId: string, dto: {
    clientId: string; quizAttemptId: string; textbookId: string; quizTitle: string;
    score: number; total: number;
    weakAreas: Array<{ topic: string; weakness: string; action: string; priority: string }>;
    summary: string;
  }): Promise<RevisionPlan> {
    const existing = await this.revisionModel.findOne({ userId, clientId: dto.clientId });
    if (existing) return existing;
    return this.revisionModel.create({ userId, ...dto, dismissed: false });
  }

  async getRevisionPlans(userId: string): Promise<RevisionPlan[]> {
    return this.revisionModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  async dismissRevisionPlan(userId: string, clientId: string): Promise<RevisionPlan> {
    const plan = await this.revisionModel.findOne({ userId, clientId });
    if (!plan) throw new NotFoundException('Revision plan not found');
    plan.dismissed = true;
    return plan.save();
  }
}
