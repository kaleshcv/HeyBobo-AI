import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SectionsService } from '@/modules/education/sections/sections.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';

@ApiTags('Sections')
@ApiBearerAuth('access-token')
@Controller('courses/:courseId/sections')
export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create section' })
  async create(
    @Param('courseId') courseId: string,
    @Body() createSectionDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.sectionsService.create(courseId, createSectionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get sections' })
  async findByCourse(@Param('courseId') courseId: string): Promise<any> {
    return this.sectionsService.findByCourse(courseId);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update section' })
  async update(
    @Param('id') id: string,
    @Body() updateSectionDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.sectionsService.update(id, updateSectionDto, userId);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete section' })
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    await this.sectionsService.delete(id, userId);
    return { message: 'Section deleted' };
  }
}
