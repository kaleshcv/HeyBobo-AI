import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
}

export enum MediaStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

@Schema({ _id: false, timestamps: false })
export class MediaMetadata {
  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  duration?: number;

  @Prop()
  size?: number;
}

const MediaMetadataSchema = SchemaFactory.createForClass(MediaMetadata);

@Schema({ timestamps: true })
export class MediaAsset extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(MediaType),
  })
  type: MediaType;

  @Prop({ required: true })
  url: string;

  @Prop()
  muxAssetId?: string;

  @Prop()
  muxPlaybackId?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;

  @Prop()
  originalFilename?: string;

  @Prop({
    required: true,
    enum: Object.values(MediaStatus),
    default: MediaStatus.UPLOADING,
  })
  status: MediaStatus;

  @Prop({ type: MediaMetadataSchema })
  metadata?: MediaMetadata;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

MediaAssetSchema.index({ ownerId: 1, type: 1 });
MediaAssetSchema.index({ status: 1, createdAt: -1 });
MediaAssetSchema.index({ muxAssetId: 1 });
