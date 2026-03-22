import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsArray, IsString, IsNumber, IsBoolean, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  SkinType,
  SkinConcern,
  HairType,
  FaceShape,
  BodyType,
  StylePreference,
  Season,
  RecommendationType,
  VisualAnalysisType,
} from '../schemas/grooming.schema';

// ═══════════ PROFILE SUB-DTOS ════════════════════════════

export class SkincareProfileDto {
  @ApiPropertyOptional({ enum: SkinType })
  @IsOptional()
  @IsEnum(SkinType)
  skinType?: string;

  @ApiPropertyOptional({ type: [String], enum: SkinConcern })
  @IsOptional()
  @IsArray()
  concerns?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sunExposure?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  veganOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  allergies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentRoutine?: string;
}

export class HaircareProfileDto {
  @ApiPropertyOptional({ enum: HairType })
  @IsOptional()
  @IsEnum(HairType)
  hairType?: string;

  @ApiPropertyOptional({ enum: FaceShape })
  @IsOptional()
  @IsEnum(FaceShape)
  faceShape?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasFacialHair?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facialHairStyle?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  hairConcerns?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stylingPreference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentProducts?: string;
}

export class OutfitProfileDto {
  @ApiPropertyOptional({ enum: BodyType })
  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: string;

  @ApiPropertyOptional({ type: [String], enum: StylePreference })
  @IsOptional()
  @IsArray()
  stylePreferences?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  favoriteColors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skinTone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sustainableOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  occasions?: string[];
}

// ═══════════ SAVE PROFILE ════════════════════════════════

export class SaveGroomingProfileDto {
  @ApiPropertyOptional({ type: SkincareProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SkincareProfileDto)
  skincare?: SkincareProfileDto;

  @ApiPropertyOptional({ type: HaircareProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HaircareProfileDto)
  haircare?: HaircareProfileDto;

  @ApiPropertyOptional({ type: OutfitProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OutfitProfileDto)
  outfit?: OutfitProfileDto;

  @ApiPropertyOptional({ enum: Season })
  @IsOptional()
  @IsEnum(Season)
  currentSeason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  age?: number;
}

// ═══════════ SAVE RECOMMENDATION ═════════════════════════

export class SaveRecommendationDto {
  @ApiProperty({ enum: RecommendationType })
  @IsEnum(RecommendationType)
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  routine?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  products?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  outfits?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tips?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seasonalAdvice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  analysisResult?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  analysisImageUrl?: string;
}

// ═══════════ QUERY RECOMMENDATIONS ═══════════════════════

export class QueryRecommendationsDto {
  @ApiPropertyOptional({ enum: RecommendationType })
  @IsOptional()
  @IsEnum(RecommendationType)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  savedOnly?: boolean;
}

// ═══════════ VISUAL ANALYSIS ═════════════════════════════

export class AnalysisMetricDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  recommendations?: string[];
}

export class SaveVisualAnalysisDto {
  @ApiProperty({ enum: VisualAnalysisType })
  @IsEnum(VisualAnalysisType)
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @ApiPropertyOptional({ type: [AnalysisMetricDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalysisMetricDto)
  metrics?: AnalysisMetricDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  detectedConcerns?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  recommendations?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  productSuggestions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  detailedResult?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class QueryVisualAnalysisDto {
  @ApiPropertyOptional({ enum: VisualAnalysisType })
  @IsOptional()
  @IsEnum(VisualAnalysisType)
  type?: string;
}
