import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ═══════════ ENUMS ═══════════════════════════════════════

export enum SkinType {
  OILY = 'oily',
  DRY = 'dry',
  COMBINATION = 'combination',
  NORMAL = 'normal',
  SENSITIVE = 'sensitive',
}

export enum SkinConcern {
  ACNE = 'acne',
  AGING = 'aging',
  HYDRATION = 'hydration',
  DARK_SPOTS = 'dark_spots',
  REDNESS = 'redness',
  LARGE_PORES = 'large_pores',
  WRINKLES = 'wrinkles',
  DULLNESS = 'dullness',
  SUN_DAMAGE = 'sun_damage',
  UNEVEN_TONE = 'uneven_tone',
}

export enum HairType {
  STRAIGHT = 'straight',
  WAVY = 'wavy',
  CURLY = 'curly',
  COILY = 'coily',
}

export enum FaceShape {
  OVAL = 'oval',
  ROUND = 'round',
  SQUARE = 'square',
  HEART = 'heart',
  OBLONG = 'oblong',
  DIAMOND = 'diamond',
}

export enum BodyType {
  SLIM = 'slim',
  ATHLETIC = 'athletic',
  AVERAGE = 'average',
  MUSCULAR = 'muscular',
  BROAD = 'broad',
  PLUS_SIZE = 'plus_size',
}

export enum StylePreference {
  CASUAL = 'casual',
  FORMAL = 'formal',
  SMART_CASUAL = 'smart_casual',
  STREETWEAR = 'streetwear',
  MINIMALIST = 'minimalist',
  CLASSIC = 'classic',
  TRENDY = 'trendy',
  SPORTY = 'sporty',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
}

export enum RecommendationType {
  SKINCARE = 'skincare',
  HAIRCARE = 'haircare',
  OUTFIT = 'outfit',
}

export enum VisualAnalysisType {
  SKIN = 'skin',
  HAIR_FACE = 'hair_face',
  BODY_STYLE = 'body_style',
}

// ═══════════ GROOMING PROFILE ════════════════════════════

@Schema({ _id: false, timestamps: false })
export class SkincareProfile {
  @Prop({ type: String, enum: SkinType })
  skinType: string;

  @Prop({ type: [String], enum: Object.values(SkinConcern), default: [] })
  concerns: string[];

  @Prop({ type: String, default: '' })
  sunExposure: string; // low, moderate, high

  @Prop({ type: Boolean, default: false })
  veganOnly: boolean;

  @Prop({ type: String, default: '' })
  budget: string; // budget, mid-range, premium

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: String, default: '' })
  currentRoutine: string;
}
export const SkincareProfileSchema = SchemaFactory.createForClass(SkincareProfile);

@Schema({ _id: false, timestamps: false })
export class HaircareProfile {
  @Prop({ type: String, enum: HairType })
  hairType: string;

  @Prop({ type: String, enum: FaceShape })
  faceShape: string;

  @Prop({ type: Boolean, default: false })
  hasFacialHair: boolean;

  @Prop({ type: String, default: '' })
  facialHairStyle: string;

  @Prop({ type: [String], default: [] })
  hairConcerns: string[]; // thinning, dandruff, frizz, damage, oily_scalp

  @Prop({ type: String, default: '' })
  stylingPreference: string; // low-maintenance, trendy, classic

  @Prop({ type: String, default: '' })
  currentProducts: string;
}
export const HaircareProfileSchema = SchemaFactory.createForClass(HaircareProfile);

@Schema({ _id: false, timestamps: false })
export class OutfitProfile {
  @Prop({ type: String, enum: BodyType })
  bodyType: string;

  @Prop({ type: [String], enum: Object.values(StylePreference), default: [] })
  stylePreferences: string[];

  @Prop({ type: [String], default: [] })
  favoriteColors: string[];

  @Prop({ type: String, default: '' })
  skinTone: string; // warm, cool, neutral

  @Prop({ type: String, default: '' })
  height: string;

  @Prop({ type: Boolean, default: false })
  sustainableOnly: boolean;

  @Prop({ type: String, default: '' })
  budget: string;

  @Prop({ type: [String], default: [] })
  occasions: string[]; // work, casual, party, formal, date
}
export const OutfitProfileSchema = SchemaFactory.createForClass(OutfitProfile);

