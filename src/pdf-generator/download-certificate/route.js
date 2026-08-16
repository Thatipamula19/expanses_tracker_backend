import puppeteer from 'puppeteer';
import { GenerateCertificate } from './GenerateCertificate';

export async function POST(request) {
    const payload = await request.json();

    try {
        const htmlContent = GenerateCertificate(payload);

        // const browser = await puppeteer.launch({
        //     args: chromium.args,
        //     executablePath: await chromium.executablePath,
        //     headless: chromium.headless,
        // });

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({
            printBackground: true,
            width: "9in",
            height: "6.2in"
        });

        await browser.close();
        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Accept': "*/*",
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=certificate.pdf',
            }
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
