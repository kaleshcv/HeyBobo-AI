import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from '../schemas/dietary.schema';

export class FoodItemDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() calories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() proteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() carbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() fatG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() fiberG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() servingSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() servingUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantity?: number;
}

export class CreateMealLogDto {
  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty() @IsString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ type: [FoodItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodItemDto)
  foods?: FoodItemDto[];

  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCalories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalProteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCarbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalFatG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalFiberG?: number;
}

export class UpdateMealLogDto {
  @ApiPropertyOptional({ enum: MealType })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ type: [FoodItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodItemDto)
  foods?: FoodItemDto[];

  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCalories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalProteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCarbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalFatG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalFiberG?: number;
}

export class UpdateDailyNutritionDto {
  @ApiProperty() @IsString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) waterMl?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) totalCalories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) totalProteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) totalCarbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) totalFatG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) totalFiberG?: number;
}

export class SaveDietaryProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() goal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dietType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyCalorieTarget?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyProteinTargetG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyCarbsTargetG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyFatTargetG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailyWaterTargetMl?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() allergies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() restrictions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() preferredCuisines?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() mealsPerDay?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() onboardingComplete?: boolean;
}

export class CreateDietaryGoalDto {
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsNumber() target: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
}

export class QueryMealLogsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() mealType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) skip?: number;
}

export class CreateSupplementLogDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiProperty() @IsString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dosage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() dosageUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timeOfDay?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() taken?: boolean;
}

export class UpdateSupplementLogDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dosage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() dosageUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timeOfDay?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() taken?: boolean;
}

export class QuerySupplementLogsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) skip?: number;
}

// ─── Meal Plan DTOs ─────────────────────────────────────

export class GenerateMealPlanDto {
  @ApiProperty() @IsString() planType: string; // 'daily' | 'weekly'
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fitnessGoal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() activityLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dietType?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() healthConditions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() allergies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() preferences?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetCalories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetProteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetCarbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetFatG?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
}

export class SaveMealPlanDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() planType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fitnessGoal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() activityLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dietType?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() healthConditions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() allergies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() preferences?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetCalories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetProteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetCarbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetFatG?: number;
  @ApiPropertyOptional() @IsOptional() days?: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() prepGuide?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() shoppingList?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() aiNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

export class SubstituteMealDto {
  @ApiProperty() @IsString() mealName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string; // allergy, preference, unavailable
  @ApiPropertyOptional() @IsOptional() @IsArray() allergies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() dietType?: string;
}

// ─── Grocery DTOs ───────────────────────────────────────

export class GroceryItemDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estimatedPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() calories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() proteinG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() carbsG?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() fatG?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() purchased?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() store?: string;
}

export class CreateGroceryListDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mealPlanId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => GroceryItemDto) items?: GroceryItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateGroceryListDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => GroceryItemDto) items?: GroceryItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class GenerateGroceryListDto {
  @ApiProperty() @IsString() mealPlanId: string;
}
