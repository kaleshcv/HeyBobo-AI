import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from '@/modules/admin/admin.service';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query('page') page?: number, @Query('limit') limit?: number): Promise<any> {
    return this.adminService.getUsers({ page, limit });
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateUserStatus(@Param('id') userId: string, @Body() body: { status: string }): Promise<any> {
    return this.adminService.updateUserStatus(userId, body.status as any);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateUserRole(@Param('id') userId: string, @Body() body: { role: string }): Promise<any> {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Get('courses/pending-review')
  @ApiOperation({ summary: 'Get courses pending review' })
  async getCoursesForReview(): Promise<any> {
    return this.adminService.getCoursesForReview();
  }

  @Patch('courses/:id/approve')
  @ApiOperation({ summary: 'Approve course' })
  async approveCourse(@Param('id') courseId: string): Promise<any> {
    return this.adminService.approveCourse(courseId);
  }

  @Patch('courses/:id/reject')
  @ApiOperation({ summary: 'Reject course' })
  async rejectCourse(
    @Param('id') courseId: string,
    @Body() body: { rejectionReason: string },
  ): Promise<any> {
    return this.adminService.rejectCourse(courseId, body.rejectionReason);
  }

  @Patch('courses/:id/publish')
  @ApiOperation({ summary: 'Publish course' })
  async publishCourse(@Param('id') courseId: string): Promise<any> {
    return this.adminService.publishCourse(courseId);
  }

  @Patch('courses/:id/toggle-featured')
  @ApiOperation({ summary: 'Toggle course featured status' })
  async toggleFeatured(@Param('id') courseId: string): Promise<any> {
    return this.adminService.toggleFeaturedCourse(courseId);
  }
}
