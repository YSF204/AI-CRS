import puppeteer, { PuppeteerError } from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlToPdf = async (html,cvid) =>{
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

        // gen pdf 

        await page.pdf({
            path : pdfPath,
            format : 'A4',
            printBackground : true,
            margin : { top: 0, bottom: 0, left: 0, right: 0 }
        })

        await browser.close();

        return {
            absolutePath : pdfPath,
            relativePath : path.join('uploads/cv/pdfs' , fileName),
            filename : fileName
        }

    }catch(err){
        console.log(err);
        throw err;
    }
}

export default htmlToPdf;