import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DietaryController } from './dietary.controller';
import { DietaryService } from './dietary.service';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import {
  MealLog,
  MealLogSchema,
  DailyNutrition,
  DailyNutritionSchema,
  DietaryProfile,
  DietaryProfileSchema,
  DietaryGoal,
  DietaryGoalSchema,
  SupplementLog,
  SupplementLogSchema,
  MealPlan,
  MealPlanSchema,
    GroceryList,
    GroceryListSchema,
  } from './schemas/dietary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MealLog.name, schema: MealLogSchema },
      { name: DailyNutrition.name, schema: DailyNutritionSchema },
      { name: DietaryProfile.name, schema: DietaryProfileSchema },
      { name: DietaryGoal.name, schema: DietaryGoalSchema },
      { name: SupplementLog.name, schema: SupplementLogSchema },
      { name: MealPlan.name, schema: MealPlanSchema },
      { name: GroceryList.name, schema: GroceryListSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DietaryController],
  providers: [DietaryService],
  exports: [DietaryService],
})
export class DietaryModule {}
