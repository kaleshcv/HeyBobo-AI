import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LessonProgress extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Lesson' })
  lessonId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ default: 0 })
  watchedSeconds: number;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  completedAt?: Date;

  @Prop()
  lastAccessedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);

LessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ courseId: 1, studentId: 1 });
LessonProgressSchema.index({ completed: 1, completedAt: -1 });
