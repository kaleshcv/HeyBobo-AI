import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Section } from '@/modules/education/sections/schemas/section.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(courseId: string, createSectionDto: any, userId: string): Promise<Section> {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only add sections to your own courses');
    }

    const section = await this.sectionModel.create({
      ...createSectionDto,
      courseId: new Types.ObjectId(courseId),
    });

    this.logger.log(`Section created: ${section._id}`);
    return section;
  }

  async findByCourse(courseId: string): Promise<Section[]> {
    return this.sectionModel.find({ courseId }).sort({ order: 1 });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.sectionModel.findById(id);
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: string, updateSectionDto: any, userId: string): Promise<Section> {
    const section = await this.findOne(id);
    const course = await this.courseModel.findById(section.courseId);
    if (course?.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own sections');
    }

    Object.assign(section, updateSectionDto);
    await section.save();
    return section;
  }

  async delete(id: string, userId: string): Promise<void> {
    const section = await this.findOne(id);
    const course = await this.courseModel.findById(section.courseId);
    if (course?.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own sections');
    }

    await this.sectionModel.deleteOne({ _id: id });
    this.logger.log(`Section deleted: ${id}`);
  }
}
