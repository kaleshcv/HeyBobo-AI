import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from '@/modules/education/courses/dto/create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
