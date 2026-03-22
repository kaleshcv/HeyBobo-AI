import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroomingProfile, GroomingProfileSchema, GroomingRecommendation, GroomingRecommendationSchema, VisualAnalysis, VisualAnalysisSchema } from './schemas/grooming.schema';
import { GroomingController } from './grooming.controller';
import { GroomingService } from './grooming.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroomingProfile.name, schema: GroomingProfileSchema },
      { name: GroomingRecommendation.name, schema: GroomingRecommendationSchema },
      { name: VisualAnalysis.name, schema: VisualAnalysisSchema },
    ]),
  ],
  controllers: [GroomingController],
  providers: [GroomingService],
  exports: [GroomingService],
})
export class GroomingModule {}
