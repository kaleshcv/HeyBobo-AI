import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Certificate } from '@/modules/certificates/schemas/certificate.schema';
import { Enrollment } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { Course } from '@/modules/education/courses/schemas/course.schema';
import { User } from '@/modules/users/schemas/user.schema';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @InjectModel(Certificate.name) private certificateModel: Model<Certificate>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async generate(enrollmentId: string): Promise<Certificate> {
    const enrollment = await this.enrollmentModel.findById(enrollmentId).populate('courseId').populate('studentId');

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const course = enrollment.courseId as any;
    const student = enrollment.studentId as any;
    const teacher = await this.userModel.findById(course.teacherId);

    const verificationCode = uuidv4();
    const uploadDir = this.configService.get<string>('file.uploadDir', 'uploads');
    const certificateDir = path.join(uploadDir, 'certificates');

    if (!fs.existsSync(certificateDir)) {
      fs.mkdirSync(certificateDir, { recursive: true });
    }

    const filename = `certificate-${enrollmentId}-${Date.now()}.pdf`;
    const filepath = path.join(certificateDir, filename);

    // Generate PDF
    await this.generateCertificatePDF(
      filepath,
      {
        studentName: student.name,
        courseName: course.title,
        teacherName: teacher?.name || 'EduPlatform',
        completionDate: new Date(),
        verificationCode,
      },
    );

    const certificateUrl = `/uploads/certificates/${filename}`;

    const certificate = await this.certificateModel.create({
      courseId: course._id,
      studentId: student._id,
      enrollmentId: new Types.ObjectId(enrollmentId),
      certificateUrl,
      verificationCode,
      issuedAt: new Date(),
      studentName: student.name,
      courseName: course.title,
      teacherName: teacher?.name,
      completionDate: enrollment.completedAt || new Date(),
    });

    // Link certificate back to enrollment and update user stats
    await Promise.all([
      this.enrollmentModel.findByIdAndUpdate(enrollmentId, {
        $set: { certificateId: certificate._id },
      }),
      this.userModel.findByIdAndUpdate(student._id, { $inc: { totalCertificates: 1 } }),
    ]);

    this.logger.log(`Certificate generated: ${certificate._id}`);
    return certificate;
  }

  async findOne(id: string): Promise<Certificate> {
    const certificate = await this.certificateModel
      .findById(id)
      .populate('courseId')
      .populate('studentId');

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async findByVerificationCode(code: string): Promise<Certificate> {
    const certificate = await this.certificateModel
      .findOne({ verificationCode: code })
      .populate('courseId')
      .populate('studentId');

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return this.certificateModel
      .find({ studentId: new Types.ObjectId(userId) })
      .populate('courseId', 'title')
      .sort({ issuedAt: -1 });
  }

  private async generateCertificatePDF(
    filepath: string,
    data: {
      studentName: string;
      courseName: string;
      teacherName: string;
      completionDate: Date;
      verificationCode: string;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Certificate background
        doc.rect(40, 40, 500, 700).stroke();
        doc.rect(50, 50, 480, 680).stroke();

        // Title
        doc.fontSize(36).font('Helvetica-Bold').text('Certificate of Completion', { align: 'center' });

        doc.moveDown(2);

        // Body
        doc.fontSize(14).font('Helvetica').text('This certificate is proudly presented to', { align: 'center' });

        doc.moveDown();

        // Student name
        doc.fontSize(24).font('Helvetica-Bold').text(data.studentName, { align: 'center', underline: true });

        doc.moveDown();

        // Completion text
        doc.fontSize(12).font('Helvetica').text(`For successfully completing the course`, { align: 'center' });

        doc.moveDown();

        // Course name
        doc.fontSize(18).font('Helvetica-Bold').text(data.courseName, { align: 'center' });

        doc.moveDown(3);

        // Teacher info
        doc.fontSize(11).font('Helvetica').text(`Taught by: ${data.teacherName}`, { align: 'center' });

        // Date
        doc.fontSize(11).text(`Completed on: ${data.completionDate.toLocaleDateString()}`, { align: 'center' });

        doc.moveDown(2);

        // Verification code
        doc.fontSize(10).text(`Verification Code: ${data.verificationCode}`, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Certificate PDF generated: ${filepath}`);
          resolve();
        });

        stream.on('error', (err) => {
          this.logger.error(`Failed to generate certificate: ${err.message}`);
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
