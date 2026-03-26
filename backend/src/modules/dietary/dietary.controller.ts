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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { createDiskStorage } from '../../common/storage/multer.config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DietaryService } from './dietary.service';
import {
  CreateMealLogDto,
  UpdateMealLogDto,
  UpdateDailyNutritionDto,
  SaveDietaryProfileDto,
  CreateDietaryGoalDto,
  QueryMealLogsDto,
  CreateSupplementLogDto,
  UpdateSupplementLogDto,
  QuerySupplementLogsDto,
  SaveMealPlanDto,
  CreateGroceryListDto,
  UpdateGroceryListDto,
} from './dto/dietary.dto';

@ApiTags('Dietary')
@ApiBearerAuth('access-token')
@Controller('dietary')
export class DietaryController {
  private readonly logger = new Logger(DietaryController.name);

  constructor(private readonly dietaryService: DietaryService) {}

  // ═══════════ MEAL LOGS ════════════════════════════════

  @Post('meals')
  @ApiOperation({ summary: 'Log a meal' })
  async createMealLog(
    @Body() dto: CreateMealLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.createMealLog(userId, dto);
  }

  @Get('meals')
  @ApiOperation({ summary: 'Get meal logs with filters' })
  async getMealLogs(
    @Query() query: QueryMealLogsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getMealLogs(userId, query);
  }

  @Get('meals/:id')
  @ApiOperation({ summary: 'Get a single meal log' })
  async getMealLog(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getMealLog(userId, id);
  }

  @Put('meals/:id')
  @ApiOperation({ summary: 'Update a meal log' })
  async updateMealLog(
    @Param('id') id: string,
    @Body() dto: UpdateMealLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.updateMealLog(userId, id, dto);
  }

