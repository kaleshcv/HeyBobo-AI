import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  review: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  helpful: Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
ReviewSchema.index({ courseId: 1, rating: -1 });
ReviewSchema.index({ createdAt: -1 });
