import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  CREATOR = 'creator',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  COLLEGE_ADMIN = 'college_admin',
}

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
