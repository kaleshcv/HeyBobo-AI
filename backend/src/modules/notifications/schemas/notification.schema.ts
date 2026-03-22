import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  LESSON_REMINDER = 'lesson_reminder',
  ASSIGNMENT_DUE = 'assignment_due',
  QUIZ_RESULT = 'quiz_result',
  COURSE_COMPLETED = 'course_completed',
  CERTIFICATE_ISSUED = 'certificate_issued',
  NEW_ENROLLMENT = 'new_enrollment',
  SYSTEM = 'system',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(NotificationType),
    index: true,
  })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({
    required: true,
    enum: Object.values(NotificationChannel),
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });
