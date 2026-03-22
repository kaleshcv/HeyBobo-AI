import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaAsset, MediaStatus, MediaType } from '@/modules/media/schemas/media-asset.schema';
import { MuxService } from '@/modules/media/mux.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectModel(MediaAsset.name) private mediaAssetModel: Model<MediaAsset>,
    private muxService: MuxService,
    private configService: ConfigService,
  ) {}

  async createDirectUploadUrl(ownerId: string, mediaType: MediaType): Promise<any> {
    const uploadData = await this.muxService.createDirectUpload();

    const mediaAsset = await this.mediaAssetModel.create({
      ownerId: new Types.ObjectId(ownerId),
      type: mediaType,
      url: uploadData.url,
      muxAssetId: uploadData.assetId,
      status: MediaStatus.UPLOADING,
      originalFilename: `upload-${Date.now()}`,
    });

    this.logger.log(`Upload URL created for asset: ${mediaAsset._id}`);

    return {
      assetId: mediaAsset._id,
      uploadUrl: uploadData.url,
      muxAssetId: uploadData.assetId,
    };
  }

  async findOne(id: string): Promise<MediaAsset> {
    const asset = await this.mediaAssetModel.findById(id);
    if (!asset) throw new NotFoundException('Media asset not found');
    return asset;
  }

  async getAssetWithPlaybackUrl(id: string): Promise<any> {
    const asset = await this.findOne(id);

    if (asset.muxPlaybackId) {
      const playbackUrl = this.muxService.getPlaybackUrl(asset.muxPlaybackId);
      return {
        ...asset.toObject(),
        playbackUrl,
      };
    }

    return asset;
  }

  async handleMuxWebhook(event: any): Promise<void> {
    const { data } = event;

    if (event.type === 'video.asset.ready') {
      const asset = await this.mediaAssetModel.findOne({
        muxAssetId: data.id,
      });

      if (asset) {
        asset.status = MediaStatus.READY;
        asset.muxPlaybackId = data.playback_ids?.[0]?.id;
        await asset.save();

        this.logger.log(`Asset ready: ${asset._id}`);
      }
    }

    if (event.type === 'video.asset.errored') {
      const asset = await this.mediaAssetModel.findOne({
        muxAssetId: data.id,
      });

      if (asset) {
        asset.status = MediaStatus.ERROR;
        await asset.save();

        this.logger.error(`Asset error: ${asset._id}`);
      }
    }
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const asset = await this.findOne(id);

    if (asset.ownerId.toString() !== ownerId) {
      throw new Error('You can only delete your own assets');
    }

    if (asset.muxAssetId) {
      await this.muxService.deleteAsset(asset.muxAssetId);
    }

    await this.mediaAssetModel.deleteOne({ _id: id });
    this.logger.log(`Asset deleted: ${id}`);
  }
}
