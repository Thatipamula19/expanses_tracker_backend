import { Injectable, InternalServerErrorException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { GenerateCertificate } from './download-certificate/GenerateCertificate';
import { GenerateReport } from './download-report/GenerateReport';
@Injectable()
export class PdfGeneratorService {

    async generateCertificatePdf(payload: any): Promise<Buffer> {
        let browser;

        try {
            const htmlContent = GenerateCertificate(payload);

            browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser',
                args: [
                    '--allow-file-access-from-files',
                    '--enable-local-file-accesses',
                    '--disable-gpu',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--no-zygote',
                ],
            });

            const page = await browser.newPage();

            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0',
            });

            const pdfBuffer = await page.pdf({
                printBackground: true,
                width: '9in',
                height: '6.2in',
            });

            return Buffer.from(pdfBuffer,);

        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    async generateReportPdf(payload: any): Promise<Buffer> {
        let browser;

        try {
            const htmlContent = await GenerateReport(
                payload?.testData,
                payload?.reportData?.advanced_report?.[0],
            );

            browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser',
                args: [
                    '--allow-file-access-from-files',
                    '--enable-local-file-accesses',
                    '--disable-gpu',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--no-zygote',
                ],
            });

            const page = await browser.newPage();

            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0',
            });

            const pdfBuffer = await page.pdf({
                printBackground: true,
                format: 'A4',
            });

            return Buffer.from(pdfBuffer);

        } catch (error) {
            console.error('Error generating report PDF:', error);

            throw new InternalServerErrorException(
                'Failed to generate report PDF',
            );

        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
