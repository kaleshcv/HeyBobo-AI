import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── Sub-document: Chapter ──────────────────────────────
@Schema({ _id: false })
export class StudyPlanChapter {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 1 })
  days: number;

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ type: [String], default: [] })
  objectives: string[];

  @Prop({ default: false })
  completed: boolean;
}

export const StudyPlanChapterSchema = SchemaFactory.createForClass(StudyPlanChapter);

// ─── Main Schema: StudyPlan ─────────────────────────────
@Schema({ timestamps: true, collection: 'study_plans' })
export class StudyPlan extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  /** Client-side plan ID (for idempotent upsert) */
  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  textbookId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: 14 })
  totalDays: number;

  @Prop({ default: 3 })
  hoursPerDay: number;

  @Prop({ type: [StudyPlanChapterSchema], default: [] })
  chapters: StudyPlanChapter[];
}

export const StudyPlanSchema = SchemaFactory.createForClass(StudyPlan);

StudyPlanSchema.index({ userId: 1, createdAt: -1 });
StudyPlanSchema.index({ userId: 1, textbookId: 1 });
