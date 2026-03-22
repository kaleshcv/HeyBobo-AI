import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from '@/modules/analytics/analytics.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Track event' })
  async trackEvent(@Body() body: any, @CurrentUser('sub') userId: string): Promise<any> {
    const { event, entityType, entityId, metadata, ip, userAgent } = body;
    return this.analyticsService.trackEvent(userId, event, entityType, entityId, metadata, ip, userAgent);
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity' })
  async getUserActivity(
    @CurrentUser('sub') userId: string,
    @Query('days') days?: number,
  ): Promise<any> {
    return this.analyticsService.getUserActivity(userId, days || 7);
  }

  @Roles(UserRole.ADMIN)
  @Get('platform')
  @ApiOperation({ summary: 'Get platform stats' })
  async getPlatformStats(): Promise<any> {
    return this.analyticsService.getPlatformStats();
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get teacher stats' })
  async getTeacherStats(@Param('teacherId') teacherId: string): Promise<any> {
    return this.analyticsService.getTeacherStats(teacherId);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get course analytics' })
  async getCourseAnalytics(@Param('courseId') courseId: string): Promise<any> {
    return this.analyticsService.getCourseAnalytics(courseId);
  }
}
