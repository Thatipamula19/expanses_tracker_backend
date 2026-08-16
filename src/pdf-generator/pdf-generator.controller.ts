import { AllowAnonymous } from '@/auth/decorators/allow-anonaymous.decorator';
import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';

@AllowAnonymous()
@Controller('pdf-generator')
export class PdfGeneratorController {

    constructor(
        private readonly pdfGeneratorService: PdfGeneratorService
    ) { }

    @AllowAnonymous()
    @Post('download-certificate')
    @HttpCode(HttpStatus.OK)
    async generatePDF(@Body() payload: any, @Res() res: any) {

        const pdfBuffer =
            await this.pdfGeneratorService.generateCertificatePdf(payload);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="certificate.pdf"',
        );
        res.setHeader('Content-Length', pdfBuffer.length);

        return res.send(pdfBuffer);
    }

        @AllowAnonymous()
    @Post('download-report')
    @HttpCode(HttpStatus.OK)
    async generateReportPDF(@Body() payload: any, @Res() res: any) {

        const pdfBuffer =
            await this.pdfGeneratorService.generateReportPdf(payload);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="certificate.pdf"',
        );
        res.setHeader('Content-Length', pdfBuffer.length);

        return res.send(pdfBuffer);
    }


}
