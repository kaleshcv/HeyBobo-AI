import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  CREATOR = 'creator',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  COLLEGE_ADMIN = 'college_admin',
}

@Schema({ _id: false, timestamps: false })
export class AuthProvider {
  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  providerId: string;

  @Prop()
  email?: string;
}

const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider);

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: false, select: false })
  passwordHash?: string;

  @Prop({
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT,
    index: true,
  })
  role: UserRole;

  @Prop({
    required: true,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING,
    index: true,
  })
  status: UserStatus;

  @Prop({ type: [AuthProviderSchema], default: [] })
  authProviders: AuthProvider[];

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ status: 1, createdAt: -1 });

// Transform to JSON
UserSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});
