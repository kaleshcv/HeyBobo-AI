import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz } from '@/modules/education/quizzes/schemas/quiz.schema';
import { QuizQuestion } from '@/modules/education/quizzes/schemas/quiz-question.schema';
import { QuizAttempt } from '@/modules/education/quizzes/schemas/quiz-attempt.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizQuestion.name) private questionModel: Model<QuizQuestion>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttempt>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(courseId: string, createQuizDto: any, userId: string): Promise<Quiz> {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacherId.toString() !== userId) {
      throw new ForbiddenException('You can only create quizzes for your own courses');
    }

    const quiz = await this.quizModel.create({
      ...createQuizDto,
      courseId: new Types.ObjectId(courseId),
    });

    this.logger.log(`Quiz created: ${quiz._id}`);
    return quiz;
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async getQuizWithQuestions(id: string): Promise<any> {
    const quiz = await this.findOne(id);
    const questions = await this.questionModel.find({ quizId: new Types.ObjectId(id) }).sort({ order: 1 });

    return {
      ...quiz.toObject(),
      questions,
    };
  }

  async startAttempt(quizId: string, studentId: string): Promise<QuizAttempt> {
    const quiz = await this.findOne(quizId);

    const attempt = await this.attemptModel.create({
      quizId: new Types.ObjectId(quizId),
      studentId: new Types.ObjectId(studentId),
      answers: [],
      score: 0,
      totalMarks: 0,
      percentage: 0,
      passed: false,
      startedAt: new Date(),
      submittedAt: new Date(),
      timeTakenSeconds: 0,
    });

    return attempt;
  }

  async submitAttempt(
    quizId: string,
    studentId: string,
    answers: any[],
    startedAt: Date,
  ): Promise<QuizAttempt> {
    const quiz = await this.findOne(quizId);
    const questions = await this.questionModel.find({ quizId: new Types.ObjectId(quizId) });

    let score = 0;
    let totalMarks = 0;

    // Grade answers
    for (const question of questions) {
      totalMarks += question.marks;
      const studentAnswer = answers.find((a) => a.questionId.toString() === question._id.toString());

      if (studentAnswer) {
        const isCorrect = this.checkAnswer(studentAnswer.answer, question.correctAnswers, question.type);
        if (isCorrect) {
          score += question.marks;
        }
      }
    }

    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= quiz.passPercentage;
    const timeTakenSeconds = Math.floor((new Date().getTime() - startedAt.getTime()) / 1000);

    const attempt = await this.attemptModel.create({
      quizId: new Types.ObjectId(quizId),
      studentId: new Types.ObjectId(studentId),
      answers,
      score,
      totalMarks,
      percentage,
      passed,
      startedAt,
      submittedAt: new Date(),
      timeTakenSeconds,
    });

    this.logger.log(`Quiz attempt submitted: ${attempt._id}`);
    return attempt;
  }

  async getStudentAttempts(quizId: string, studentId: string): Promise<QuizAttempt[]> {
    return this.attemptModel
      .find({
        quizId: new Types.ObjectId(quizId),
        studentId: new Types.ObjectId(studentId),
      })
      .sort({ submittedAt: -1 });
  }

  private checkAnswer(studentAnswer: string[], correctAnswers: string[], type: string): boolean {
    if (type === 'mcq') {
      return studentAnswer[0] === correctAnswers[0];
    }
    if (type === 'multiple_answer') {
      return studentAnswer.sort().join(',') === correctAnswers.sort().join(',');
    }
    return false;
  }
}
