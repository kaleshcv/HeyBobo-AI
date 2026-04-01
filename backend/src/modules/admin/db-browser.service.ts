import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';

@Injectable()
export class DbBrowserService {
  constructor(
    // We access the native DB connection through an already-injected model
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  private get db() { return this.userModel.db.db!; }

  /** List all collections in the database */
  async listCollections(): Promise<Array<{ name: string; count: number }>> {
    const collections = await this.db.listCollections().toArray();
    const results = await Promise.all(
      collections.map(async (col) => {
        const count = await this.db.collection(col.name).countDocuments();
        return { name: col.name, count };
      }),
    );
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Query a collection with pagination, search and sorting */
  async queryCollection(
    collectionName: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      sortDir?: 'asc' | 'desc';
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; limit: number; pages: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;
    const col = this.db.collection(collectionName);

    let filter: any = {};
    if (options.search && options.searchField) {
      filter[options.searchField] = { $regex: options.search, $options: 'i' };
    } else if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { title: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
        { topic: { $regex: options.search, $options: 'i' } },
      ];
    }

    const sortField = options.sortField || 'createdAt';
    const sortDir = options.sortDir === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      col
        .find(filter)
        .sort({ [sortField]: sortDir } as any)
        .skip(skip)
        .limit(limit)
        .toArray(),
      col.countDocuments(filter),
    ]);

    return {
      data: docs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /** Get a single document by _id */
  async getDocument(collectionName: string, id: string): Promise<any> {
    const { Types } = await import('mongoose');
    const col = this.db.collection(collectionName);
    let filter: any = {};
    try {
      filter = { _id: new Types.ObjectId(id) };
    } catch {
      filter = { _id: id };
    }
    return col.findOne(filter);
  }

  /** Delete a single document by _id */
  async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    const { Types } = await import('mongoose');
    const col = this.db.collection(collectionName);
    let filter: any = {};
    try {
      filter = { _id: new Types.ObjectId(id) };
    } catch {
      filter = { _id: id };
    }
    const result = await col.deleteOne(filter);
    return result.deletedCount > 0;
  }
}
