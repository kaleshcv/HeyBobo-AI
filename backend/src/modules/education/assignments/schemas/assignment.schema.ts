import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SubmissionType {
  FILE = 'file',
  TEXT = 'text',
  BOTH = 'both',
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Schema({ timestamps: true })
export class Assignment extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section' })
  sectionId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  instructions?: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    required: true,
    enum: Object.values(SubmissionType),
    default: SubmissionType.FILE,
  })
  submissionType: SubmissionType;

  @Prop({ default: 10485760 })
  maxFileSize: number;

  @Prop({ type: [String], default: [] })
  allowedFileTypes: string[];

  @Prop({
    required: true,
    enum: Object.values(AssignmentStatus),
    default: AssignmentStatus.DRAFT,
  })
  status: AssignmentStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

AssignmentSchema.index({ courseId: 1 });
AssignmentSchema.index({ lessonId: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ status: 1 });