  @Post('meals/:id/photo')
  @ApiOperation({ summary: 'Upload a meal photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', { storage: createDiskStorage('meals') }))
  async uploadMealPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.addMealPhoto(userId, id, file);
  }

  @Delete('meals/:id')
  @ApiOperation({ summary: 'Delete a meal log' })
  async deleteMealLog(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.dietaryService.deleteMealLog(userId, id);
    return { deleted: true };
  }

  // ═══════════ DAILY NUTRITION ══════════════════════════

  @Get('daily-nutrition/:date')
  @ApiOperation({ summary: 'Get daily nutrition summary for a date' })
  async getDailyNutrition(
    @Param('date') date: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getDailyNutrition(userId, date);
  }

  @Get('daily-nutrition')
  @ApiOperation({ summary: 'Get daily nutrition range' })
  async getDailyNutritionRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getDailyNutritionRange(userId, startDate, endDate);
  }

  @Put('daily-nutrition')
  @ApiOperation({ summary: 'Update daily nutrition (e.g. water intake)' })
  async updateDailyNutrition(
    @Body() dto: UpdateDailyNutritionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.updateDailyNutrition(userId, dto);
  }

  // ═══════════ DIETARY PROFILE ══════════════════════════

  @Get('profile')
  @ApiOperation({ summary: 'Get dietary profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.dietaryService.getDietaryProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Save/update dietary profile' })
  async saveProfile(
    @Body() dto: SaveDietaryProfileDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.saveDietaryProfile(userId, dto);
  }

  // ═══════════ DIETARY GOALS ════════════════════════════

  @Get('goals')
  @ApiOperation({ summary: 'Get dietary goals' })
  async getGoals(@CurrentUser('sub') userId: string) {
    return this.dietaryService.getGoals(userId);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a dietary goal' })
  async createGoal(
    @Body() dto: CreateDietaryGoalDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.createGoal(userId, dto);
  }

  @Put('goals/:id/progress')
  @ApiOperation({ summary: 'Update dietary goal progress' })
  async updateGoalProgress(
    @Param('id') id: string,
    @Body() body: { current: number },
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.updateGoalProgress(userId, id, body.current);
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete a dietary goal' })
  async deleteGoal(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.dietaryService.deleteGoal(userId, id);
    return { deleted: true };
  }

  // ═══════════ STATS / INSIGHTS ═════════════════════════

  @Get('stats')
  @ApiOperation({ summary: 'Get nutrition statistics and insights' })
  async getStats(@CurrentUser('sub') userId: string) {
    return this.dietaryService.getNutritionStats(userId);
  }

  // ═══════════ SUPPLEMENTS ══════════════════════════════

  @Post('supplements')
  @ApiOperation({ summary: 'Log a supplement' })
  async createSupplement(
    @Body() dto: CreateSupplementLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.createSupplement(userId, dto);
  }

  @Get('supplements')
  @ApiOperation({ summary: 'Get supplement logs' })
  async getSupplements(
    @Query() query: QuerySupplementLogsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getSupplements(userId, query);
  }

  @Put('supplements/:id')
  @ApiOperation({ summary: 'Update a supplement log' })
  async updateSupplement(
    @Param('id') id: string,
    @Body() dto: UpdateSupplementLogDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.updateSupplement(userId, id, dto);
  }

  @Patch('supplements/:id/toggle')
  @ApiOperation({ summary: 'Toggle supplement taken status' })
  async toggleSupplement(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.toggleSupplementTaken(userId, id);
  }

  @Delete('supplements/:id')
  @ApiOperation({ summary: 'Delete a supplement log' })
  async deleteSupplement(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.dietaryService.deleteSupplement(userId, id);
    return { deleted: true };
  }

  // ═══════════ MEAL PLANS ═══════════════════════════════

  @Post('meal-plans')
  @ApiOperation({ summary: 'Save a meal plan (AI-generated or manual)' })
  async saveMealPlan(
    @Body() dto: SaveMealPlanDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.saveMealPlan(userId, dto);
  }

  @Get('meal-plans')
  @ApiOperation({ summary: 'Get all meal plans' })
  async getMealPlans(@CurrentUser('sub') userId: string) {
    return this.dietaryService.getMealPlans(userId);
  }

  @Get('meal-plans/active')
  @ApiOperation({ summary: 'Get the currently active meal plan' })
  async getActivePlan(@CurrentUser('sub') userId: string) {
    return this.dietaryService.getActivePlan(userId);
  }

  @Get('meal-plans/:id')
  @ApiOperation({ summary: 'Get a single meal plan' })
  async getMealPlan(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getMealPlan(userId, id);
  }

  @Put('meal-plans/:id')
  @ApiOperation({ summary: 'Update a meal plan' })
  async updateMealPlan(
    @Param('id') id: string,
    @Body() dto: SaveMealPlanDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.updateMealPlan(userId, id, dto);
  }

  @Patch('meal-plans/:id/activate')
  @ApiOperation({ summary: 'Set a meal plan as active' })
  async activatePlan(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.setActivePlan(userId, id);
  }

  @Delete('meal-plans/:id')
  @ApiOperation({ summary: 'Delete a meal plan' })
  async deleteMealPlan(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.dietaryService.deleteMealPlan(userId, id);
    return { deleted: true };
  }

  // ═══════════ GROCERY LISTS ════════════════════════════

  @Post('grocery-lists')
  @ApiOperation({ summary: 'Create a grocery list' })
  async createGroceryList(
    @Body() dto: CreateGroceryListDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.createGroceryList(userId, dto);
  }

  @Get('grocery-lists')
  @ApiOperation({ summary: 'Get all grocery lists' })
  async getGroceryLists(@CurrentUser('sub') userId: string) {
    return this.dietaryService.getGroceryLists(userId);
  }

  @Get('grocery-lists/:id')
  @ApiOperation({ summary: 'Get a single grocery list' })
  async getGroceryList(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.getGroceryList(userId, id);
  }

  @Put('grocery-lists/:id')
  @ApiOperation({ summary: 'Update a grocery list' })
  async updateGroceryList(
    @Param('id') id: string,
    @Body() dto: UpdateGroceryListDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.updateGroceryList(userId, id, dto);
  }

  @Patch('grocery-lists/:id/items/:index/toggle')
  @ApiOperation({ summary: 'Toggle a grocery item purchased status' })
  async toggleGroceryItem(
    @Param('id') id: string,
    @Param('index') index: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.toggleGroceryItem(userId, id, parseInt(index, 10));
  }

  @Post('grocery-lists/:id/items')
  @ApiOperation({ summary: 'Add items to a grocery list' })
  async addGroceryItems(
    @Param('id') id: string,
    @Body() body: { items: any[] },
    @CurrentUser('sub') userId: string,
  ) {
    return this.dietaryService.addGroceryItems(userId, id, body.items);
  }

  @Delete('grocery-lists/:id')
  @ApiOperation({ summary: 'Delete a grocery list' })
  async deleteGroceryList(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.dietaryService.deleteGroceryList(userId, id);
    return { deleted: true };
  }
}
