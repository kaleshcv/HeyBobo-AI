import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationChannel } from '@/modules/notifications/schemas/notification.schema';
import { DeviceToken } from '@/modules/notifications/schemas/device-token.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceToken>,
  ) {}

  async create(createNotificationDto: any): Promise<Notification> {
    const notification = await this.notificationModel.create({
      ...createNotificationDto,
      userId: new Types.ObjectId(createNotificationDto.userId),
      read: false,
      createdAt: new Date(),
    });

    this.logger.log(`Notification created: ${notification._id}`);
    return notification;
  }

  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const notifications = await this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    return { data: notifications, total, page, limit };
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true },
    );

    return notification!;
  }

  async markAllAsRead(userId: string): Promise<any> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true, readAt: new Date() },
    );

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });

    return { count };
  }

  async registerDeviceToken(userId: string, token: string, platform: string): Promise<DeviceToken> {
    let deviceToken = await this.deviceTokenModel.findOne({ token });

    if (deviceToken) {
      deviceToken.userId = new Types.ObjectId(userId);
      deviceToken.isActive = true;
      await deviceToken.save();
    } else {
      deviceToken = await this.deviceTokenModel.create({
        userId: new Types.ObjectId(userId),
        token,
        platform,
        isActive: true,
      });
    }

    return deviceToken;
  }

  async getDeviceTokens(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }
}
