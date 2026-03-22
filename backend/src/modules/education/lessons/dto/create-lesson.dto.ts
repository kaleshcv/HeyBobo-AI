import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LessonType } from '@/modules/education/lessons/schemas/lesson.schema';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Lesson description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Lesson type', enum: ['video', 'text', 'pdf', 'mixed'] })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiProperty({ description: 'Video asset ID', required: false })
  @IsOptional()
  @IsString()
  videoAssetId?: string;

  @ApiProperty({ description: 'Transcript', required: false })
  @IsOptional()
  @IsString()
  transcript?: string;

  @ApiProperty({ description: 'Content HTML', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Duration in seconds', example: 3600 })
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @ApiProperty({ description: 'Display order' })
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Is preview lesson', example: false })
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({ description: 'Resources', required: false })
  @IsOptional()
  @IsArray()
  resources?: any[];
}
