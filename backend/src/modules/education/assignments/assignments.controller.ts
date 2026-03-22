import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssignmentsService } from '@/modules/education/assignments/assignments.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';

@ApiTags('Assignments')
@ApiBearerAuth('access-token')
@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.assignmentsService.findOne(id);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create assignment' })
  async create(@Body() createAssignmentDto: any, @CurrentUser('sub') userId: string): Promise<any> {
    return this.assignmentsService.create(createAssignmentDto.courseId, createAssignmentDto, userId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit assignment' })
  async submit(
    @Param('id') id: string,
    @Body() submitAssignmentDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.assignmentsService.submit(id, userId, submitAssignmentDto);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Patch(':submissionId/grade')
  @ApiOperation({ summary: 'Grade submission' })
  async grade(
    @Param('submissionId') submissionId: string,
    @Body() gradeDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.assignmentsService.gradeSubmission(submissionId, userId, gradeDto);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get assignment submissions' })
  async getSubmissions(@Param('id') id: string): Promise<any> {
    return this.assignmentsService.getSubmissions(id);
  }
}
