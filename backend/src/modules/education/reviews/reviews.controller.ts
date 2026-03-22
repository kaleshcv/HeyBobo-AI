import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from '@/modules/education/reviews/reviews.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Public()
  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get course reviews' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.reviewsService.findByCourse(courseId, page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get review' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.reviewsService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @Post('courses/:courseId')
  @ApiOperation({ summary: 'Create review' })
  async create(
    @Param('courseId') courseId: string,
    @Body() createReviewDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.reviewsService.create(courseId, userId, createReviewDto);
  }

  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Update review' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: any,
    @CurrentUser('sub') userId: string,
  ): Promise<any> {
    return this.reviewsService.update(id, userId, updateReviewDto);
  }

  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete review' })
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    await this.reviewsService.delete(id, userId);
    return { message: 'Review deleted' };
  }

  @ApiBearerAuth('access-token')
  @Post(':id/helpful')
  @ApiOperation({ summary: 'Mark review as helpful' })
  async markHelpful(@Param('id') id: string, @CurrentUser('sub') userId: string): Promise<any> {
    return this.reviewsService.markHelpful(id, userId);
  }
}
