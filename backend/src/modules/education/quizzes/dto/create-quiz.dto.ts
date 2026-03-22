import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ description: 'Quiz title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Quiz description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Pass percentage', example: 60 })
  @IsOptional()
  @IsNumber()
  passPercentage?: number;

  @ApiProperty({ description: 'Attempt limit', example: 3 })
  @IsOptional()
  @IsNumber()
  attemptLimit?: number;

  @ApiProperty({ description: 'Time limit in minutes', example: 30 })
  @IsOptional()
  @IsNumber()
  timeLimitMinutes?: number;
}
