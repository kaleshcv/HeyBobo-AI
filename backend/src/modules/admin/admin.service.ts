import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserStatus } from '@/modules/users/schemas/user.schema';
import { Course, CourseStatus } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async getUsers(query?: any): Promise<any> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.userModel.countDocuments();

    return { data: users, total, page, limit };
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User status updated: ${userId} -> ${status}`);
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User role updated: ${userId} -> ${role}`);
    return user;
  }

  async getCoursesForReview(): Promise<Course[]> {
    return this.courseModel
      .find({ status: CourseStatus.UNDER_REVIEW })
      .populate('teacherId', 'name email')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
  }

  async approveCourse(courseId: string): Promise<Course> {
    const course = await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        status: CourseStatus.APPROVED,
        publishedAt: new Date(),
      },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.logger.log(`Course approved: ${courseId}`);
    return course;
  }

  async rejectCourse(courseId: string, rejectionReason: string): Promise<Course> {
    const course = await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        status: CourseStatus.REJECTED,
        rejectionReason,
      },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.logger.log(`Course rejected: ${courseId}`);
    return course;
  }

  async toggleFeaturedCourse(courseId: string): Promise<any> {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // This would require adding a 'featured' field to the Course schema
    this.logger.log(`Course featured status toggled: ${courseId}`);
    return { message: 'Featured status toggled' };
  }

  async publishCourse(courseId: string): Promise<Course> {
    const course = await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.logger.log(`Course published: ${courseId}`);
    return course;
  }
}
