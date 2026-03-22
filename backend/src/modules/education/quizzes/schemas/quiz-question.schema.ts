import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum QuestionType {
  MCQ = 'mcq',
  MULTIPLE_ANSWER = 'multiple_answer',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

@Schema({ timestamps: true })
export class QuizQuestion extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Quiz' })
  quizId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(QuestionType),
  })
  type: QuestionType;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ type: [String], required: true })
  correctAnswers: string[];

  @Prop()
  explanation?: string;

  @Prop({ default: 1 })
  marks: number;

  @Prop({ required: true })
  order: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

QuizQuestionSchema.index({ quizId: 1, order: 1 });
