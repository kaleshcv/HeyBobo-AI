import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

@Schema({ timestamps: true })
export class Enrollment extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  enrolledAt: Date;

  @Prop({
    required: true,
    enum: Object.values(EnrollmentStatus),
    default: EnrollmentStatus.ACTIVE,
    index: true,
  })
  status: EnrollmentStatus;

  @Prop({ default: 0 })
  progressPercent: number;

  @Prop()
  completedAt?: Date;

  @Prop()
  lastAccessedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Certificate' })
  certificateId?: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ courseId: 1, status: 1 });
EnrollmentSchema.index({ studentId: 1, status: 1 });
EnrollmentSchema.index({ completedAt: -1 });
