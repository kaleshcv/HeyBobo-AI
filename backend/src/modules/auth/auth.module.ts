import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from '@/modules/auth/schemas/refresh-token.schema';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@/modules/auth/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '@/modules/auth/strategies/google.strategy';
import { UsersModule } from '@/modules/users/users.module';

const optionalProviders = [];
if (process.env.GOOGLE_CLIENT_ID) {
  optionalProviders.push(GoogleStrategy);
}

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, ...optionalProviders],
  exports: [AuthService],
})
export class AuthModule {}
