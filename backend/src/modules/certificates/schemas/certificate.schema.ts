import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Certificate extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Enrollment' })
  enrollmentId: Types.ObjectId;

  @Prop()
  certificateUrl?: string;

  @Prop({ required: true, unique: true, index: true })
  verificationCode: string;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ required: true })
  studentName: string;

  @Prop({ required: true })
  courseName: string;

  @Prop()
  teacherName?: string;

  @Prop({ required: true })
  completionDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.index({ studentId: 1, courseId: 1 });
CertificateSchema.index({ verificationCode: 1 });
CertificateSchema.index({ issuedAt: -1 });
