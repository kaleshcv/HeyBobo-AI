import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Course, CourseStatus } from '@/modules/education/courses/schemas/course.schema';
import { Section } from '@/modules/education/sections/schemas/section.schema';
import { Lesson } from '@/modules/education/lessons/schemas/lesson.schema';
import { CreateCourseDto } from '@/modules/education/courses/dto/create-course.dto';
import { UpdateCourseDto } from '@/modules/education/courses/dto/update-course.dto';
import { QueryCoursesDto } from '@/modules/education/courses/dto/query-courses.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
  ) {}

  async create(createCourseDto: CreateCourseDto, teacherId: string): Promise<Course> {
    const slug = slugify(createCourseDto.title, { lower: true, strict: true });

    // Check if slug already exists
    const existingCourse = await this.courseModel.findOne({ slug });
    if (existingCourse) {
      throw new BadRequestException('Course title already exists');
    }

    const course = await this.courseModel.create({
      ...createCourseDto,
      slug,
      teacherId: new Types.ObjectId(teacherId),
      categoryId: new Types.ObjectId(createCourseDto.categoryId),
      status: CourseStatus.DRAFT,
    });

    this.logger.log(`Course created: ${course._id}`);
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, teacherId: string): Promise<Course> {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    if (updateCourseDto.title && updateCourseDto.title !== course.title) {
      const slug = slugify(updateCourseDto.title, { lower: true, strict: true });
      const existingCourse = await this.courseModel.findOne({
        slug,
        _id: { $ne: course._id },
      });
      if (existingCourse) {
        throw new BadRequestException('Course title already exists');
      }
      (updateCourseDto as any).slug = slug;
    }

    Object.assign(course, updateCourseDto);
    await course.save();

    this.logger.log(`Course updated: ${id}`);
    return course;
  }

  async delete(id: string, teacherId: string): Promise<void> {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    course.status = CourseStatus.ARCHIVED;
    await course.save();

    this.logger.log(`Course archived: ${id}`);
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).populate('categoryId', 'name slug');

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findBySlug(slug: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({ slug, status: CourseStatus.PUBLISHED })
      .populate('categoryId', 'name slug')
      .populate('teacherId', 'name email');

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getFullCourseStructure(courseId: string, studentId?: string): Promise<any> {
    const course = await this.courseModel
      .findById(courseId)
      .populate('categoryId')
      .populate('teacherId', 'name email');

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const sections = await this.sectionModel.find({ courseId }).sort({ order: 1 });

    const sectionsWithLessons = await Promise.all(
      sections.map(async (section) => {
        const lessons = await this.lessonModel
          .find({ sectionId: section._id })
          .sort({ order: 1 });

        return {
          ...section.toObject(),
          lessons: lessons.map((lesson) => ({
            ...lesson.toObject(),
            videoPlaybackId: studentId ? lesson.videoPlaybackId : null,
          })),
        };
      }),
    );

    return {
      ...course.toObject(),
      sections: sectionsWithLessons,
    };
  }

  async findAll(query: QueryCoursesDto): Promise<{ data: Course[]; total: number; page: number; limit: number }> {
    const {
      search,
      categoryId,
      level,
      language,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter: any = {
      status: CourseStatus.PUBLISHED,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (level) {
      filter.level = level;
    }

    if (language) {
      filter.language = language;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      filter.ratingAvg = { $gte: minRating };
    }

    const total = await this.courseModel.countDocuments(filter);

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const courses = await this.courseModel
      .find(filter)
      .populate('categoryId', 'name slug')
      .populate('teacherId', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return {
      data: courses,
      total,
      page,
      limit,
    };
  }

  async getFeatured(): Promise<Course[]> {
    return this.courseModel
      .find({
        status: CourseStatus.PUBLISHED,
      })
      .populate('categoryId', 'name slug')
      .populate('teacherId', 'name email')
      .sort({ enrollmentCount: -1 })
      .limit(10);
  }

  async getRecommended(studentId: string, limit: number = 10): Promise<Course[]> {
    // Simplified - in production use ML recommendations
    return this.courseModel
      .find({ status: CourseStatus.PUBLISHED })
      .populate('categoryId', 'name slug')
      .populate('teacherId', 'name email')
      .sort({ ratingAvg: -1 })
      .limit(limit);
  }

  async publishForReview(id: string, teacherId: string): Promise<Course> {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only submit your own courses');
    }

    course.status = CourseStatus.UNDER_REVIEW;
    await course.save();

    this.logger.log(`Course submitted for review: ${id}`);
    return course;
  }

  async getTeacherCourses(teacherId: string, query?: { page?: number; limit?: number }): Promise<any> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const courses = await this.courseModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.courseModel.countDocuments({
      teacherId: new Types.ObjectId(teacherId),
    });

    return { data: courses, total, page, limit };
  }

  async getTeacherCourseAnalytics(courseId: string, teacherId: string): Promise<any> {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only view analytics for your own courses');
    }

    // Simplified analytics - in production aggregate from enrollments
    return {
      courseId: course._id,
      title: course.title,
      enrollments: course.enrollmentCount,
      rating: course.ratingAvg,
      ratingCount: course.ratingCount,
      revenue: course.price * course.enrollmentCount,
    };
  }

  async incrementEnrollmentCount(courseId: string): Promise<void> {
    await this.courseModel.findByIdAndUpdate(
      courseId,
      { $inc: { enrollmentCount: 1 } },
    );
  }
}
