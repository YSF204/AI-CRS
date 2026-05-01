import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF from HTML using Puppeteer.
 * Optimized to avoid slow networkidle0 waits and external CDN fetches.
 */
const htmlToPdf = async (html, cvid) => {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-default-apps',
            ]
        });

        const page = await browser.newPage();

        // ── Block external network requests (CDN fonts, images, external CSS).
        // The HTML payload already embeds all styles inline.
        // Blocking these prevents Puppeteer from hanging while waiting for CDN assets.
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            const url = req.url();
            if (['image', 'media', 'font'].includes(type) && !url.startsWith('data:')) {
                req.abort();
            } else if (type === 'stylesheet' && url.startsWith('http')) {
                // Block external CSS — styles are already inline in the HTML payload
                req.abort();
            } else {
                req.continue();
            }
        });

        // Use domcontentloaded — NOT networkidle0/networkidle2 which waits
        // up to 30 seconds for all external network activity to stop.
        await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Short pause to allow layout to settle from inline styles
        await new Promise((resolve) => setTimeout(resolve, 350));

        const pdfDir = path.join(__dirname, '../uploads/cv/pdfs');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const fileName = `cv_${cvid}_${Date.now()}.pdf`;
        const pdfPath = path.join(pdfDir, fileName);

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                bottom: '0mm',
                left: '0mm',
                right: '0mm'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: false,
        });

        await browser.close();

        return {
            absolutePath: pdfPath,
            relativePath: path.join('uploads/cv/pdfs', fileName),
            filename: fileName,
            method: 'html'
        };

    } catch (err) {
        if (browser) await browser.close().catch(() => {});
        console.error('[PDF Gen] Error:', err.message);
        throw err;
    }
};

export default htmlToPdf;
