import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section' })
  sectionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: 60 })
  passPercentage: number;

  @Prop({ default: 3 })
  attemptLimit: number;

  @Prop({ default: 0 })
  timeLimitMinutes: number;

  @Prop({
    required: true,
    enum: Object.values(QuizStatus),
    default: QuizStatus.DRAFT,
  })
  status: QuizStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.index({ courseId: 1 });
QuizSchema.index({ lessonId: 1 });
QuizSchema.index({ status: 1 });
