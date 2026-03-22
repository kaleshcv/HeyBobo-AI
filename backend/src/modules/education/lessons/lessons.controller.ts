import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LessonsService } from '@/modules/education/lessons/lessons.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';

@ApiTags('Lessons')
@ApiBearerAuth('access-token')
@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.lessonsService.findOne(id);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create lesson' })
  async create(@Body() createLessonDto: any, @CurrentUser('sub') userId: string): Promise<any> {
    return this.lessonsService.create(createLessonDto.courseId, createLessonDto, userId);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson' })
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.lessonsService.update(id, updateLessonDto, userId);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson' })
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    await this.lessonsService.delete(id, userId);
    return { message: 'Lesson deleted' };
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Update lesson progress' })
  async updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.lessonsService.updateProgress(id, userId, updateProgressDto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get lesson progress' })
  async getProgress(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.lessonsService.getProgress(id, userId);
  }
}
