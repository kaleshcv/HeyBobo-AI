import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  Query,
  Logger,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { Public } from '../../common/decorators/public.decorator';
import { createDiskStorage } from '../../common/storage/multer.config';
import { GroomingService } from './grooming.service';

/** Convert any string user ID to a valid 24-char hex ObjectId */
function toObjectId(id: string): string {
  if (/^[a-f\d]{24}$/i.test(id)) return id;
  return createHash('md5').update(id).digest('hex').substring(0, 24);
}
import {
  SaveGroomingProfileDto,
  SaveRecommendationDto,
  QueryRecommendationsDto,
  SaveVisualAnalysisDto,
  QueryVisualAnalysisDto,
} from './dto/grooming.dto';

@ApiTags('Grooming')
@Controller('grooming')
@Public()
export class GroomingController {
  private readonly logger = new Logger(GroomingController.name);

  constructor(private readonly groomingService: GroomingService) {}

  private getUserId(headers: Record<string, string>): string {
    const raw = headers['x-user-id'] || 'anonymous';
    return toObjectId(raw);
  }

  // ═══════════ PROFILE ════════════════════════════════════

  @Get('profile')
  @ApiOperation({ summary: 'Get grooming profile' })
  async getProfile(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.groomingService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Save/update grooming profile' })
  async saveProfile(
    @Body() dto: SaveGroomingProfileDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.saveProfile(userId, dto);
  }

  // ═══════════ RECOMMENDATIONS ════════════════════════════

  @Post('recommendations')
  @ApiOperation({ summary: 'Save an AI-generated recommendation' })
  async saveRecommendation(
    @Body() dto: SaveRecommendationDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.saveRecommendation(userId, dto);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get recommendations (filter by type)' })
  async getRecommendations(
    @Query() query: QueryRecommendationsDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.getRecommendations(userId, query);
  }

  @Get('recommendations/latest/:type')
  @ApiOperation({ summary: 'Get latest recommendation by type' })
  async getLatestByType(
    @Param('type') type: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.getLatestByType(userId, type);
  }

  @Get('recommendations/:id')
  @ApiOperation({ summary: 'Get a single recommendation' })
  async getRecommendation(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.getRecommendation(userId, id);
  }

  @Patch('recommendations/:id/toggle-save')
  @ApiOperation({ summary: 'Toggle saved status of a recommendation' })
  async toggleSaved(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.toggleSaved(userId, id);
  }

  @Delete('recommendations/:id')
  @ApiOperation({ summary: 'Delete a recommendation' })
  async deleteRecommendation(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    await this.groomingService.deleteRecommendation(userId, id);
    return { deleted: true };
  }

  // ═══════════ VISUAL ANALYSIS ═════════════════════════════

  @Post('visual-analysis')
  @ApiOperation({ summary: 'Save a visual analysis result' })
  async saveVisualAnalysis(
    @Body() dto: SaveVisualAnalysisDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.saveVisualAnalysis(userId, dto);
  }

  @Get('visual-analysis')
  @ApiOperation({ summary: 'Get visual analyses (filter by type)' })
  async getVisualAnalyses(
    @Query() query: QueryVisualAnalysisDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.getVisualAnalyses(userId, query);
  }

  @Get('visual-analysis/progress/:type')
  @ApiOperation({ summary: 'Get progress timeline for a type' })
  async getProgressTimeline(
    @Param('type') type: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.getProgressTimeline(userId, type);
  }

  @Get('visual-analysis/:id')
  @ApiOperation({ summary: 'Get a single visual analysis' })
  async getVisualAnalysis(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    return this.groomingService.getVisualAnalysis(userId, id);
  }

  @Delete('visual-analysis/:id')
  @ApiOperation({ summary: 'Delete a visual analysis' })
  async deleteVisualAnalysis(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    await this.groomingService.deleteVisualAnalysis(userId, id);
    return { deleted: true };
  }

  // ═══════════ IMAGE UPLOAD (skin/hair/outfit analysis) ══

  @Post('analyze/upload')
  @ApiOperation({ summary: 'Upload an image for AI analysis' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', { storage: createDiskStorage('grooming') }))
  async uploadAnalysisImage(
    @UploadedFile() file: Express.Multer.File,
    @Headers() headers: Record<string, string>,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const userId = this.getUserId(headers);
    const imageUrl = `/uploads/grooming/${file.filename}`;
    return { imageUrl, filename: file.filename };
  }
}
