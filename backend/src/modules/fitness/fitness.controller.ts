import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { FitnessService } from './fitness.service';
import {
  CreateWorkoutSessionDto,
  UpdateDailyMetricsDto,
  SaveFitnessProfileDto,
  CreateFitnessGoalDto,
  QueryWorkoutSessionsDto,
} from './dto/fitness.dto';

@ApiTags('Fitness')
@Controller('fitness')
@Public()
export class FitnessController {
  private readonly logger = new Logger(FitnessController.name);

  constructor(private readonly fitnessService: FitnessService) {}

  private getUserId(headers: Record<string, string>): string {
    // Frontend uses local auth with user IDs like "user-test-1"
    return headers['x-user-id'] || 'anonymous';
  }

  // ═══════════ WORKOUT SESSIONS ═════════════════════════

  @Post('sessions')
  @ApiOperation({ summary: 'Create a workout session' })
  async createSession(
    @Body() dto: CreateWorkoutSessionDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const session = await this.fitnessService.createWorkoutSession(userId, dto);
    return { success: true, data: session };
  }

  @Post('sessions/bulk')
  @ApiOperation({ summary: 'Bulk create workout sessions' })
  async bulkCreateSessions(
    @Body() body: { sessions: CreateWorkoutSessionDto[] },
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.fitnessService.bulkCreateSessions(userId, body.sessions);
    return { success: true, data: result };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get workout sessions with filters' })
  async getSessions(
    @Query() query: QueryWorkoutSessionsDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.fitnessService.getWorkoutSessions(userId, query);
    return { success: true, data: result };
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a single workout session' })
  async getSession(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const session = await this.fitnessService.getWorkoutSession(userId, id);
    return { success: true, data: session };
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a workout session' })
  async deleteSession(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    await this.fitnessService.deleteWorkoutSession(userId, id);
    return { success: true };
  }

  // ═══════════ DAILY METRICS ════════════════════════════

  @Get('daily-metrics/:date')
  @ApiOperation({ summary: 'Get daily metrics for a specific date' })
  async getDailyMetrics(
    @Param('date') date: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const metrics = await this.fitnessService.getDailyMetrics(userId, date);
    return { success: true, data: metrics };
  }

  @Get('daily-metrics')
  @ApiOperation({ summary: 'Get daily metrics range' })
  async getDailyMetricsRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const metrics = await this.fitnessService.getDailyMetricsRange(userId, startDate, endDate);
    return { success: true, data: metrics };
  }

  @Put('daily-metrics')
  @ApiOperation({ summary: 'Update daily metrics' })
  async updateDailyMetrics(
    @Body() dto: UpdateDailyMetricsDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const metrics = await this.fitnessService.updateDailyMetrics(userId, dto);
    return { success: true, data: metrics };
  }

  // ═══════════ FITNESS PROFILE ══════════════════════════

  @Get('profile')
  @ApiOperation({ summary: 'Get fitness profile' })
  async getProfile(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const profile = await this.fitnessService.getFitnessProfile(userId);
    return { success: true, data: profile };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Save/update fitness profile' })
  async saveProfile(
    @Body() dto: SaveFitnessProfileDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const profile = await this.fitnessService.saveFitnessProfile(userId, dto);
    return { success: true, data: profile };
  }

  // ═══════════ FITNESS GOALS ════════════════════════════

  @Get('goals')
  @ApiOperation({ summary: 'Get fitness goals' })
  async getGoals(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const goals = await this.fitnessService.getGoals(userId);
    return { success: true, data: goals };
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a fitness goal' })
  async createGoal(
    @Body() dto: CreateFitnessGoalDto,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const goal = await this.fitnessService.createGoal(userId, dto);
    return { success: true, data: goal };
  }

  @Put('goals/:id/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  async updateGoalProgress(
    @Param('id') id: string,
    @Body() body: { current: number },
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    const goal = await this.fitnessService.updateGoalProgress(userId, id, body.current);
    return { success: true, data: goal };
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete a fitness goal' })
  async deleteGoal(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    await this.fitnessService.deleteGoal(userId, id);
    return { success: true };
  }

  // ═══════════ ANALYTICS / INSIGHTS ═════════════════════

  @Get('stats')
  @ApiOperation({ summary: 'Get workout statistics and insights' })
  async getStats(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const stats = await this.fitnessService.getWorkoutStats(userId);
    return { success: true, data: stats };
  }
}
