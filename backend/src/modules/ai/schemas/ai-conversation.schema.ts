import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false, timestamps: false })
export class Message {
  @Prop({
    required: true,
    enum: ['user', 'assistant'],
  })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  timestamp: Date;
}

const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class AIConversation extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];

  @Prop({ default: 0 })
  tokenCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AIConversationSchema = SchemaFactory.createForClass(AIConversation);

AIConversationSchema.index({ studentId: 1, courseId: 1 });
AIConversationSchema.index({ studentId: 1, createdAt: -1 });
AIConversationSchema.index({ lessonId: 1 });
