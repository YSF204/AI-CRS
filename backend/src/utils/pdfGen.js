import puppeteer, { PuppeteerError } from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF from HTML using Puppeteer
 */
const htmlToPdf = async (html, cvid) => {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args :[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });

        const pdfDir = path.join(__dirname , '../uploads/cv/pdfs');
        if(!fs.existsSync(pdfDir)){
            fs.mkdirSync(pdfDir , {recursive : true});
        }

        const fileName = `cv_${cvid}_${Date.now()}.pdf`;
        const pdfPath = path.join(pdfDir , fileName);

        await page.pdf({
            path : pdfPath,
            format : 'A4',
            printBackground : true,
            margin : {
                top: '0mm',
                bottom: '0mm',
                left: '0mm',
                right: '0mm'
            },
            // Ensure consistent A4 dimensions (210mm x 297mm)
            width: '210mm',
            height: '297mm',
            preferCSSPageSize: true,
            displayHeaderFooter: false
        })

        await browser.close();

        return {
            absolutePath : pdfPath,
            relativePath : path.join('uploads/cv/pdfs' , fileName),
            filename : fileName,
            method: 'html'
        }

    }catch(err){
        console.log(err);
        throw err;
    }
}

export default htmlToPdf;
