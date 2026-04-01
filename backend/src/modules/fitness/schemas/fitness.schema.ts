import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── Enums ──────────────────────────────────────────────
export enum WorkoutSource {
  MANUAL = 'manual',
  LIVE_CAMERA = 'live_camera',
  CUSTOM_WORKOUT = 'custom_workout',
  WORKOUT_PLAN = 'workout_plan',
  ACTIVITY_TRACKING = 'activity_tracking',
}

export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  YOGA = 'yoga',
  HIIT = 'hiit',
  STRETCHING = 'stretching',
  MOBILITY = 'mobility',
  UPPER = 'upper',
  LOWER = 'lower',
  CORE = 'core',
  FULL_BODY = 'full-body',
  STRETCH = 'stretch',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// ─── Sub-document: Exercise Set ─────────────────────────
@Schema({ _id: false, timestamps: false })
export class ExerciseSet {
  @Prop({ required: true })
  exerciseId: string;

  @Prop({ required: true })
  exerciseName: string;

  @Prop()
  category: string;

  @Prop({ type: [String], default: [] })
  muscles: string[];

  @Prop({ default: 0 })
  sets: number;

  @Prop({ default: 0 })
  reps: number;

  @Prop({ default: 0 })
  durationSeconds: number;

  @Prop({ default: 0 })
  restSeconds: number;

  @Prop({ default: 0 })
  weight: number;
}

export const ExerciseSetSchema = SchemaFactory.createForClass(ExerciseSet);

// ─── Sub-document: Form Analysis (Live Camera) ─────────
@Schema({ _id: false, timestamps: false })
export class FormAnalysis {
  @Prop({ default: 0 })
  avgFormScore: number;

  @Prop({ default: 0 })
  bestFormScore: number;

  @Prop({ default: 0 })
  worstFormScore: number;

  @Prop({ type: [Number], default: [] })
  formScoreTimeline: number[];
}

export const FormAnalysisSchema = SchemaFactory.createForClass(FormAnalysis);

// ─── Main Schema: WorkoutSession ────────────────────────
@Schema({ timestamps: true, collection: 'workout_sessions' })
export class WorkoutSession extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: WorkoutSource })
  source: WorkoutSource;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop()
  difficulty: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  endedAt: Date;

  @Prop({ default: 0 })
  durationSeconds: number;

  @Prop({ default: 0 })
  totalReps: number;

  @Prop({ default: 0 })
  totalSets: number;

  @Prop({ default: 0 })
  caloriesBurned: number;

  @Prop({ type: [ExerciseSetSchema], default: [] })
  exercises: ExerciseSet[];

  @Prop({ type: FormAnalysisSchema })
  formAnalysis: FormAnalysis;

  @Prop()
  planId: string;

  @Prop()
  customWorkoutId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const WorkoutSessionSchema = SchemaFactory.createForClass(WorkoutSession);

WorkoutSessionSchema.index({ userId: 1, startedAt: -1 });
WorkoutSessionSchema.index({ userId: 1, source: 1 });
WorkoutSessionSchema.index({ userId: 1, category: 1 });

// ─── Daily Metrics Schema ───────────────────────────────
@Schema({ timestamps: true, collection: 'daily_metrics' })
export class DailyMetric extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 0 })
  steps: number;

  @Prop({ default: 0 })
  distanceKm: number;

  @Prop({ default: 0 })
  caloriesBurned: number;

  @Prop({ default: 0 })
  activeMinutes: number;

  @Prop({ default: 0 })
  floorsClimbed: number;

  @Prop({ default: 0 })
  workoutsCompleted: number;

  @Prop({ default: 0 })
  totalReps: number;

  @Prop({ default: 0 })
  totalDurationSeconds: number;
}

export const DailyMetricSchema = SchemaFactory.createForClass(DailyMetric);

DailyMetricSchema.index({ userId: 1, date: -1 }, { unique: true });

// ─── Fitness Profile Schema ─────────────────────────────
@Schema({ timestamps: true, collection: 'fitness_profiles' })
export class FitnessProfile extends Document {
  @Prop({ required: true, unique: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  goals: string[];

  @Prop()
  fitnessLevel: string;

  @Prop()
  activityLevel: string;

  @Prop({ default: 0 })
  heightCm: number;

  @Prop({ default: 0 })
  weightKg: number;

  @Prop({ default: 0 })
  bmi: number;

  @Prop()
  bmiCategory: string;

  @Prop({ type: [String], default: [] })
  injuries: string[];

  @Prop({ default: 0 })
  daysPerWeek: number;

  @Prop({ default: 0 })
  minutesPerSession: number;

  @Prop({ type: [String], default: [] })
  preferredDays: string[];

  @Prop({ default: false })
  onboardingComplete: boolean;
}

export const FitnessProfileSchema = SchemaFactory.createForClass(FitnessProfile);

// ─── Goal/Achievement Schema ────────────────────────────
@Schema({ timestamps: true, collection: 'fitness_goals' })
export class FitnessGoal extends Document {
  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // 'steps', 'workouts', 'calories', 'streak', 'reps', etc.

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

export const FitnessGoalSchema = SchemaFactory.createForClass(FitnessGoal);

FitnessGoalSchema.index({ userId: 1, type: 1 });
