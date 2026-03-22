import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ description: 'Watched seconds', example: 1800 })
  @IsOptional()
  @IsNumber()
  watchedSeconds?: number;

  @ApiProperty({ description: 'Lesson completed', example: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
