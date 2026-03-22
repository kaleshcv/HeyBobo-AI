import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MediaService } from '@/modules/media/media.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { MediaType } from '@/modules/media/schemas/media-asset.schema';

@ApiTags('Media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Create direct upload URL' })
  async createUploadUrl(
    @Body() body: { type: MediaType },
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.mediaService.createDirectUploadUrl(userId, body.type);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get media asset' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.mediaService.getAssetWithPlaybackUrl(id);
  }

  @Post('mux-webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mux webhook handler' })
  async handleWebhook(@Body() event: any): Promise<any> {
    await this.mediaService.handleMuxWebhook(event);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media asset' })
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    await this.mediaService.delete(id, userId);
    return { message: 'Asset deleted' };
  }
}
