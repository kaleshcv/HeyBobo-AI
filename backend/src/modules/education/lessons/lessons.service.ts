import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson } from '@/modules/education/lessons/schemas/lesson.schema';
import { LessonProgress } from '@/modules/education/lessons/schemas/lesson-progress.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(LessonProgress.name) private progressModel: Model<LessonProgress>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
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

    let progress = await this.progressModel.findOne({
      lessonId: new Types.ObjectId(lessonId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!progress) {
      progress = await this.progressModel.create({
        lessonId: new Types.ObjectId(lessonId),
        courseId: lesson.courseId,
        studentId: new Types.ObjectId(studentId),
        ...updateProgressDto,
      });
    } else {
      Object.assign(progress, updateProgressDto);
      if (updateProgressDto.completed && !progress.completedAt) {
        progress.completedAt = new Date();
      }
      await progress.save();
    }

    return progress;
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