@Schema({ timestamps: true })
export class GroomingProfile extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: SkincareProfileSchema, default: () => ({}) })
  skincare: SkincareProfile;

  @Prop({ type: HaircareProfileSchema, default: () => ({}) })
  haircare: HaircareProfile;

  @Prop({ type: OutfitProfileSchema, default: () => ({}) })
  outfit: OutfitProfile;

  @Prop({ type: String, enum: Season })
  currentSeason: string;

  @Prop({ type: String, default: '' })
  gender: string;

  @Prop({ type: Number, default: 0 })
  age: number;
}
export const GroomingProfileSchema = SchemaFactory.createForClass(GroomingProfile);

// ═══════════ RECOMMENDATION ═════════════════════════════

@Schema({ _id: false, timestamps: false })
export class ProductRecommendation {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  brand: string;

  @Prop({ default: '' })
  category: string; // cleanser, moisturizer, sunscreen, shampoo, etc.

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  usage: string; // how to apply / when

  @Prop({ default: '' })
  priceRange: string;

  @Prop({ default: '' })
  keyIngredients: string;
}
export const ProductRecommendationSchema = SchemaFactory.createForClass(ProductRecommendation);

@Schema({ _id: false, timestamps: false })
export class RoutineStep {
  @Prop({ required: true })
  step: number;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: ProductRecommendationSchema })
  product: ProductRecommendation;

  @Prop({ default: '' })
  timeOfDay: string; // morning, evening, both

  @Prop({ default: '' })
  frequency: string; // daily, weekly, as-needed
}
export const RoutineStepSchema = SchemaFactory.createForClass(RoutineStep);

@Schema({ _id: false, timestamps: false })
export class OutfitItem {
  @Prop({ required: true })
  type: string; // top, bottom, shoes, accessory, outerwear

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  color: string;

  @Prop({ default: '' })
  style: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  priceRange: string;
}
export const OutfitItemSchema = SchemaFactory.createForClass(OutfitItem);

@Schema({ _id: false, timestamps: false })
export class OutfitSuggestion {
  @Prop({ required: true })
  occasion: string;

  @Prop({ type: [OutfitItemSchema], default: [] })
  items: OutfitItem[];

  @Prop({ default: '' })
  stylingTips: string;

  @Prop({ default: '' })
  colorPaletteReason: string;
}
export const OutfitSuggestionSchema = SchemaFactory.createForClass(OutfitSuggestion);

@Schema({ timestamps: true })
export class GroomingRecommendation extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: RecommendationType })
  type: string;

  @Prop({ default: '' })
  title: string;

  // For skincare/haircare
  @Prop({ type: [RoutineStepSchema], default: [] })
  routine: RoutineStep[];

  @Prop({ type: [ProductRecommendationSchema], default: [] })
  products: ProductRecommendation[];

  // For outfit
  @Prop({ type: [OutfitSuggestionSchema], default: [] })
  outfits: OutfitSuggestion[];

  // Shared fields
  @Prop({ type: [String], default: [] })
  tips: string[];

  @Prop({ default: '' })
  seasonalAdvice: string;

  // AI analysis results
  @Prop({ type: Object, default: {} })
  analysisResult: Record<string, any>;

  @Prop({ default: '' })
  analysisImageUrl: string;

  @Prop({ default: false })
  isSaved: boolean;
}
export const GroomingRecommendationSchema = SchemaFactory.createForClass(GroomingRecommendation);

// ═══════════ VISUAL ANALYSIS ════════════════════════════

@Schema({ _id: false, timestamps: false })
export class AnalysisMetric {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  severity: string; // mild, moderate, severe

  @Prop({ type: [String], default: [] })
  recommendations: string[];
}
export const AnalysisMetricSchema = SchemaFactory.createForClass(AnalysisMetric);

@Schema({ timestamps: true })
export class VisualAnalysis extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: VisualAnalysisType })
  type: string;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ type: Number, default: 0 })
  overallScore: number;

  @Prop({ type: [AnalysisMetricSchema], default: [] })
  metrics: AnalysisMetric[];

  @Prop({ default: '' })
  summary: string;

  @Prop({ type: [String], default: [] })
  detectedConcerns: string[];

  @Prop({ type: [String], default: [] })
  recommendations: string[];

  @Prop({ type: [String], default: [] })
  productSuggestions: string[];

  @Prop({ type: Object, default: {} })
  detailedResult: Record<string, any>;

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}
export const VisualAnalysisSchema = SchemaFactory.createForClass(VisualAnalysis);
