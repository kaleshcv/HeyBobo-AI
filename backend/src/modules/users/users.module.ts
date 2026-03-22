import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from '@/modules/users/users.controller';
import { UsersService } from '@/modules/users/users.service';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { UserProfile, UserProfileSchema } from '@/modules/users/schemas/user-profile.schema';
import { College, CollegeSchema } from '@/modules/users/schemas/college.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: College.name, schema: CollegeSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
