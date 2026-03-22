import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssignmentDto {
  @ApiProperty({ description: 'File URLs', example: ['https://...'], required: false })
  @IsOptional()
  @IsArray()
  fileUrls?: string[];

  @ApiProperty({ description: 'Text response', required: false })
  @IsOptional()
  @IsString()
  textResponse?: string;
}
