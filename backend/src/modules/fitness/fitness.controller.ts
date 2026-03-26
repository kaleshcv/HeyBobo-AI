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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FitnessService } from './fitness.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateWorkoutSessionDto,
  UpdateDailyMetricsDto,
  SaveFitnessProfileDto,
  CreateFitnessGoalDto,
  QueryWorkoutSessionsDto,
} from './dto/fitness.dto';

@ApiTags('Fitness')
@ApiBearerAuth('access-token')
@Controller('fitness')
export class FitnessController {
  private readonly logger = new Logger(FitnessController.name);

  constructor(private readonly fitnessService: FitnessService) {}

  // ═══════════ WORKOUT SESSIONS ═════════════════════════

  @Post('sessions')
  @ApiOperation({ summary: 'Create a workout session' })
  async createSession(
    @Body() dto: CreateWorkoutSessionDto,
    @CurrentUser('sub') userId: string,
  ) {
    const session = await this.fitnessService.createWorkoutSession(userId, dto);
    return { success: true, data: session };
  }

  @Post('sessions/bulk')
  @ApiOperation({ summary: 'Bulk create workout sessions' })
  async bulkCreateSessions(
    @Body() body: { sessions: CreateWorkoutSessionDto[] },
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.fitnessService.bulkCreateSessions(userId, body.sessions);
    return { success: true, data: result };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get workout sessions with filters' })
  async getSessions(
    @Query() query: QueryWorkoutSessionsDto,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.fitnessService.getWorkoutSessions(userId, query);
    return { success: true, data: result };
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a single workout session' })
  async getSession(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const session = await this.fitnessService.getWorkoutSession(userId, id);
    return { success: true, data: session };
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a workout session' })
  async deleteSession(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.fitnessService.deleteWorkoutSession(userId, id);
    return { success: true };
  }

  // ═══════════ DAILY METRICS ════════════════════════════

  @Get('daily-metrics/:date')
  @ApiOperation({ summary: 'Get daily metrics for a specific date' })
  async getDailyMetrics(
    @Param('date') date: string,
    @CurrentUser('sub') userId: string,
  ) {
    const metrics = await this.fitnessService.getDailyMetrics(userId, date);
    return { success: true, data: metrics };
  }

  @Get('daily-metrics')
  @ApiOperation({ summary: 'Get daily metrics range' })
  async getDailyMetricsRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser('sub') userId: string,
  ) {
    const metrics = await this.fitnessService.getDailyMetricsRange(userId, startDate, endDate);
    return { success: true, data: metrics };
  }

  @Put('daily-metrics')
  @ApiOperation({ summary: 'Update daily metrics' })
  async updateDailyMetrics(
    @Body() dto: UpdateDailyMetricsDto,
    @CurrentUser('sub') userId: string,
  ) {
    const metrics = await this.fitnessService.updateDailyMetrics(userId, dto);
    return { success: true, data: metrics };
  }

  // ═══════════ FITNESS PROFILE ══════════════════════════

  @Get('profile')
  @ApiOperation({ summary: 'Get fitness profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    const profile = await this.fitnessService.getFitnessProfile(userId);
    return { success: true, data: profile };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Save/update fitness profile' })
  async saveProfile(
    @Body() dto: SaveFitnessProfileDto,
    @CurrentUser('sub') userId: string,
  ) {
    const profile = await this.fitnessService.saveFitnessProfile(userId, dto);
    return { success: true, data: profile };
  }

  // ═══════════ FITNESS GOALS ════════════════════════════

  @Get('goals')
  @ApiOperation({ summary: 'Get fitness goals' })
  async getGoals(@CurrentUser('sub') userId: string) {
    const goals = await this.fitnessService.getGoals(userId);
    return { success: true, data: goals };
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a fitness goal' })
  async createGoal(
    @Body() dto: CreateFitnessGoalDto,
    @CurrentUser('sub') userId: string,
  ) {
    const goal = await this.fitnessService.createGoal(userId, dto);
    return { success: true, data: goal };
  }

  @Put('goals/:id/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  async updateGoalProgress(
    @Param('id') id: string,
    @Body() body: { current: number },
    @CurrentUser('sub') userId: string,
  ) {
    const goal = await this.fitnessService.updateGoalProgress(userId, id, body.current);
    return { success: true, data: goal };
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete a fitness goal' })
  async deleteGoal(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.fitnessService.deleteGoal(userId, id);
    return { success: true };
  }

  // ═══════════ ANALYTICS / INSIGHTS ═════════════════════

  @Get('stats')
  @ApiOperation({ summary: 'Get workout statistics and insights' })
  async getStats(@CurrentUser('sub') userId: string) {
    const stats = await this.fitnessService.getWorkoutStats(userId);
    return { success: true, data: stats };
  }
}
