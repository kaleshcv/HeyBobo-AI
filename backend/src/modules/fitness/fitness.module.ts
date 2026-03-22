import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import {
  WorkoutSession,
  WorkoutSessionSchema,
  DailyMetric,
  DailyMetricSchema,
  FitnessProfile,
  FitnessProfileSchema,
  FitnessGoal,
  FitnessGoalSchema,
} from './schemas/fitness.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkoutSession.name, schema: WorkoutSessionSchema },
      { name: DailyMetric.name, schema: DailyMetricSchema },
      { name: FitnessProfile.name, schema: FitnessProfileSchema },
      { name: FitnessGoal.name, schema: FitnessGoalSchema },
    ]),
  ],
  controllers: [FitnessController],
  providers: [FitnessService],
  exports: [FitnessService],
})
export class FitnessModule {}
