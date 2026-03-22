import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuizzesService } from '@/modules/education/quizzes/quizzes.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles, UserRole } from '@/common/decorators/roles.decorator';

@ApiTags('Quizzes')
@ApiBearerAuth('access-token')
@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.quizzesService.findOne(id);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'Get quiz with questions' })
  async getWithQuestions(@Param('id') id: string): Promise<any> {
    return this.quizzesService.getQuizWithQuestions(id);
  }

  @Roles(UserRole.TEACHER, UserRole.CREATOR, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create quiz' })
  async create(@Body() createQuizDto: any, @CurrentUser('sub') userId: string): Promise<any> {
    return this.quizzesService.create(createQuizDto.courseId, createQuizDto, userId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start quiz attempt' })
  async startAttempt(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    return this.quizzesService.startAttempt(id, userId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit quiz attempt' })
  async submitAttempt(
    @Param('id') id: string,
    @Body() submitQuizDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.quizzesService.submitAttempt(id, userId, submitQuizDto.answers, submitQuizDto.startedAt);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get student attempts' })
  async getAttempts(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    return this.quizzesService.getStudentAttempts(id, userId);
  }
}
