import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CollegeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class College extends Document {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  domain: string;

  @Prop()
  logoUrl?: string;

  @Prop({
    required: true,
    enum: Object.values(CollegeStatus),
    default: CollegeStatus.ACTIVE,
    index: true,
  })
  status: CollegeStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CollegeSchema = SchemaFactory.createForClass(College);

CollegeSchema.index({ domain: 1, status: 1 });
