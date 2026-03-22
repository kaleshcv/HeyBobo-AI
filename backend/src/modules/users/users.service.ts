import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { UserProfile } from '@/modules/users/schemas/user-profile.schema';
import { UpdateProfileDto } from '@/modules/users/dto/update-profile.dto';
import { UpdatePreferencesDto } from '@/modules/users/dto/update-preferences.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfile>,
  ) {}

  async createUserProfile(userId: Types.ObjectId): Promise<UserProfile> {
    return this.userProfileModel.create({
      userId,
      notificationPreferences: {
        push: true,
        email: true,
        sms: false,
      },
    });
  }

  async getProfile(userId: string): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const user = await this.userModel.findById(objectId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.userProfileModel.findOne({ userId: objectId });

    return {
      ...user.toJSON(),
      profile,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const profile = await this.userProfileModel.findOneAndUpdate(
      { userId: objectId },
      { $set: updateProfileDto },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    this.logger.log(`Profile updated for user: ${userId}`);

    return profile;
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const profile = await this.userProfileModel.findOneAndUpdate(
      { userId: objectId },
      { $set: { 'notificationPreferences': updatePreferencesDto } },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile.notificationPreferences;
  }

  async getDashboard(userId: string): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const user = await this.userModel.findById(objectId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.userProfileModel.findOne({ userId: objectId });

    return {
      user: user.toJSON(),
      profile,
      stats: {
        enrolledCourses: 0,
        completedCourses: 0,
        currentStreak: profile?.currentStreak || 0,
        longestStreak: profile?.longestStreak || 0,
        totalWatchTime: profile?.totalWatchTimeMinutes || 0,
      },
    };
  }

  async getLearningStats(userId: string): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const profile = await this.userProfileModel.findOne({ userId: objectId });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      totalWatchTimeMinutes: profile.totalWatchTimeMinutes,
      lastActivityAt: profile.lastActivityAt,
    };
  }

  async getPublicProfile(userId: string): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const user = await this.userModel.findById(objectId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.userProfileModel.findOne({ userId: objectId });

    return {
      id: user._id,
      name: user.name,
      role: user.role,
      profile: {
        bio: profile?.bio,
        avatarUrl: profile?.avatarUrl,
        interests: profile?.interests,
      },
    };
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<any> {
    const objectId = new Types.ObjectId(userId);

    const profile = await this.userProfileModel.findOneAndUpdate(
      { userId: objectId },
      { $set: { avatarUrl } },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
