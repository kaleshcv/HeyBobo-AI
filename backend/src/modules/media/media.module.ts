import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaController } from '@/modules/media/media.controller';
import { MediaService } from '@/modules/media/media.service';
import { MuxService } from '@/modules/media/mux.service';
import { MediaAsset, MediaAssetSchema } from '@/modules/media/schemas/media-asset.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: MediaAsset.name, schema: MediaAssetSchema }])],
  controllers: [MediaController],
  providers: [MediaService, MuxService],
  exports: [MediaService, MuxService],
})
export class MediaModule {}
