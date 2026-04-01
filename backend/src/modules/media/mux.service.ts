import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mux from '@mux/mux-node';

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  private mux: any;

  constructor(private configService: ConfigService) {
    const tokenId = this.configService.get<string>('mux.tokenId');
    const tokenSecret = this.configService.get<string>('mux.tokenSecret');

    if (tokenId && tokenSecret) {
      this.mux = new Mux({
        tokenId,
        tokenSecret,
      });
    }
  }

  async createDirectUpload(): Promise<{ url: string; assetId: string }> {
    if (!this.mux) {
      this.logger.warn('Mux not configured — video upload unavailable');
      throw new ServiceUnavailableException('Video hosting service is not configured');
    }

    try {
      const upload = await this.mux.video.uploads.create({
        new_asset_settings: {
          playback_policy: ['public'],
        },
      });

      return {
        url: upload.url,
        assetId: upload.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Mux upload', error);
      throw error;
    }
  }

  async getAsset(assetId: string): Promise<any> {
    if (!this.mux) {
      return { id: assetId, status: 'ready' };
    }

    try {
      return await this.mux.video.assets.get(assetId);
    } catch (error) {
      this.logger.error(`Failed to get Mux asset ${assetId}`, error);
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    if (!this.mux) {
      return;
    }

    try {
      await this.mux.video.assets.delete(assetId);
      this.logger.log(`Asset deleted from Mux: ${assetId}`);
    } catch (error) {
      this.logger.error(`Failed to delete Mux asset ${assetId}`, error);
      throw error;
    }
  }

  getPlaybackUrl(playbackId: string): string {
    return `https://image.mux.com/${playbackId}/animated.gif`;
  }
}
