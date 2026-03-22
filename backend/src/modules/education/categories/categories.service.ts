import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Category, CategoryStatus } from '@/modules/education/categories/schemas/category.schema';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) {}

  async create(createCategoryDto: any): Promise<Category> {
    const slug = slugify(createCategoryDto.name, { lower: true, strict: true });

    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new BadRequestException('Category already exists');
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      slug,
      status: CategoryStatus.ACTIVE,
    });

    this.logger.log(`Category created: ${category._id}`);
    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find({ status: CategoryStatus.ACTIVE })
      .sort({ order: 1 });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({
      slug,
      status: CategoryStatus.ACTIVE,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
