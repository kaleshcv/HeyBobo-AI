import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesController } from '@/modules/certificates/certificates.controller';
import { CertificatesService } from '@/modules/certificates/certificates.service';
import { Certificate, CertificateSchema } from '@/modules/certificates/schemas/certificate.schema';
import { Enrollment, EnrollmentSchema } from '@/modules/education/enrollments/schemas/enrollment.schema';
import { Course, CourseSchema } from '@/modules/education/courses/schemas/course.schema';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
