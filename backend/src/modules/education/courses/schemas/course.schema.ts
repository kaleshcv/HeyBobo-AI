import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription?: string;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(CourseLevel),
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Prop({ default: 'en' })
  language: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: false })
  isFree: boolean;

  @Prop()
  thumbnailUrl?: string;

  @Prop()
  promoVideoUrl?: string;

  @Prop({
    required: true,
    enum: Object.values(CourseStatus),
    default: CourseStatus.DRAFT,
    index: true,
  })
  status: CourseStatus;

  @Prop({ default: 0 })
  durationMinutes: number;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: true })
  certificateEnabled: boolean;

  @Prop({ default: 0 })
  ratingAvg: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ default: 0 })
  enrollmentCount: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  learningOutcomes: string[];

  @Prop({ type: [String], default: [] })
  prerequisites: string[];

  @Prop()
  rejectionReason?: string;

  @Prop()
  publishedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ slug: 1 });
CourseSchema.index({ status: 1, publishedAt: -1 });
CourseSchema.index({ teacherId: 1, status: 1 });
CourseSchema.index({ categoryId: 1, status: 1 });
CourseSchema.index({ ratingAvg: -1 });
CourseSchema.index({ enrollmentCount: -1 });
