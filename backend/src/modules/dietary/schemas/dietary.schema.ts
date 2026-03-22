import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ─── Enums ──────────────────────────────────────────────
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export enum DietGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_WEIGHT = 'gain_weight',
  MAINTAIN = 'maintain',
  BUILD_MUSCLE = 'build_muscle',
  IMPROVE_HEALTH = 'improve_health',
}

export enum DietType {
  STANDARD = 'standard',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  KETO = 'keto',
  PALEO = 'paleo',
  MEDITERRANEAN = 'mediterranean',
  LOW_CARB = 'low_carb',
  HIGH_PROTEIN = 'high_protein',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  CUSTOM = 'custom',
}

// ─── Sub-document: Food Item ────────────────────────────
@Schema({ _id: false, timestamps: false })
export class FoodItem {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  calories: number;

  @Prop({ default: 0 })
  proteinG: number;

  @Prop({ default: 0 })
  carbsG: number;

  @Prop({ default: 0 })
  fatG: number;

  @Prop({ default: 0 })
  fiberG: number;

  @Prop({ default: 0 })
  servingSize: number;

  @Prop({ default: 'g' })
  servingUnit: string;

  @Prop({ default: 1 })
  quantity: number;
}

export const FoodItemSchema = SchemaFactory.createForClass(FoodItem);

// ─── Main Schema: MealLog ───────────────────────────────
@Schema({ timestamps: true, collection: 'meal_logs' })
export class MealLog extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: MealType })
  mealType: MealType;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop()
  name: string;

  @Prop()
  notes: string;

  @Prop({ type: [FoodItemSchema], default: [] })
  foods: FoodItem[];

  @Prop({ default: 0 })
  totalCalories: number;

  @Prop({ default: 0 })
  totalProteinG: number;

  @Prop({ default: 0 })
  totalCarbsG: number;

  @Prop({ default: 0 })
  totalFatG: number;

  @Prop({ default: 0 })
  totalFiberG: number;

  @Prop()
  photoUrl: string;

  @Prop()
  loggedAt: Date;
}

export const MealLogSchema = SchemaFactory.createForClass(MealLog);

MealLogSchema.index({ userId: 1, date: -1 });
MealLogSchema.index({ userId: 1, mealType: 1 });

// ─── Daily Nutrition Summary ────────────────────────────
@Schema({ timestamps: true, collection: 'daily_nutrition' })
export class DailyNutrition extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 0 })
  totalCalories: number;

  @Prop({ default: 0 })
  totalProteinG: number;

  @Prop({ default: 0 })
  totalCarbsG: number;

  @Prop({ default: 0 })
  totalFatG: number;

  @Prop({ default: 0 })
  totalFiberG: number;

  @Prop({ default: 0 })
  waterMl: number;

  @Prop({ default: 0 })
  mealsLogged: number;
}

export const DailyNutritionSchema = SchemaFactory.createForClass(DailyNutrition);

DailyNutritionSchema.index({ userId: 1, date: -1 }, { unique: true });

// ─── Dietary Profile ────────────────────────────────────
@Schema({ timestamps: true, collection: 'dietary_profiles' })
export class DietaryProfile extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ enum: DietGoal })
  goal: string;

  @Prop({ enum: DietType })
  dietType: string;

  @Prop({ default: 0 })
  dailyCalorieTarget: number;

  @Prop({ default: 0 })
  dailyProteinTargetG: number;

  @Prop({ default: 0 })
  dailyCarbsTargetG: number;

  @Prop({ default: 0 })
  dailyFatTargetG: number;

  @Prop({ default: 0 })
  dailyWaterTargetMl: number;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  restrictions: string[];

  @Prop({ type: [String], default: [] })
  preferredCuisines: string[];

  @Prop({ default: 3 })
  mealsPerDay: number;

  @Prop({ default: false })
  onboardingComplete: boolean;
}

export const DietaryProfileSchema = SchemaFactory.createForClass(DietaryProfile);

// ─── Dietary Goal ───────────────────────────────────────
@Schema({ timestamps: true, collection: 'dietary_goals' })
export class DietaryGoal extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  type: string; // 'calories', 'protein', 'water', 'meals', etc.

  @Prop({ required: true })
  target: number;

  @Prop({ default: 0 })
  current: number;

  @Prop()
  unit: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  completedAt: Date;
}

export const DietaryGoalSchema = SchemaFactory.createForClass(DietaryGoal);

DietaryGoalSchema.index({ userId: 1, type: 1 });

// ─── Supplement Log ─────────────────────────────────────
@Schema({ timestamps: true, collection: 'supplement_logs' })
export class SupplementLog extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  brand: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 1 })
  dosage: number;

  @Prop({ default: 'capsule' })
  dosageUnit: string; // capsule, tablet, ml, mg, scoop

  @Prop({ default: 'morning' })
  timeOfDay: string; // morning, afternoon, evening, night

  @Prop()
  notes: string;

  @Prop({ default: false })
  taken: boolean;
}

export const SupplementLogSchema = SchemaFactory.createForClass(SupplementLog);

SupplementLogSchema.index({ userId: 1, date: -1 });

// ─── Enums for Meal Planner ─────────────────────────────
export enum PlanType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  ATHLETE = 'athlete',
}

export enum PlanCategory {
  GENERAL = 'general',
  HEALTH_CONDITION = 'health_condition',
  ATHLETE_PERFORMANCE = 'athlete_performance',
  GYM_NUTRITION = 'gym_nutrition',
  CUSTOM = 'custom',
}

