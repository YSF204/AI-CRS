import catchAsync from "../utils/catchAsync.js";
import { createCv } from "../services/cvs/commands/createCv.js";
import { getMyCvs } from "../services/cvs/queries/getMyCvs.js";
import { getCvById } from "../services/cvs/queries/getCvById.js";
import { updateCv } from "../services/cvs/commands/updateCv.js";
import { deleteCv } from "../services/cvs/commands/deleteCv.js";
import { analyzeUploadedCvFile } from "../services/cvs/analysis/analyzeUploadedCvFile.js";
import { analyzeSavedCv } from "../services/cvs/analysis/analyzeSavedCv.js";
import { getCvAnalyses } from "../services/cvs/queries/getCvAnalyses.js";
import { generateCvPdfDownload } from "../services/cvs/pdf/downloadCvPdf.js";
import { analyzeCvSection } from "../services/cvs/analysis/analyzeCvSection.js";

// ================================== //
//          CREATE NEW CV             //
// ================================== //

export const createCV = catchAsync(async (req, res, next) => {
    const cv = await createCv({
        userId: req.user._id,
        payload: req.body,
    });

    res.status(201).json({
        success: true,
        message: "CV created successfully",
        data: { cv },
    });
});

// ================================== //
//     GET ALL CVs FOR LOGGED USER    //
// ================================== //

export const getMyCVs = catchAsync(async (req, res) => {
    const cvs = await getMyCvs({ userId: req.user._id });

    res.status(200).json({
        success: true,
        count: cvs.length,
        data: { cvs },
    });
});

// ================================== //
//          GET SINGLE CV             //
// ================================== //

export const getCVById = catchAsync(async (req, res, next) => {
    const cv = await getCvById({
        cvId: req.params.id,
        userId: req.user._id,
    });

    res.status(200).json({
        success: true,
        data: { cv },
    });
});

// ================================== //
//           UPDATE CV                //
// ================================== //

export const updateCV = catchAsync(async (req, res, next) => {
    const updatedCV = await updateCv({
        cvId: req.params.id,
        userId: req.user._id,
        payload: req.body,
    });

    res.status(200).json({
        success: true,
        message: "CV updated successfully",
        data: { cv: updatedCV },
    });
});

// ================================== //
//           DELETE CV                //
// ================================== //

export const deleteCV = catchAsync(async (req, res, next) => {
    await deleteCv({
        cvId: req.params.id,
        userId: req.user._id,
    });

    res.status(200).json({
        success: true,
        message: "CV and its analysis records deleted successfully",
    });
});


// ================================== //
//  UPLOAD PDF CV + TRIGGER ANALYSIS  //
// ================================== //

export const analyzeCVFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload a PDF file", 400));
    }

    const result = await analyzeUploadedCvFile({
        filePath: req.file.path,
        userId: req.user._id,
        jobDescription: req.body.jobDescription,
    });

    res.status(201).json({
        success: true,
        message: "CV extracted and analyzed successfully",
        data: { cv: result.cv, analysis: result.analysis },
    });
});


// ================================== //
//  ANALYSIS FOR CVs IN APP           //
// ================================== //
export const analyzeCV = catchAsync(async (req, res, next) => {
    const analysis = await analyzeSavedCv({
        cvId: req.params.id,
        userId: req.user._id,
        jobDescription: req.body.jobDescription,
    });

    res.status(201).json({
        success: true,
        message: "CV analyzed successfully",
        data: { analysis },
    });
});

// ================================== //
//   GET ALL ANALYSES FOR A CV        //
// ================================== //

export const getCVAnalyses = catchAsync(async (req, res, next) => {
    const analyses = await getCvAnalyses({
        cvId: req.params.id,
        userId: req.user._id,
    });

    res.status(200).json({
        success: true,
        count: analyses.length,
        data: { analyses },
    });
});

// ================================== //
//    GENERATE & DOWNLOAD PDF         //
// ================================== //

export const downloadPDF = catchAsync(async (req, res, next) => {
    const result = await generateCvPdfDownload({
        cvId: req.params.id,
        userId: req.user._id,
        html: req.body.html,
    });

    res.download(result.filePath, result.filename, (err) => {
        result.cleanup();
        if (err) {
            return next(new AppError("Error downloading PDF", 500));
        }
    });
});

// ================================== //
//    ANALYZE CV SECTION              //
// ================================== //

export const analyzeSection = catchAsync(async (req, res, next) => {
    const result = await analyzeCvSection({
        section: req.body.section,
        data: req.body.data,
    });

    res.status(200).json({
        success: true,
        data: result,
    });
});


