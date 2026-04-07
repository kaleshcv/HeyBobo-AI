import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson } from '@/modules/education/lessons/schemas/lesson.schema';
import { LessonProgress } from '@/modules/education/lessons/schemas/lesson-progress.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';
import { Enrollment, EnrollmentStatus } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { User } from '@/modules/users/schemas/user.schema';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(LessonProgress.name) private progressModel: Model<LessonProgress>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(courseId: string, createLessonDto: any, userId: string): Promise<Lesson> {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only add lessons to your own courses');
    }

    const lesson = await this.lessonModel.create({
      ...createLessonDto,
      courseId: new Types.ObjectId(courseId),
    });

    this.logger.log(`Lesson created: ${lesson._id}`);
    return lesson;
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async findBySection(sectionId: string): Promise<Lesson[]> {
    return this.lessonModel.find({ sectionId }).sort({ order: 1 });
  }

  async updateProgress(lessonId: string, studentId: string, updateProgressDto: any): Promise<LessonProgress> {
    const lesson = await this.findOne(lessonId);
    const wasCompleted = false;

    let progress = await this.progressModel.findOne({
      lessonId: new Types.ObjectId(lessonId),
      studentId: new Types.ObjectId(studentId),
    });

    const isNewCompletion = updateProgressDto.completed && (!progress || !progress.completed);

    if (!progress) {
      progress = await this.progressModel.create({
        lessonId: new Types.ObjectId(lessonId),
        courseId: lesson.courseId,
        studentId: new Types.ObjectId(studentId),
        ...updateProgressDto,
        completedAt: updateProgressDto.completed ? new Date() : undefined,
      });
    } else {
      Object.assign(progress, updateProgressDto);
      if (updateProgressDto.completed && !progress.completedAt) {
        progress.completedAt = new Date();
      }
      await progress.save();
    }

    // Cascade: recalculate enrollment progress and update user stats
    if (isNewCompletion) {
      await this.recalculateEnrollmentProgress(lesson.courseId.toString(), studentId);
      await this.userModel.findByIdAndUpdate(studentId, { $inc: { totalLessonsCompleted: 1 } });
    }

    return progress;
  }

  private async recalculateEnrollmentProgress(courseId: string, studentId: string): Promise<void> {
    const [totalLessons, completedLessons] = await Promise.all([
      this.lessonModel.countDocuments({ courseId: new Types.ObjectId(courseId), status: 'published' }),
      this.progressModel.countDocuments({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        completed: true,
      }),
    ]);

    if (totalLessons === 0) return;
    const progressPercent = Math.round((completedLessons / totalLessons) * 100);

    const enrollment = await this.enrollmentModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!enrollment) return;

    const wasNotCompleted = enrollment.status !== EnrollmentStatus.COMPLETED;
    enrollment.progressPercent = progressPercent;

    if (progressPercent === 100 && wasNotCompleted) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
      await this.userModel.findByIdAndUpdate(studentId, { $inc: { completedCoursesCount: 1 } });
    }

    await enrollment.save();
  }

  async getProgress(lessonId: string, studentId: string): Promise<LessonProgress | null> {
    return this.progressModel.findOne({
      lessonId: new Types.ObjectId(lessonId),
      studentId: new Types.ObjectId(studentId),
    });
  }

  async update(id: string, updateLessonDto: any, userId: string): Promise<Lesson> {
    const lesson = await this.findOne(id);
    const course = await this.courseModel.findById(lesson.courseId);
    if (course?.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own lessons');
    }

    Object.assign(lesson, updateLessonDto);
    await lesson.save();
    return lesson;
  }

  async delete(id: string, userId: string): Promise<void> {
    const lesson = await this.findOne(id);
    const course = await this.courseModel.findById(lesson.courseId);
    if (course?.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own lessons');
    }

    await this.lessonModel.deleteOne({ _id: id });
    this.logger.log(`Lesson deleted: ${id}`);
  }
}
