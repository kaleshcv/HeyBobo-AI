import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from '@/modules/education/reviews/schemas/review.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(courseId: string, studentId: string, createReviewDto: any): Promise<Review> {
    const existingReview = await this.reviewModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this course');
    }

    const review = await this.reviewModel.create({
      ...createReviewDto,
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    // Update course rating
    await this.updateCourseRating(courseId);

    this.logger.log(`Review created: ${review._id}`);
    return review;
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).populate('studentId', 'name');
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async findByCourse(courseId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const reviews = await this.reviewModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.reviewModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
    });

    return { data: reviews, total, page, limit };
  }

  async update(id: string, studentId: string, updateReviewDto: any): Promise<Review> {
    const review = await this.findOne(id);

    if (review.studentId.toString() !== studentId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    await review.save();

    // Update course rating
    await this.updateCourseRating(review.courseId.toString());

    return review;
  }

  async delete(id: string, studentId: string): Promise<void> {
    const review = await this.findOne(id);

    if (review.studentId.toString() !== studentId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewModel.deleteOne({ _id: id });
    await this.updateCourseRating(review.courseId.toString());

    this.logger.log(`Review deleted: ${id}`);
  }

  async markHelpful(id: string, userId: string): Promise<Review> {
    const review = await this.findOne(id);

    if (!review.helpful.includes(new Types.ObjectId(userId))) {
      review.helpful.push(new Types.ObjectId(userId));
      await review.save();
    }

    return review;
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    const reviews = await this.reviewModel.find({
      courseId: new Types.ObjectId(courseId),
    });

    if (reviews.length === 0) {
      await this.courseModel.findByIdAndUpdate(courseId, {
        ratingAvg: 0,
        ratingCount: 0,
      });
      return;
    }

    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await this.courseModel.findByIdAndUpdate(courseId, {
      ratingAvg: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
    });
  }
}
