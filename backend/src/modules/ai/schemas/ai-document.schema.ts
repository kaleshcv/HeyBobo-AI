import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AIDocument extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  extractedText: string;

  @Prop({ default: 0 })
  pageCount: number;

  @Prop()
  filePath: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AIDocumentSchema = SchemaFactory.createForClass(AIDocument);

AIDocumentSchema.index({ studentId: 1, createdAt: -1 });
