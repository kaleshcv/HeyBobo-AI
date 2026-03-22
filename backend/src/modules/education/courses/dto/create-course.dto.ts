import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel } from '@/modules/education/courses/schemas/course.schema';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title', example: 'Web Development 101' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Short description', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Category ID', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Course level',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner',
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({ description: 'Course price', example: 99.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Is free course', example: false })
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({ description: 'Thumbnail image URL', required: false })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Promo video URL', required: false })
  @IsOptional()
  @IsUrl()
  promoVideoUrl?: string;

  @ApiProperty({ description: 'Language code', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Enable certificate', example: true })
  @IsOptional()
  certificateEnabled?: boolean;

  @ApiProperty({ description: 'Tags', example: ['web', 'javascript'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({
    description: 'Learning outcomes',
    example: ['Learn HTML', 'Learn CSS'],
  })
  @IsOptional()
  @IsArray()
  learningOutcomes?: string[];

  @ApiProperty({
    description: 'Prerequisites',
    example: ['JavaScript basics'],
  })
  @IsOptional()
  @IsArray()
  prerequisites?: string[];
}
