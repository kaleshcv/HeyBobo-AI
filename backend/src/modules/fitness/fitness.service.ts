import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WorkoutSession,
  DailyMetric,
  FitnessProfile,
  FitnessGoal,
} from './schemas/fitness.schema';
import {
  CreateWorkoutSessionDto,
  UpdateDailyMetricsDto,
  SaveFitnessProfileDto,
  CreateFitnessGoalDto,
  QueryWorkoutSessionsDto,
} from './dto/fitness.dto';

@Injectable()
export class FitnessService {
  private readonly logger = new Logger(FitnessService.name);

  constructor(
    @InjectModel(WorkoutSession.name) private workoutModel: Model<WorkoutSession>,
    @InjectModel(DailyMetric.name) private dailyMetricModel: Model<DailyMetric>,
    @InjectModel(FitnessProfile.name) private profileModel: Model<FitnessProfile>,
    @InjectModel(FitnessGoal.name) private goalModel: Model<FitnessGoal>,
  ) {}

  // ═══════════ WORKOUT SESSIONS ═════════════════════════

  async createWorkoutSession(userId: string, dto: CreateWorkoutSessionDto): Promise<WorkoutSession> {
    this.logger.log(`Creating workout session for user ${userId}: ${dto.name}`);
    const session = new this.workoutModel({ ...dto, userId, startedAt: new Date(dto.startedAt), endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined });
    const saved = await session.save();

    // Update daily metrics
    const date = new Date(dto.startedAt).toISOString().slice(0, 10);
    await this.incrementDailyMetrics(userId, date, {
      workoutsCompleted: 1,
      totalReps: dto.totalReps || 0,
      totalDurationSeconds: dto.durationSeconds || 0,
      caloriesBurned: dto.caloriesBurned || 0,
      activeMinutes: Math.round((dto.durationSeconds || 0) / 60),
    });

    return saved;
  }

