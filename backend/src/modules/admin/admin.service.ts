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

  // ─── DB Browser ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  private get nativeDb() { return this.userModel.db.db!; }

  async dbListCollections(): Promise<Array<{ name: string; count: number }>> {
    const cols = await this.nativeDb.listCollections().toArray();
    const results = await Promise.all(
      cols.map(async (c) => ({
        name: c.name,
        count: await this.nativeDb.collection(c.name).countDocuments(),
      })),
    );
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  async dbQueryCollection(collectionName: string, opts: {
    page?: number; limit?: number; search?: string;
    searchField?: string; sortField?: string; sortDir?: 'asc' | 'desc';
  } = {}): Promise<any> {
    const page = Math.max(1, Number(opts.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(opts.limit) || 20));
    const skip = (page - 1) * limit;
    const col = this.nativeDb.collection(collectionName);

    let filter: any = {};
    if (opts.search && opts.searchField) {
      filter[opts.searchField] = { $regex: opts.search, $options: 'i' };
    } else if (opts.search) {
      filter.$or = [
        { name: { $regex: opts.search, $options: 'i' } },
        { title: { $regex: opts.search, $options: 'i' } },
        { email: { $regex: opts.search, $options: 'i' } },
        { topic: { $regex: opts.search, $options: 'i' } },
      ];
    }

    const sortField = opts.sortField || 'createdAt';
    const sortDir = opts.sortDir === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      col.find(filter).sort({ [sortField]: sortDir } as any).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);
    return { data: docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async dbGetDocument(collectionName: string, id: string): Promise<any> {
    const col = this.nativeDb.collection(collectionName);
    let filter: any;
    try { filter = { _id: new Types.ObjectId(id) }; } catch { filter = { _id: id }; }
    return col.findOne(filter);
  }

  async dbDeleteDocument(collectionName: string, id: string): Promise<boolean> {
    const col = this.nativeDb.collection(collectionName);
    let filter: any;
    try { filter = { _id: new Types.ObjectId(id) }; } catch { filter = { _id: id }; }
    const result = await col.deleteOne(filter);
    return result.deletedCount > 0;
  }
  // ─── End DB Browser ─────────────────────────────────────

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
