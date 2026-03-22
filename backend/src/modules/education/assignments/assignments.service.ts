import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment } from '@/modules/education/assignments/schemas/assignment.schema';
import { AssignmentSubmission, SubmissionStatus } from '@/modules/education/assignments/schemas/assignment-submission.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(AssignmentSubmission.name) private submissionModel: Model<AssignmentSubmission>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(courseId: string, createAssignmentDto: any, userId: string): Promise<Assignment> {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only create assignments for your own courses');
    }

    const assignment = await this.assignmentModel.create({
      ...createAssignmentDto,
      courseId: new Types.ObjectId(courseId),
    });

    this.logger.log(`Assignment created: ${assignment._id}`);
    return assignment;
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async findByCourse(courseId: string): Promise<Assignment[]> {
    return this.assignmentModel.find({ courseId });
  }

  async submit(assignmentId: string, studentId: string, submitAssignmentDto: any): Promise<AssignmentSubmission> {
    const assignment = await this.findOne(assignmentId);

    const existingSubmission = await this.submissionModel.findOne({
      assignmentId: new Types.ObjectId(assignmentId),
      studentId: new Types.ObjectId(studentId),
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.fileUrls = submitAssignmentDto.fileUrls || existingSubmission.fileUrls;
      existingSubmission.textResponse = submitAssignmentDto.textResponse || existingSubmission.textResponse;
      existingSubmission.submittedAt = new Date();
      await existingSubmission.save();
      return existingSubmission;
    }

    const isLate = new Date() > assignment.dueDate;

    const submission = await this.submissionModel.create({
      assignmentId: new Types.ObjectId(assignmentId),
      studentId: new Types.ObjectId(studentId),
      ...submitAssignmentDto,
      submittedAt: new Date(),
      status: isLate ? 'late' : 'submitted',
    });

    this.logger.log(`Assignment submitted: ${submission._id}`);
    return submission;
  }

  async gradeSubmission(
    submissionId: string,
    teacherId: string,
    gradeDto: any,
  ): Promise<AssignmentSubmission> {
    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) throw new NotFoundException('Submission not found');

    const assignment = await this.findOne(submission.assignmentId.toString());
    const course = await this.courseModel.findById(assignment.courseId);

    if (course?.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only grade submissions for your own assignments');
    }

    submission.grade = gradeDto.grade;
    submission.feedback = gradeDto.feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = new Types.ObjectId(teacherId);
    submission.status = SubmissionStatus.GRADED;

    await submission.save();
    this.logger.log(`Submission graded: ${submissionId}`);
    return submission;
  }

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.submissionModel
      .find({ assignmentId: new Types.ObjectId(assignmentId) })
      .populate('studentId', 'name email');
  }

  async getStudentSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    return this.submissionModel.findOne({
      assignmentId: new Types.ObjectId(assignmentId),
      studentId: new Types.ObjectId(studentId),
    });
  }
}
