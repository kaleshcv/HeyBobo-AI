import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Quiz answers',
    example: [
      { questionId: '507f1f77bcf86cd799439011', answer: ['option1'] },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  answers: Array<{ questionId: string; answer: string[] }>;

  @ApiProperty({ description: 'Quiz start time' })
  @IsNotEmpty()
  startedAt: Date;
}
