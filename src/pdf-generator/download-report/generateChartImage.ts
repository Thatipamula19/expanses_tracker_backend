import puppeteer from 'puppeteer';
declare global {
  interface Window {
    chartRendered: boolean;
  }
}
export async function generateChartImage(array) {
    const htmlContent = `
        <html>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
            <div style="width: 400px; height: 400px; margin: 0 auto;">
                <canvas id="myChart"></canvas>
            </div>
            <script>
                var ctx = document.getElementById('myChart').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: ${JSON.stringify(array)},
                            backgroundColor: ['#00AD6F', '#FF5353', '#ddd'],
                            borderColor: ['#000'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        cutoutPercentage: 60,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'right',
                                labels: {
                                    fontSize: 12,
                                    usePointStyle: true,
                                    padding: 30
                                }
                            }
                        }
                    }
                });
                // Wait for the chart to render fully
                setTimeout(() => {
                    window.chartRendered = true;
                }, 1000);
            </script>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 500 });
    await page.setContent(htmlContent);
    await page.waitForFunction(() => window.chartRendered === true);
    const chartImage = await page.screenshot({ encoding: 'base64', fullPage: true });
    await browser.close();

    return `data:image/png;base64,${chartImage}`;
}
