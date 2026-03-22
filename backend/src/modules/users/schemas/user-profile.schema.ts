import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false, timestamps: false })
export class NotificationPreferences {
  @Prop({ default: true })
  push: boolean;

  @Prop({ default: true })
  email: boolean;

  @Prop({ default: false })
  sms: boolean;
}

const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferences);

@Schema({ timestamps: true })
export class UserProfile extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'College' })
  collegeId?: Types.ObjectId;

  @Prop()
  bio?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: [String], default: [] })
  learningGoals: string[];

  @Prop({ default: 'en' })
  preferredLanguage: string;

  @Prop({ type: NotificationPreferencesSchema, default: () => ({}) })
  notificationPreferences: NotificationPreferences;

  @Prop({ type: Object, default: {} })
  socialLinks: Record<string, string>;

  @Prop()
  timezone?: string;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop()
  lastActivityAt?: Date;

  @Prop({ default: 0 })
  totalWatchTimeMinutes: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

UserProfileSchema.index({ userId: 1 });
UserProfileSchema.index({ collegeId: 1 });
UserProfileSchema.index({ currentStreak: -1 });
