import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsDate, IsBoolean, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutSource } from '../schemas/fitness.schema';

export class ExerciseSetDto {
  @ApiProperty() @IsString() exerciseId: string;
  @ApiProperty() @IsString() exerciseName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() muscles?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() sets?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() reps?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() durationSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() restSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
}

export class FormAnalysisDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() avgFormScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bestFormScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() worstFormScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() formScoreTimeline?: number[];
}

export class CreateWorkoutSessionDto {
  @ApiProperty({ enum: WorkoutSource })
  @IsEnum(WorkoutSource)
  source: WorkoutSource;

  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() difficulty?: string;
  @ApiProperty() @IsString() startedAt: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() durationSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalReps?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalSets?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() caloriesBurned?: number;

  @ApiPropertyOptional({ type: [ExerciseSetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseSetDto)
  exercises?: ExerciseSetDto[];

  @ApiPropertyOptional({ type: FormAnalysisDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormAnalysisDto)
  formAnalysis?: FormAnalysisDto;

  @ApiPropertyOptional() @IsOptional() @IsString() planId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customWorkoutId?: string;
  @ApiPropertyOptional() @IsOptional() metadata?: Record<string, any>;
}

export class UpdateDailyMetricsDto {
  @ApiProperty() @IsString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) steps?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) distanceKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) caloriesBurned?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) activeMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) floorsClimbed?: number;
}

export class SaveFitnessProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsArray() goals?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() fitnessLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() activityLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() heightCm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weightKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bmi?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() bmiCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() injuries?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() daysPerWeek?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minutesPerSession?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() preferredDays?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() onboardingComplete?: boolean;
}

export class CreateFitnessGoalDto {
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsNumber() target: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
}

export class QueryWorkoutSessionsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) skip?: number;
}
