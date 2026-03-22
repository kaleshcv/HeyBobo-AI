import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { createDiskStorage } from '@/common/storage/multer.config';
import { UsersService } from '@/modules/users/users.service';
import { UpdateProfileDto } from '@/modules/users/dto/update-profile.dto';
import { UpdatePreferencesDto } from '@/modules/users/dto/update-preferences.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string): Promise<any> {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUser('sub') userId: string,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<any> {
    return this.usersService.updatePreferences(userId, updatePreferencesDto);
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Get user dashboard data' })
  async getDashboard(@CurrentUser('sub') userId: string): Promise<any> {
    return this.usersService.getDashboard(userId);
  }

  @Get('me/learning-stats')
  @ApiOperation({ summary: 'Get user learning statistics' })
  async getLearningStats(@CurrentUser('sub') userId: string): Promise<any> {
    return this.usersService.getLearningStats(userId);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: createDiskStorage('avatars') }))
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(userId, avatarUrl);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get public user profile' })
  async getPublicProfile(@Param('id') userId: string): Promise<any> {
    return this.usersService.getPublicProfile(userId);
  }
}
