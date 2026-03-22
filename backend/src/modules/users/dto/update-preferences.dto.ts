import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({
    description: 'Push notifications enabled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiProperty({
    description: 'Email notifications enabled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({
    description: 'SMS notifications enabled',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}
