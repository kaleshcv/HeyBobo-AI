import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityLog } from '@/modules/analytics/schemas/activity-log.schema';
import { Enrollment } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';
import { User } from '@/modules/users/schemas/user.schema';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async trackEvent(
    userId: string,
    event: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, any>,
    ip?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    const log = await this.activityLogModel.create({
      userId: new Types.ObjectId(userId),
      event,
      entityType,
      entityId,
      metadata: metadata || {},
      ip,
      userAgent,
    });

    return log;
  }

  async getPlatformStats(): Promise<any> {
    const totalUsers = await this.userModel.countDocuments();
    const totalCourses = await this.courseModel.countDocuments();
    const totalEnrollments = await this.enrollmentModel.countDocuments();

    const completedEnrollments = await this.enrollmentModel.countDocuments({
      status: 'completed',
    });

    const totalRevenue = await this.enrollmentModel.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $arrayElemAt: ['$course.price', 0] },
          },
        },
      },
    ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  async getTeacherStats(teacherId: string): Promise<any> {
    const courses = await this.courseModel.find({
      teacherId: new Types.ObjectId(teacherId),
    });

    const courseIds = courses.map((c) => c._id);

    const enrollments = await this.enrollmentModel.find({
      courseId: { $in: courseIds },
    });

    const completedEnrollments = enrollments.filter((e) => e.status === 'completed');

    const courseIds_arr = courses.map((c) => c._id);
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price * course.enrollmentCount || 0), 0);

    return {
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      completedEnrollments: completedEnrollments.length,
      completionRate: enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0,
      totalRevenue,
      avgRating: courses.reduce((sum, c) => sum + c.ratingAvg, 0) / courses.length || 0,
      courses: courses.map((c) => ({
        id: c._id,
        title: c.title,
        enrollments: c.enrollmentCount,
        rating: c.ratingAvg,
        price: c.price,
      })),
    };
  }

  async getUserActivity(userId: string, days: number = 7): Promise<any> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const activities = await this.activityLogModel
      .find({
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: date },
      })
      .sort({ createdAt: -1 });

    const eventCounts = activities.reduce(
      (acc, activity) => {
        acc[activity.event] = (acc[activity.event] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalActivities: activities.length,
      eventCounts,
      activities,
    };
  }

  async getCourseAnalytics(courseId: string): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) return null;

    const enrollments = await this.enrollmentModel.find({
      courseId: new Types.ObjectId(courseId),
    });

    const completedEnrollments = enrollments.filter((e) => e.status === 'completed');

    const avgProgress = enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrollments.length : 0;

    return {
      title: course.title,
      totalEnrollments: enrollments.length,
      completedEnrollments: completedEnrollments.length,
      completionRate: enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0,
      avgProgress,
      rating: course.ratingAvg,
      ratingCount: course.ratingCount,
      revenue: course.price * course.enrollmentCount,
    };
  }
}
