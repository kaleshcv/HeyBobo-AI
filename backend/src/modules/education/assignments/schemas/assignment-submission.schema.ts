import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

@Schema({ timestamps: true })
export class AssignmentSubmission extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Assignment' })
  assignmentId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  fileUrls: string[];

  @Prop()
  textResponse?: string;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop()
  grade?: number;

  @Prop()
  feedback?: string;

  @Prop()
  gradedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  gradedBy?: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(SubmissionStatus),
    default: SubmissionStatus.SUBMITTED,
  })
  status: SubmissionStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AssignmentSubmissionSchema = SchemaFactory.createForClass(AssignmentSubmission);

AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 });
AssignmentSubmissionSchema.index({ studentId: 1, submittedAt: -1 });
AssignmentSubmissionSchema.index({ status: 1, submittedAt: -1 });
