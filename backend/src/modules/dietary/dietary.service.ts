import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { User } from '@/modules/users/schemas/user.schema';
import {
  MealLog,
  DailyNutrition,
  DietaryProfile,
  DietaryGoal,
  SupplementLog,
  MealPlan,
  GroceryList,
} from './schemas/dietary.schema';
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

@Injectable()
export class DietaryService {
  private readonly logger = new Logger(DietaryService.name);

  constructor(
    @InjectModel(MealLog.name) private mealLogModel: Model<MealLog>,
    @InjectModel(DailyNutrition.name) private dailyNutritionModel: Model<DailyNutrition>,
    @InjectModel(DietaryProfile.name) private profileModel: Model<DietaryProfile>,
    @InjectModel(DietaryGoal.name) private goalModel: Model<DietaryGoal>,
    @InjectModel(SupplementLog.name) private supplementModel: Model<SupplementLog>,
    @InjectModel(MealPlan.name) private mealPlanModel: Model<MealPlan>,
    @InjectModel(GroceryList.name) private groceryListModel: Model<GroceryList>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // ═══════════ MEAL LOGS ════════════════════════════════

  async createMealLog(userId: string, dto: CreateMealLogDto): Promise<MealLog> {
    this.logger.log(`Creating meal log for user ${userId}: ${dto.mealType} on ${dto.date}`);
    const mealLog = new this.mealLogModel({
      ...dto,
      userId,
      loggedAt: new Date(),
    });
    const saved = await mealLog.save();

    // Update daily nutrition summary and user total meal count
    await Promise.all([
      this.recalculateDailyNutrition(userId, dto.date),
      this.userModel.findByIdAndUpdate(userId, { $inc: { totalMealsLogged: 1 } }),
    ]);

    return saved;
  }

  async getMealLogs(userId: string, query: QueryMealLogsDto) {
    const filter: any = { userId };
    if (query.mealType) filter.mealType = query.mealType;
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [meals, total] = await Promise.all([
      this.mealLogModel.find(filter).sort({ date: -1, loggedAt: -1 }).limit(limit).skip(skip).lean(),
      this.mealLogModel.countDocuments(filter),
    ]);

    return { meals, total, limit, skip };
  }

  async getMealLog(userId: string, mealId: string): Promise<MealLog> {
    const meal = await this.mealLogModel.findOne({ _id: mealId, userId }).lean();
    if (!meal) throw new NotFoundException('Meal log not found');
    return meal as any;
  }

  async updateMealLog(userId: string, mealId: string, dto: UpdateMealLogDto): Promise<MealLog> {
    const meal = await this.mealLogModel.findOne({ _id: mealId, userId });
    if (!meal) throw new NotFoundException('Meal log not found');

    Object.assign(meal, dto);
    const saved = await meal.save();
    await this.recalculateDailyNutrition(userId, meal.date);
    return saved;
  }

  async addMealPhoto(userId: string, mealId: string, file: Express.Multer.File): Promise<MealLog> {
    const meal = await this.mealLogModel.findOne({ _id: mealId, userId });
    if (!meal) throw new NotFoundException('Meal log not found');

    // Remove old photo if exists
    if (meal.photoUrl) {
      const oldPath = join(process.cwd(), meal.photoUrl.replace(/^\//, ''));
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    meal.photoUrl = `/uploads/meals/${file.filename}`;
    return meal.save();
  }

  async deleteMealLog(userId: string, mealId: string): Promise<void> {
    const meal = await this.mealLogModel.findOne({ _id: mealId, userId });
    if (!meal) throw new NotFoundException('Meal log not found');

    // Clean up photo file
    if (meal.photoUrl) {
      const photoPath = join(process.cwd(), meal.photoUrl.replace(/^\//, ''));
      if (existsSync(photoPath)) {
        try { unlinkSync(photoPath); } catch { /* ignore */ }
      }
    }

    const date = meal.date;
    await this.mealLogModel.deleteOne({ _id: mealId, userId });
    await this.recalculateDailyNutrition(userId, date);
  }

  // ═══════════ DAILY NUTRITION ══════════════════════════

  async getDailyNutrition(userId: string, date: string): Promise<DailyNutrition> {
    let nutrition = await this.dailyNutritionModel.findOne({ userId, date }).lean();
    if (!nutrition) {
      nutrition = {
        userId, date, totalCalories: 0, totalProteinG: 0, totalCarbsG: 0,
        totalFatG: 0, totalFiberG: 0, waterMl: 0, mealsLogged: 0,
      } as any;
    }
    return nutrition as any;
  }

  async getDailyNutritionRange(userId: string, startDate: string, endDate: string): Promise<DailyNutrition[]> {
    return this.dailyNutritionModel
      .find({ userId, date: { $gte: startDate, $lte: endDate } })
      .sort({ date: -1 })
      .lean() as any;
  }

  async updateDailyNutrition(userId: string, dto: UpdateDailyNutritionDto): Promise<DailyNutrition> {
    const update: any = {};
    if (dto.waterMl !== undefined) update.waterMl = dto.waterMl;
    if (dto.totalCalories !== undefined) update.totalCalories = dto.totalCalories;
    if (dto.totalProteinG !== undefined) update.totalProteinG = dto.totalProteinG;
    if (dto.totalCarbsG !== undefined) update.totalCarbsG = dto.totalCarbsG;
    if (dto.totalFatG !== undefined) update.totalFatG = dto.totalFatG;
    if (dto.totalFiberG !== undefined) update.totalFiberG = dto.totalFiberG;

    return this.dailyNutritionModel.findOneAndUpdate(
      { userId, date: dto.date },
      { $set: update },
      { upsert: true, new: true },
    ).lean() as any;
  }

  private async recalculateDailyNutrition(userId: string, date: string): Promise<void> {
    const meals = await this.mealLogModel.find({ userId, date }).lean();
    const totals = meals.reduce(
      (acc, meal) => ({
        totalCalories: acc.totalCalories + (meal.totalCalories || 0),
        totalProteinG: acc.totalProteinG + (meal.totalProteinG || 0),
        totalCarbsG: acc.totalCarbsG + (meal.totalCarbsG || 0),
        totalFatG: acc.totalFatG + (meal.totalFatG || 0),
        totalFiberG: acc.totalFiberG + (meal.totalFiberG || 0),
      }),
      { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, totalFiberG: 0 },
    );

    await this.dailyNutritionModel.findOneAndUpdate(
      { userId, date },
      { $set: { ...totals, mealsLogged: meals.length } },
      { upsert: true },
    );
  }

  // ═══════════ DIETARY PROFILE ══════════════════════════

  async getDietaryProfile(userId: string): Promise<DietaryProfile | null> {
    return this.profileModel.findOne({ userId }).lean() as any;
  }

  async saveDietaryProfile(userId: string, dto: SaveDietaryProfileDto): Promise<DietaryProfile> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      { $set: { ...dto, userId } },
      { upsert: true, new: true },
    ).lean() as any;
  }

  // ═══════════ DIETARY GOALS ════════════════════════════

  async getGoals(userId: string): Promise<DietaryGoal[]> {
    return this.goalModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  async createGoal(userId: string, dto: CreateDietaryGoalDto): Promise<DietaryGoal> {
    const goal = new this.goalModel({ ...dto, userId });
    return goal.save();
  }

  async updateGoalProgress(userId: string, goalId: string, current: number): Promise<DietaryGoal> {
    const goal = await this.goalModel.findOne({ _id: goalId, userId });
    if (!goal) throw new NotFoundException('Dietary goal not found');
    const wasNotCompleted = !goal.completed;
    goal.current = current;
    if (current >= goal.target && wasNotCompleted) {
      goal.completed = true;
      goal.completedAt = new Date();
      await this.userModel.findByIdAndUpdate(userId, { $inc: { completedDietaryGoals: 1 } });
    }
    return goal.save();
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const result = await this.goalModel.deleteOne({ _id: goalId, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Dietary goal not found');
  }

  // ═══════════ STATS / INSIGHTS ═════════════════════════

  async getNutritionStats(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [todayNutrition, weeklyData, profile, totalMeals] = await Promise.all([
      this.dailyNutritionModel.findOne({ userId, date: today }).lean(),
      this.dailyNutritionModel.find({ userId, date: { $gte: weekAgo, $lte: today } }).sort({ date: 1 }).lean(),
      this.profileModel.findOne({ userId }).lean(),
      this.mealLogModel.countDocuments({ userId }),
    ]);

    const weeklyAvg = weeklyData.length > 0
      ? {
          avgCalories: Math.round(weeklyData.reduce((s, d) => s + d.totalCalories, 0) / weeklyData.length),
          avgProteinG: Math.round(weeklyData.reduce((s, d) => s + d.totalProteinG, 0) / weeklyData.length),
          avgCarbsG: Math.round(weeklyData.reduce((s, d) => s + d.totalCarbsG, 0) / weeklyData.length),
          avgFatG: Math.round(weeklyData.reduce((s, d) => s + d.totalFatG, 0) / weeklyData.length),
          avgWaterMl: Math.round(weeklyData.reduce((s, d) => s + d.waterMl, 0) / weeklyData.length),
        }
      : null;

    return {
      today: todayNutrition,
      weeklyAverage: weeklyAvg,
      weeklyData,
      profile,
      totalMealsLogged: totalMeals,
    };
  }

  // ═══════════ SUPPLEMENT LOGS ══════════════════════════

  async createSupplement(userId: string, dto: CreateSupplementLogDto): Promise<SupplementLog> {
    const doc = new this.supplementModel({ ...dto, userId });
    return doc.save();
  }

  async getSupplements(userId: string, query: QuerySupplementLogsDto) {
    const filter: any = { userId };
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }
    const limit = query.limit || 100;
    const skip = query.skip || 0;

    const [supplements, total] = await Promise.all([
      this.supplementModel.find(filter).sort({ date: -1, timeOfDay: 1 }).limit(limit).skip(skip).lean(),
      this.supplementModel.countDocuments(filter),
    ]);
    return { supplements, total, limit, skip };
  }

  async updateSupplement(userId: string, id: string, dto: UpdateSupplementLogDto): Promise<SupplementLog> {
    const doc = await this.supplementModel.findOne({ _id: id, userId });
    if (!doc) throw new NotFoundException('Supplement log not found');
    Object.assign(doc, dto);
    return doc.save();
  }

  async toggleSupplementTaken(userId: string, id: string): Promise<SupplementLog> {
    const doc = await this.supplementModel.findOne({ _id: id, userId });
    if (!doc) throw new NotFoundException('Supplement log not found');
    doc.taken = !doc.taken;
    return doc.save();
  }

  async deleteSupplement(userId: string, id: string): Promise<void> {
    const result = await this.supplementModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Supplement log not found');
  }

  // ═══════════ MEAL PLANS ═══════════════════════════════

  async saveMealPlan(userId: string, dto: SaveMealPlanDto): Promise<MealPlan> {
    const plan = new this.mealPlanModel({ ...dto, userId });
    return plan.save();
  }

  async getMealPlans(userId: string): Promise<MealPlan[]> {
    return this.mealPlanModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  async getMealPlan(userId: string, id: string): Promise<MealPlan> {
    const plan = await this.mealPlanModel.findOne({ _id: id, userId }).lean();
    if (!plan) throw new NotFoundException('Meal plan not found');
    return plan as any;
  }

  async updateMealPlan(userId: string, id: string, dto: Partial<SaveMealPlanDto>): Promise<MealPlan> {
    const plan = await this.mealPlanModel.findOne({ _id: id, userId });
    if (!plan) throw new NotFoundException('Meal plan not found');
    Object.assign(plan, dto);
    return plan.save();
  }

  async setActivePlan(userId: string, id: string): Promise<MealPlan> {
    // Deactivate all other plans
    await this.mealPlanModel.updateMany({ userId }, { $set: { active: false } });
    const plan = await this.mealPlanModel.findOne({ _id: id, userId });
    if (!plan) throw new NotFoundException('Meal plan not found');
    plan.active = true;
    return plan.save();
  }

  async getActivePlan(userId: string): Promise<MealPlan | null> {
    return this.mealPlanModel.findOne({ userId, active: true }).lean() as any;
  }

  async deleteMealPlan(userId: string, id: string): Promise<void> {
    const result = await this.mealPlanModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Meal plan not found');
  }

  // ═══════════ GROCERY LISTS ════════════════════════════

  async createGroceryList(userId: string, dto: CreateGroceryListDto): Promise<GroceryList> {
    const items = dto.items || [];
    const totals = this.computeGroceryTotals(items as any[]);
    const list = new this.groceryListModel({ ...dto, userId, ...totals });
    return list.save();
  }

  async getGroceryLists(userId: string): Promise<GroceryList[]> {
    return this.groceryListModel.find({ userId }).sort({ createdAt: -1 }).lean() as any;
  }

  async getGroceryList(userId: string, id: string): Promise<GroceryList> {
    const doc = await this.groceryListModel.findOne({ _id: id, userId }).lean();
    if (!doc) throw new NotFoundException('Grocery list not found');
    return doc as any;
  }

  async updateGroceryList(userId: string, id: string, dto: UpdateGroceryListDto): Promise<GroceryList> {
    const doc = await this.groceryListModel.findOne({ _id: id, userId });
    if (!doc) throw new NotFoundException('Grocery list not found');
    if (dto.items) {
      const totals = this.computeGroceryTotals(dto.items as any[]);
      Object.assign(doc, dto, totals);
    } else {
      Object.assign(doc, dto);
    }
    return doc.save();
  }

  async toggleGroceryItem(userId: string, listId: string, itemIndex: number): Promise<GroceryList> {
    const doc = await this.groceryListModel.findOne({ _id: listId, userId });
    if (!doc) throw new NotFoundException('Grocery list not found');
    if (itemIndex < 0 || itemIndex >= doc.items.length) throw new NotFoundException('Item not found');
    doc.items[itemIndex].purchased = !doc.items[itemIndex].purchased;
    doc.purchasedCount = doc.items.filter((i) => i.purchased).length;
    doc.markModified('items');
    return doc.save();
  }

  async addGroceryItems(userId: string, listId: string, items: any[]): Promise<GroceryList> {
    const doc = await this.groceryListModel.findOne({ _id: listId, userId });
    if (!doc) throw new NotFoundException('Grocery list not found');
    doc.items.push(...items);
    const totals = this.computeGroceryTotals(doc.items as any[]);
    Object.assign(doc, totals);
    doc.markModified('items');
    return doc.save();
  }

  async deleteGroceryList(userId: string, id: string): Promise<void> {
    const result = await this.groceryListModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) throw new NotFoundException('Grocery list not found');
  }

  private computeGroceryTotals(items: { calories?: number; proteinG?: number; carbsG?: number; fatG?: number; estimatedPrice?: number; purchased?: boolean }[]) {
    return {
      itemCount: items.length,
      purchasedCount: items.filter((i) => i.purchased).length,
      totalEstimatedCost: items.reduce((s, i) => s + (i.estimatedPrice || 0), 0),
      totalCalories: items.reduce((s, i) => s + (i.calories || 0), 0),
      totalProteinG: items.reduce((s, i) => s + (i.proteinG || 0), 0),
      totalCarbsG: items.reduce((s, i) => s + (i.carbsG || 0), 0),
      totalFatG: items.reduce((s, i) => s + (i.fatG || 0), 0),
    };
  }
}