  async getWorkoutSessions(userId: string, query: QueryWorkoutSessionsDto) {
    const filter: any = { userId };
    if (query.source) filter.source = query.source;
    if (query.category) filter.category = query.category;
    if (query.startDate || query.endDate) {
      filter.startedAt = {};
      if (query.startDate) filter.startedAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.startedAt.$lte = new Date(query.endDate);
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [sessions, total] = await Promise.all([
      this.workoutModel.find(filter).sort({ startedAt: -1 }).limit(limit).skip(skip).lean(),
      this.workoutModel.countDocuments(filter),
    ]);

    return { sessions, total, limit, skip };
  }

  async getWorkoutSession(userId: string, sessionId: string): Promise<WorkoutSession> {
    const session = await this.workoutModel.findOne({ _id: sessionId, userId }).lean();
    if (!session) throw new NotFoundException('Workout session not found');
    return session as any;
  }

  async deleteWorkoutSession(userId: string, sessionId: string): Promise<void> {
    const result = await this.workoutModel.deleteOne({ _id: sessionId, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Workout session not found');
  }

  // Bulk create for syncing frontend data
  async bulkCreateSessions(userId: string, sessions: CreateWorkoutSessionDto[]): Promise<{ created: number }> {
    if (sessions.length === 0) return { created: 0 };
    this.logger.log(`Bulk creating ${sessions.length} sessions for user ${userId}`);
    const docs = sessions.map((dto) => ({
      ...dto,
      userId,
      startedAt: new Date(dto.startedAt),
      endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
    }));
    const result = await this.workoutModel.insertMany(docs, { ordered: false });
    return { created: result.length };
  }

  // ═══════════ DAILY METRICS ════════════════════════════

  async getDailyMetrics(userId: string, date: string): Promise<DailyMetric> {
    let metrics = await this.dailyMetricModel.findOne({ userId, date }).lean();
    if (!metrics) {
      metrics = { userId, date, steps: 0, distanceKm: 0, caloriesBurned: 0, activeMinutes: 0, floorsClimbed: 0, workoutsCompleted: 0, totalReps: 0, totalDurationSeconds: 0 } as any;
    }
    return metrics as any;
  }

  async getDailyMetricsRange(userId: string, startDate: string, endDate: string): Promise<DailyMetric[]> {
    return this.dailyMetricModel.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }).lean() as any;
  }

  async updateDailyMetrics(userId: string, dto: UpdateDailyMetricsDto): Promise<DailyMetric> {
    const update: any = {};
    if (dto.steps !== undefined) update.steps = dto.steps;
    if (dto.distanceKm !== undefined) update.distanceKm = dto.distanceKm;
    if (dto.caloriesBurned !== undefined) update.caloriesBurned = dto.caloriesBurned;
    if (dto.activeMinutes !== undefined) update.activeMinutes = dto.activeMinutes;
    if (dto.floorsClimbed !== undefined) update.floorsClimbed = dto.floorsClimbed;

    return this.dailyMetricModel.findOneAndUpdate(
      { userId, date: dto.date },
      { $set: update },
      { upsert: true, new: true },
    ).lean() as any;
  }

  private async incrementDailyMetrics(userId: string, date: string, increments: Record<string, number>) {
    const inc: any = {};
    for (const [key, val] of Object.entries(increments)) {
      if (val > 0) inc[key] = val;
    }
    if (Object.keys(inc).length === 0) return;
    await this.dailyMetricModel.findOneAndUpdate(
      { userId, date },
      { $inc: inc },
      { upsert: true },
    );
  }

  // ═══════════ FITNESS PROFILE ══════════════════════════

  async getFitnessProfile(userId: string): Promise<FitnessProfile | null> {
    return this.profileModel.findOne({ userId }).lean() as any;
  }

  async saveFitnessProfile(userId: string, dto: SaveFitnessProfileDto): Promise<FitnessProfile> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      { $set: { ...dto, userId } },
      { upsert: true, new: true },
    ).lean() as any;
  }

  // ═══════════ FITNESS GOALS ════════════════════════════

  async getGoals(userId: string): Promise<FitnessGoal[]> {
    return this.goalModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  async createGoal(userId: string, dto: CreateFitnessGoalDto): Promise<FitnessGoal> {
    const goal = new this.goalModel({ ...dto, userId });
    return goal.save();
  }

  async updateGoalProgress(userId: string, goalId: string, current: number): Promise<FitnessGoal> {
    const goal = await this.goalModel.findOne({ _id: goalId, userId });
    if (!goal) throw new NotFoundException('Goal not found');
    goal.current = current;
    if (current >= goal.target && !goal.completed) {
      goal.completed = true;
      goal.completedAt = new Date();
    }
    return goal.save();
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const result = await this.goalModel.deleteOne({ _id: goalId, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Goal not found');
  }

  // ═══════════ ANALYTICS / INSIGHTS ═════════════════════

  async getWorkoutStats(userId: string) {
    const [
      totalSessions,
      totalBySource,
      totalByCategory,
      last30DaysMetrics,
      weeklyTrend,
      recentSessions,
    ] = await Promise.all([
      this.workoutModel.countDocuments({ userId }),

      this.workoutModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$source', count: { $sum: 1 }, totalReps: { $sum: '$totalReps' }, totalDuration: { $sum: '$durationSeconds' }, totalCalories: { $sum: '$caloriesBurned' } } },
      ]),

      this.workoutModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalReps: { $sum: '$totalReps' } } },
      ]),

      (() => {
        const end = new Date().toISOString().slice(0, 10);
        const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
        return this.dailyMetricModel.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }).lean();
      })(),

      this.workoutModel.aggregate([
        { $match: { userId, startedAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } }, count: { $sum: 1 }, reps: { $sum: '$totalReps' }, duration: { $sum: '$durationSeconds' }, calories: { $sum: '$caloriesBurned' } } },
        { $sort: { _id: 1 } },
      ]),

      this.workoutModel.find({ userId }).sort({ startedAt: -1 }).limit(10).lean(),
    ]);

    // Compute streaks
    const allDates = await this.workoutModel.aggregate([
      { $match: { userId } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } } } },
      { $sort: { _id: -1 } },
    ]);
    const dateSet = new Set(allDates.map((d: any) => d._id));
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10);
      if (dateSet.has(d)) currentStreak++;
      else break;
    }

    // Lifetime totals
    const lifetimeTotals = await this.workoutModel.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalReps: { $sum: '$totalReps' }, totalDuration: { $sum: '$durationSeconds' }, totalCalories: { $sum: '$caloriesBurned' }, totalSets: { $sum: '$totalSets' } } },
    ]);

    return {
      totalSessions,
      currentStreak,
      lifetimeTotals: lifetimeTotals[0] || { totalReps: 0, totalDuration: 0, totalCalories: 0, totalSets: 0 },
      bySource: totalBySource,
      byCategory: totalByCategory,
      last30DaysMetrics,
      weeklyTrend,
      recentSessions,
    };
  }
}
