import fs from "fs";
import CV from "../../../models/CV.js";
import AppError from "../../../utils/appError.js";
import htmlToPdf from "../../../utils/pdfGen.js";
import verifyCvOwnership from "../helpers/verifyCvOwnership.js";

export const generateCvPdfDownload = async ({ cvId, userId, html }) => {
    const cv = await CV.findById(cvId);
    if (!cv) {
        throw new AppError("CV not found", 404);
    }

    verifyCvOwnership(cv, userId);

    await cv.populate("userId", "firstName lastName");

    if (!html) {
        throw new AppError("Please provide HTML content for PDF generation", 400);
    }

    let pdfResult;
    try {
        pdfResult = await htmlToPdf(html, cv._id);
    } catch (error) {
        throw new AppError(`PDF generation failed: ${error.message}`, 500);
    }

    const filename = `cv_${cv.userId.fullName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

    return {
        filePath: pdfResult.absolutePath,
        filename,
        cleanup: () => {
            if (fs.existsSync(pdfResult.absolutePath)) {
                fs.unlinkSync(pdfResult.absolutePath);
            }
        },
    };
};

export default generateCvPdfDownload;
