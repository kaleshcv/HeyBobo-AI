import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentStatus } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async enroll(courseId: string, studentId: string): Promise<Enrollment> {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const existingEnrollment = await this.enrollmentModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = await this.enrollmentModel.create({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
      enrolledAt: new Date(),
      status: EnrollmentStatus.ACTIVE,
    });

    // Increment enrollment count
    await this.courseModel.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    this.logger.log(`Student ${studentId} enrolled in course ${courseId}`);
    return enrollment;
  }

  async getStudentEnrollments(studentId: string, query?: any): Promise<any> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const enrollments = await this.enrollmentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('courseId')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.enrollmentModel.countDocuments({
      studentId: new Types.ObjectId(studentId),
    });

    return { data: enrollments, total, page, limit };
  }

  async getEnrollment(courseId: string, studentId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async updateProgress(courseId: string, studentId: string, progressPercent: number): Promise<Enrollment> {
    const enrollment = await this.getEnrollment(courseId, studentId);

    enrollment.progressPercent = progressPercent;
    if (progressPercent === 100 && enrollment.status === EnrollmentStatus.ACTIVE) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    return enrollment;
  }

  async markCompleted(courseId: string, studentId: string): Promise<Enrollment> {
    const enrollment = await this.getEnrollment(courseId, studentId);

    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.completedAt = new Date();
    enrollment.progressPercent = 100;

    await enrollment.save();
    this.logger.log(`Course ${courseId} completed by student ${studentId}`);
    return enrollment;
  }
}