// ─── Sub-document: Planned Meal Item ────────────────────
@Schema({ _id: false, timestamps: false })
export class PlannedMealItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  calories: number;

  @Prop({ default: 0 })
  proteinG: number;

  @Prop({ default: 0 })
  carbsG: number;

  @Prop({ default: 0 })
  fatG: number;

  @Prop({ default: 0 })
  fiberG: number;

  @Prop()
  portionSize: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop()
  prepTime: string;

  @Prop({ type: [String], default: [] })
  substitutions: string[];
}

export const PlannedMealItemSchema = SchemaFactory.createForClass(PlannedMealItem);

// ─── Sub-document: Day Plan ─────────────────────────────
@Schema({ _id: false, timestamps: false })
export class DayPlan {
  @Prop({ required: true })
  day: string; // 'Monday', 'Tuesday', etc. or date string

  @Prop({ default: 0 })
  totalCalories: number;

  @Prop({ default: 0 })
  totalProteinG: number;

  @Prop({ default: 0 })
  totalCarbsG: number;

  @Prop({ default: 0 })
  totalFatG: number;

  @Prop({ type: [PlannedMealItemSchema], default: [] })
  breakfast: PlannedMealItem[];

  @Prop({ type: [PlannedMealItemSchema], default: [] })
  lunch: PlannedMealItem[];

  @Prop({ type: [PlannedMealItemSchema], default: [] })
  dinner: PlannedMealItem[];

  @Prop({ type: [PlannedMealItemSchema], default: [] })
  snacks: PlannedMealItem[];
}

export const DayPlanSchema = SchemaFactory.createForClass(DayPlan);

// ─── Main Schema: Meal Plan ─────────────────────────────
@Schema({ timestamps: true, collection: 'meal_plans' })
export class MealPlan extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: PlanType, default: PlanType.WEEKLY })
  planType: string;

  @Prop({ enum: PlanCategory, default: PlanCategory.GENERAL })
  category: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  // Personalization inputs
  @Prop({ enum: DietGoal })
  fitnessGoal: string;

  @Prop({ enum: ActivityLevel })
  activityLevel: string;

  @Prop({ enum: DietType })
  dietType: string;

  @Prop({ type: [String], default: [] })
  healthConditions: string[];

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  preferences: string[];

  @Prop({ default: 0 })
  targetCalories: number;

  @Prop({ default: 0 })
  targetProteinG: number;

  @Prop({ default: 0 })
  targetCarbsG: number;

  @Prop({ default: 0 })
  targetFatG: number;

  // Plan content
  @Prop({ type: [DayPlanSchema], default: [] })
  days: DayPlan[];

  // Prep guide
  @Prop()
  prepGuide: string;

  @Prop({ type: [String], default: [] })
  shoppingList: string[];

  // AI metadata
  @Prop()
  aiNotes: string;

  @Prop({ default: false })
  active: boolean;
}

export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);

MealPlanSchema.index({ userId: 1, active: -1 });
MealPlanSchema.index({ userId: 1, createdAt: -1 });

// ─── Enums for Grocery ──────────────────────────────────
export enum GroceryItemCategory {
  PRODUCE = 'produce',
  DAIRY = 'dairy',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  GRAINS = 'grains',
  BAKERY = 'bakery',
  FROZEN = 'frozen',
  CANNED = 'canned',
  SNACKS = 'snacks',
  BEVERAGES = 'beverages',
  CONDIMENTS = 'condiments',
  SPICES = 'spices',
  OILS = 'oils',
  SUPPLEMENTS = 'supplements',
  OTHER = 'other',
}

export enum GroceryListStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SHOPPING = 'shopping',
  ORDERED = 'ordered',
  COMPLETED = 'completed',
}

// ─── Sub-document: Grocery Item ─────────────────────────
@Schema({ _id: false, timestamps: false })
export class GroceryItem {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ default: '' })
  unit: string; // kg, g, lbs, oz, pieces, pack, bottle, etc.

  @Prop({ enum: GroceryItemCategory, default: GroceryItemCategory.OTHER })
  category: string;

  @Prop({ default: 0 })
  estimatedPrice: number;

  @Prop({ default: 0 })
  calories: number;

  @Prop({ default: 0 })
  proteinG: number;

  @Prop({ default: 0 })
  carbsG: number;

  @Prop({ default: 0 })
  fatG: number;

  @Prop({ default: false })
  purchased: boolean;

  @Prop()
  notes: string;

  @Prop()
  store: string; // preferred store
}

export const GroceryItemSchema = SchemaFactory.createForClass(GroceryItem);

// ─── Main Schema: Grocery List ──────────────────────────
@Schema({ timestamps: true, collection: 'grocery_lists' })
export class GroceryList extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: GroceryListStatus, default: GroceryListStatus.DRAFT })
  status: string;

  @Prop()
  mealPlanId: string; // linked meal plan ID

  @Prop({ type: [GroceryItemSchema], default: [] })
  items: GroceryItem[];

  @Prop({ default: 0 })
  totalEstimatedCost: number;

  @Prop({ default: 0 })
  totalCalories: number;

  @Prop({ default: 0 })
  totalProteinG: number;

  @Prop({ default: 0 })
  totalCarbsG: number;

  @Prop({ default: 0 })
  totalFatG: number;

  @Prop({ default: 0 })
  itemCount: number;

  @Prop({ default: 0 })
  purchasedCount: number;

  @Prop()
  notes: string;

  @Prop({ type: [String], default: [] })
  optimizationTips: string[];
}

export const GroceryListSchema = SchemaFactory.createForClass(GroceryList);

GroceryListSchema.index({ userId: 1, status: 1 });
GroceryListSchema.index({ userId: 1, createdAt: -1 });
