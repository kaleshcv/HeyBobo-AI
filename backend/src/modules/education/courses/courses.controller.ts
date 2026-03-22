import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from '@/modules/education/courses/courses.service';
import { CreateCourseDto } from '@/modules/education/courses/dto/create-course.dto';
import { UpdateCourseDto } from '@/modules/education/courses/dto/update-course.dto';
import { QueryCoursesDto } from '@/modules/education/courses/dto/query-courses.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  async findAll(@Query() query: QueryCoursesDto): Promise<any> {
    return this.coursesService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured courses' })
  async getFeatured(): Promise<any> {
    return this.coursesService.getFeatured();
  }

  @ApiBearerAuth('access-token')
  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended courses' })
  async getRecommended(@CurrentUser('sub') userId: string): Promise<any> {
    return this.coursesService.getRecommended(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.coursesService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.coursesService.create(createCourseDto, userId);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update course' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.coursesService.update(id, updateCourseDto, userId);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete course' })
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    await this.coursesService.delete(id, userId);
    return { message: 'Course deleted successfully' };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish course for review' })
  async publish(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    return this.coursesService.publishForReview(id, userId);
  }

  @ApiBearerAuth('access-token')
  @Get('teacher/courses')
  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get teacher courses' })
  async getTeacherCourses(@CurrentUser('sub') userId: string): Promise<any> {
    return this.coursesService.getTeacherCourses(userId);
  }

  @ApiBearerAuth('access-token')
  @Get('teacher/courses/:id/analytics')
  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get course analytics' })
  async getAnalytics(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.coursesService.getTeacherCourseAnalytics(id, userId);
  }
}
