import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from '@/modules/certificates/certificates.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get user certificates' })
  async getUserCertificates(@CurrentUser('sub') userId: string): Promise<any> {
    return this.certificatesService.getUserCertificates(userId);
  }

  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get certificate' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.certificatesService.findOne(id);
  }

  @Public()
  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate by code' })
  async verifyCertificate(@Param('code') code: string): Promise<any> {
    return this.certificatesService.findByVerificationCode(code);
  }
}
