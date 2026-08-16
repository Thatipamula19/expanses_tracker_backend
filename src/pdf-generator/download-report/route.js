import puppeteer from 'puppeteer';
import { GenerateReport } from './GenerateReport';

export async function POST(request) {
    const payload = await request.json();

    try {
        const htmlContent = await GenerateReport(payload?.testData, payload?.reportData?.advanced_report?.[0]);

        // const browser = await puppeteer.launch({
        //     args: chromium.args,
        //     executablePath: await chromium.executablePath,
        //     headless: chromium.headless,
        // });

        const browser = await puppeteer.launch(
            {
              args: [
                '--allow-file-access-from-files',
                '--enable-local-file-accesses',
                "--disable-gpu",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--no-zygote"
              ],
              headless: true,
              executablePath: "/usr/bin/chromium-browser",
            }
          );

        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        // await page.waitForFunction(() => {
        //     return window.myChart !== undefined;  // Wait until Chart.js chart is initialized
        // });
        const pdfBuffer = await page.pdf({
            printBackground: true,
            format: "A4"
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
