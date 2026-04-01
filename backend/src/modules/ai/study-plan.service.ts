import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudyPlan } from './schemas/study-plan.schema';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectModel(StudyPlan.name) private studyPlanModel: Model<StudyPlan>,
  ) {}

  /** Upsert a study plan (create or replace by clientId) */
  async upsertStudyPlan(userId: string, dto: {
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
  }): Promise<StudyPlan> {
    const existing = await this.studyPlanModel.findOne({ userId, clientId: dto.clientId });
    if (existing) {
      Object.assign(existing, dto);
      return existing.save();
    }
    const plan = new this.studyPlanModel({ userId, ...dto });
    return plan.save();
  }

  /** Get all study plans for a user */
  async getStudyPlans(userId: string): Promise<StudyPlan[]> {
    return this.studyPlanModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  /** Toggle a chapter's completed status */
  async toggleChapter(userId: string, planClientId: string, chapterId: string): Promise<StudyPlan> {
    const plan = await this.studyPlanModel.findOne({ userId, clientId: planClientId });
    if (!plan) throw new NotFoundException('Study plan not found');

    const chapter = plan.chapters.find((c) => c.id === chapterId);
    if (!chapter) throw new NotFoundException('Chapter not found');

    chapter.completed = !chapter.completed;
    return plan.save();
  }

  /** Delete a study plan */
  async deleteStudyPlan(userId: string, clientId: string): Promise<boolean> {
    const result = await this.studyPlanModel.deleteOne({ userId, clientId });
    return result.deletedCount > 0;
  }
}
