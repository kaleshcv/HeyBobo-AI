import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── AI Lesson record ────────────────────────────────────
@Schema({ timestamps: true, collection: 'ai_lessons' })
export class AILesson extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  textbookId: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop()
  completedAt: string;
}

export const AILessonSchema = SchemaFactory.createForClass(AILesson);
AILessonSchema.index({ userId: 1, textbookId: 1 });
AILessonSchema.index({ userId: 1, createdAt: -1 });

// ─── Sub-document: Weak Area ─────────────────────────────
@Schema({ _id: false })
export class WeakArea {
  @Prop({ required: true }) topic: string;
  @Prop({ default: '' }) weakness: string;
  @Prop({ default: '' }) action: string;
  @Prop({ enum: ['high', 'medium', 'low'], default: 'medium' }) priority: string;
}
export const WeakAreaSchema = SchemaFactory.createForClass(WeakArea);

// ─── Revision Plan ───────────────────────────────────────
@Schema({ timestamps: true, collection: 'ai_revision_plans' })
export class RevisionPlan extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  quizAttemptId: string;

  @Prop({ required: true })
  textbookId: string;

  @Prop({ required: true })
  quizTitle: string;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ type: [WeakAreaSchema], default: [] })
  weakAreas: WeakArea[];

  @Prop({ default: '' })
  summary: string;

  @Prop({ default: false })
  dismissed: boolean;
}

export const RevisionPlanSchema = SchemaFactory.createForClass(RevisionPlan);
RevisionPlanSchema.index({ userId: 1, createdAt: -1 });
