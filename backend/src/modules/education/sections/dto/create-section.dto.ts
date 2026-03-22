import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section title', example: 'Introduction to Web Development' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Section description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Display order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  order: number;
}
