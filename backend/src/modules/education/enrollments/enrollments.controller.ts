import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EnrollmentsService } from '@/modules/education/enrollments/enrollments.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth('access-token')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId')
  @ApiOperation({ summary: 'Enroll in course' })
  async enroll(@Param('courseId') courseId: string, @CurrentUser('sub') userId: string): Promise<any> {
    return this.enrollmentsService.enroll(courseId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get student enrollments' })
  async getEnrollments(@CurrentUser('sub') userId: string): Promise<any> {
    return this.enrollmentsService.getStudentEnrollments(userId);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get enrollment details' })
  async getEnrollment(
    @Param('courseId') courseId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.enrollmentsService.getEnrollment(courseId, userId);
  }
}
