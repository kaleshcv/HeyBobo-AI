import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── Sub-document: Question ──────────────────────────────
@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ default: 0 })
  correctIndex: number;

  @Prop({ default: '' })
  explanation: string;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

// ─── Main Schema: AIQuiz ──────────────────────────────────
@Schema({ timestamps: true, collection: 'ai_quizzes' })
export class AIQuiz extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  textbookId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [QuizQuestionSchema], default: [] })
  questions: QuizQuestion[];
}

export const AIQuizSchema = SchemaFactory.createForClass(AIQuiz);
AIQuizSchema.index({ userId: 1, textbookId: 1 });
AIQuizSchema.index({ userId: 1, createdAt: -1 });

// ─── Sub-document: Answer Map ────────────────────────────
@Schema({ _id: false })
export class AnswerEntry {
  @Prop({ required: true }) questionId: string;
  @Prop({ required: true }) answerIndex: number;
}
export const AnswerEntrySchema = SchemaFactory.createForClass(AnswerEntry);

// ─── Main Schema: AIQuizAttempt ──────────────────────────
@Schema({ timestamps: true, collection: 'ai_quiz_attempts' })
export class AIQuizAttempt extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  quizId: string;

  @Prop({ required: true })
  textbookId: string;

  /** answers stored as [{questionId, answerIndex}] for MongoDB compatibility */
  @Prop({ type: [AnswerEntrySchema], default: [] })
  answersArray: AnswerEntry[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  total: number;

  @Prop()
  completedAt: string;
}

export const AIQuizAttemptSchema = SchemaFactory.createForClass(AIQuizAttempt);
AIQuizAttemptSchema.index({ userId: 1, quizId: 1 });
AIQuizAttemptSchema.index({ userId: 1, createdAt: -1 });
