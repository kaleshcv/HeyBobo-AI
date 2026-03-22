import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  PDF = 'pdf',
  MIXED = 'mixed',
}

export enum LessonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Schema({ _id: false, timestamps: false })
export class Resource {
  @Prop()
  title: string;

  @Prop()
  url: string;

  @Prop()
  type: string;
}

const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Section' })
  sectionId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: Object.values(LessonType),
    default: LessonType.VIDEO,
  })
  type: LessonType;

  @Prop()
  videoAssetId?: string;

  @Prop()
  videoPlaybackId?: string;

  @Prop()
  transcript?: string;

  @Prop()
  content?: string;

  @Prop({ type: [ResourceSchema], default: [] })
  resources: Resource[];

  @Prop({ default: 0 })
  durationSeconds: number;

  @Prop({ required: true })
  order: number;

  @Prop({ default: false })
  isPreview: boolean;

  @Prop({
    required: true,
    enum: Object.values(LessonStatus),
    default: LessonStatus.DRAFT,
  })
  status: LessonStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ courseId: 1, sectionId: 1, order: 1 });
LessonSchema.index({ sectionId: 1, order: 1 });
