import { IsOptional, IsString, MaxLength, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User bio',
    example: 'Software engineer and educator',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Learning interests',
    example: ['Web Development', 'Machine Learning'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  interests?: string[];

  @ApiProperty({
    description: 'Learning goals',
    example: ['Master React', 'Learn TypeScript'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  learningGoals?: string[];

  @ApiProperty({
    description: 'Preferred language',
    example: 'en',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({
    description: 'Timezone',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
