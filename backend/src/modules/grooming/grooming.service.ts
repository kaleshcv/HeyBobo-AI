import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroomingProfile } from './schemas/grooming.schema';
import { GroomingRecommendation, VisualAnalysis } from './schemas/grooming.schema';
import {
  SaveGroomingProfileDto,
  SaveRecommendationDto,
  QueryRecommendationsDto,
  SaveVisualAnalysisDto,
  QueryVisualAnalysisDto,
} from './dto/grooming.dto';

@Injectable()
export class GroomingService {
  private readonly logger = new Logger(GroomingService.name);

  constructor(
    @InjectModel(GroomingProfile.name) private profileModel: Model<GroomingProfile>,
    @InjectModel(GroomingRecommendation.name) private recommendationModel: Model<GroomingRecommendation>,
    @InjectModel(VisualAnalysis.name) private visualAnalysisModel: Model<VisualAnalysis>,
  ) {}

  // ═══════════ PROFILE ════════════════════════════════════

  async getProfile(userId: string) {
    return this.profileModel.findOne({ userId }).lean();
  }

  async saveProfile(userId: string, dto: SaveGroomingProfileDto) {
    return this.profileModel.findOneAndUpdate(
      { userId },
      { $set: { ...dto, userId } },
      { upsert: true, new: true },
    );
  }

  // ═══════════ RECOMMENDATIONS ════════════════════════════

  async saveRecommendation(userId: string, dto: SaveRecommendationDto) {
    const rec = new this.recommendationModel({ ...dto, userId });
    return rec.save();
  }

  async getRecommendations(userId: string, query: QueryRecommendationsDto) {
    const filter: any = { userId };
    if (query.type) filter.type = query.type;
    if (query.savedOnly) filter.isSaved = true;
    return this.recommendationModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async getRecommendation(userId: string, id: string) {
    const rec = await this.recommendationModel.findOne({ _id: id, userId }).lean();
    if (!rec) throw new NotFoundException('Recommendation not found');
    return rec;
  }

  async toggleSaved(userId: string, id: string) {
    const rec = await this.recommendationModel.findOne({ _id: id, userId });
    if (!rec) throw new NotFoundException('Recommendation not found');
    rec.isSaved = !rec.isSaved;
    return rec.save();
  }

  async deleteRecommendation(userId: string, id: string) {
    const rec = await this.recommendationModel.findOneAndDelete({ _id: id, userId });
    if (!rec) throw new NotFoundException('Recommendation not found');
  }

  async getLatestByType(userId: string, type: string) {
    return this.recommendationModel.findOne({ userId, type }).sort({ createdAt: -1 }).lean();
  }

  // ═══════════ VISUAL ANALYSIS ════════════════════════════

  async saveVisualAnalysis(userId: string, dto: SaveVisualAnalysisDto) {
    const analysis = new this.visualAnalysisModel({ ...dto, userId });
    return analysis.save();
  }

  async getVisualAnalyses(userId: string, query: QueryVisualAnalysisDto) {
    const filter: any = { userId };
    if (query.type) filter.type = query.type;
    return this.visualAnalysisModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async getVisualAnalysis(userId: string, id: string) {
    const analysis = await this.visualAnalysisModel.findOne({ _id: id, userId }).lean();
    if (!analysis) throw new NotFoundException('Visual analysis not found');
    return analysis;
  }

  async deleteVisualAnalysis(userId: string, id: string) {
    const analysis = await this.visualAnalysisModel.findOneAndDelete({ _id: id, userId });
    if (!analysis) throw new NotFoundException('Visual analysis not found');
  }

  async getProgressTimeline(userId: string, type: string) {
    return this.visualAnalysisModel
      .find({ userId, type })
      .sort({ createdAt: 1 })
      .select('overallScore metrics.name metrics.score summary createdAt imageUrl title tags')
      .lean();
  }
}
