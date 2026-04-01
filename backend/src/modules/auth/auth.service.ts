import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, UserStatus } from '@/modules/users/schemas/user.schema';
import { RefreshToken } from '@/modules/auth/schemas/refresh-token.schema';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
import { UsersService } from '@/modules/users/users.service';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, username, role } = registerDto;

    // Check if email already exists
    const existingEmail = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.userModel.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userRole = (role as UserRole) || UserRole.STUDENT;
    const user = await this.userModel.create({
      name: `${firstName} ${lastName}`.trim(),
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });

    // Create user profile
    await this.usersService.createUserProfile(user._id as Types.ObjectId);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User registered: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const { identifier, password } = loginDto;

    // Find user by email or username
    const lowerIdentifier = identifier.toLowerCase();
    const user = await this.userModel.findOne({
      $or: [
        { email: lowerIdentifier },
        { username: lowerIdentifier },
      ],
    }).select('+passwordHash');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash!);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`User account is ${user.status}`);
    }

    // Generate tokens and store refresh token
    const tokens = await this.generateTokens(user, ip, userAgent);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refresh(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    // Verify refresh token in DB
    const tokenRecord = await this.refreshTokenModel.findOne({
      token: refreshToken,
      isRevoked: false,
    });

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify JWT
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.userModel.findById(tokenRecord.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old token
    await this.refreshTokenModel.updateOne(
      { _id: tokenRecord._id },
      { isRevoked: true },
    );

    // Generate new tokens
    const tokens = await this.generateTokens(user, ip, userAgent);

    this.logger.log(`Token refreshed for user: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.refreshTokenModel.updateOne(
        { token: refreshToken },
        { isRevoked: true },
      );
    }

    this.logger.log(`User logged out: ${userId}`);
  }

  async googleLogin(profile: any): Promise<AuthResponse> {
    let user = await this.userModel.findOne({ email: profile.email });

    if (!user) {
      // Create new user from Google profile
      const googleUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      // Ensure unique username
      let finalUsername = googleUsername;
      let counter = 1;
      while (await this.userModel.findOne({ username: finalUsername })) {
        finalUsername = `${googleUsername.substring(0, 26)}_${counter}`;
        counter++;
      }
      user = await this.userModel.create({
        name: profile.name,
        username: finalUsername,
        email: profile.email.toLowerCase(),
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        authProviders: [
          {
            provider: 'google',
            providerId: profile.id,
            email: profile.email,
          },
        ],
      });

      // Create user profile
      await this.usersService.createUserProfile(user._id as Types.ObjectId);

      this.logger.log(`New user created via Google: ${user.email}`);
    } else if (!user.authProviders?.some((ap) => ap.provider === 'google')) {
      // Add Google provider to existing user
      user.authProviders.push({
        provider: 'google',
        providerId: profile.id,
        email: profile.email,
      });
      await user.save();
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const existing = await this.userModel.findOne({ username: username.toLowerCase() });
    return { available: !existing };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If email exists, password reset link will be sent' };
    }

    // Generate a short-lived JWT as the reset token (15 min expiry)
    const resetToken = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email, purpose: 'password-reset' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );
    this.logger.log(`Password reset requested for ${email}`);

    // In production: send email with reset link containing the token
    // await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'If email exists, password reset link will be sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // Verify the JWT reset token
    let payload: { sub: string; email: string; purpose: string };
    try {
      payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    // Revoke all existing refresh tokens
    await this.refreshTokenModel.updateMany(
      { userId: user._id },
      { isRevoked: true },
    );

    this.logger.log(`Password reset for user: ${user.email}`);

    return { message: 'Password reset successfully' };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userModel.findById(payload.sub);
  }

  private async generateTokens(
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, jti: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}` },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      },
    );

    // Store refresh token in DB for revocation support
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
    const expiresAtDays = parseInt(expiresIn);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (isNaN(expiresAtDays) ? 7 : expiresAtDays));

    await this.refreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
      userAgent,
      ip,
    });

    return { accessToken, refreshToken };
  }
}
