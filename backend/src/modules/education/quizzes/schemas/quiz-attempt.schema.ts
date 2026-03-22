import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false, timestamps: false })
export class QuizAnswer {
  @Prop({ required: true, type: Types.ObjectId })
  questionId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  answer: string[];
}

const QuizAnswerSchema = SchemaFactory.createForClass(QuizAnswer);

@Schema({ timestamps: true })
export class QuizAttempt extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Quiz' })
  quizId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: [QuizAnswerSchema], required: true })
  answers: QuizAnswer[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  totalMarks: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ required: true })
  timeTakenSeconds: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

QuizAttemptSchema.index({ quizId: 1, studentId: 1 });
QuizAttemptSchema.index({ studentId: 1, submittedAt: -1 });
QuizAttemptSchema.index({ passed: 1, submittedAt: -1 });
