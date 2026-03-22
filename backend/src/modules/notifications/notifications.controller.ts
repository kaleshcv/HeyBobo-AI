import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async findByUser(@CurrentUser('sub') userId: string, @Query('page') page?: number, @Query('limit') limit?: number): Promise<any> {
    return this.notificationsService.findByUser(userId, page, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser('sub') userId: string): Promise<any> {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string): Promise<any> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('sub') userId: string): Promise<any> {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('device-token')
  @ApiOperation({ summary: 'Register device token' })
  async registerDeviceToken(
    @CurrentUser('sub') userId: string,
    @Body() body: { token: string; platform: string },
  ): Promise<any> {
    return this.notificationsService.registerDeviceToken(userId, body.token, body.platform);
  }
}
