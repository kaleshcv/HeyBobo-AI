import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsArray, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubmissionType } from '@/modules/education/assignments/schemas/assignment.schema';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Assignment title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Instructions', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Due date' })
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({ description: 'Submission type', enum: ['file', 'text', 'both'] })
  @IsEnum(SubmissionType)
  submissionType: SubmissionType;

  @ApiProperty({ description: 'Max file size', example: 10485760 })
  @IsOptional()
  @IsNumber()
  maxFileSize?: number;

  @ApiProperty({ description: 'Allowed file types', example: ['pdf', 'doc', 'docx'] })
  @IsOptional()
  @IsArray()
  allowedFileTypes?: string[];
}
