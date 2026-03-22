import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from '@/modules/analytics/analytics.controller';
import { AnalyticsService } from '@/modules/analytics/analytics.service';
import { ActivityLog, ActivityLogSchema } from '@/modules/analytics/schemas/activity-log.schema';
import { Enrollment, EnrollmentSchema } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { Course, CourseSchema } from '@/modules/education/courses/schemas/course.schema';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
