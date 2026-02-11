import fs from "fs";
import CV from "../models/CV.js";
import CVAnalysis from "../models/CVAnalysis.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { calculateATSScore, analyzeCVFromFile } from "../integrations/ai/openai.js";

// ================================== //
//          CREATE NEW CV             //
// ================================== //

export const createCV = catchAsync(async (req, res, next) => {
    const {
        jobTitle,
        summary,
        contact,
        address,
        experience,
        education,
        language,
        softSkills,
        technicalSkills,
        customSections,
    } = req.body;

    // make sure that all required fields are provided
    if (!jobTitle || !summary || !address) {
        return next(new AppError("Please provide all required fields", 400));
    }

    const cv = await CV.create({
        userId: req.user._id,
        jobTitle,
        summary,
        contact: contact || {},
        address,
        experience: experience || [],
        education: education || [],
        language: language || [],
        softSkills: softSkills || [],
        technicalSkills: technicalSkills || [],
        customSections: customSections || [],
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
    const cvs = await CV.find({ userId: req.user._id }).sort({ createdAt: -1 });

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
    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    // make sure the CV belongs to the logged-in user
    if (cv.userId.toString() !== req.user._id.toString()) {
        return next(new AppError("Not authorized to access this CV", 403));
    }

    res.status(200).json({
        success: true,
        data: { cv },
    });
});

// ================================== //
//           UPDATE CV                //
// ================================== //

export const updateCV = catchAsync(async (req, res, next) => {
    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    // verify ownership
    if (cv.userId.toString() !== req.user._id.toString()) {
        return next(new AppError("Not authorized to update this CV", 403));
    }

    const updatedCV = await CV.findByIdAndUpdate(
        req.params.id,
        { ...req.body, userId: req.user._id }, // prevent changing userId
        { new: true, runValidators: true },
    );

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
    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    if (cv.userId.toString() !== req.user._id.toString()) {
        return next(new AppError("Not authorized to delete this CV", 403));
    }

    await CVAnalysis.deleteMany({ CVId: cv._id });
    await CV.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "CV and its analysis records deleted successfully",
    });
});


// ================================== //
//  UPLOAD PDF CV + TRIGGER ANALYSIS  //
// ================================== //

// the user uploads a PDF file and the AI analyzes it directly
export const analyzeCVFile = catchAsync(async (req, res, next) => {

    if (!req.file) {
        return next(new AppError("Please upload a PDF file", 400));
    }

    const { jobDescription } = req.body;

    // send the PDF file directly to the AI for analysis
    const aiResult = await analyzeCVFromFile(req.file.path, jobDescription);

    // parse the AI response
    let parsedResult;
    try {
        parsedResult = JSON.parse(aiResult);
    } catch {
        parsedResult = {
            score: 0,
            strengths: aiResult,
            weaknesses: "Could not parse AI response",
            suggestions: "Please try again",
        };
    }

    const analysis = await CVAnalysis.create({
        userId: req.user._id,
        CVId: null,
        atsScore: parsedResult.score || 0,
        strength: parsedResult.strengths || "N/A",
        weakness: parsedResult.weaknesses || "N/A",
        suggestion: parsedResult.suggestions || "N/A",
    });

    // clean up the uploaded file after analysis
    fs.unlinkSync(req.file.path);

    res.status(201).json({
        success: true,
        message: "PDF CV analysis completed",
        data: { analysis },
    });
});

// ================================== //
//   GET ALL ANALYSES FOR A CV        //
// ================================== //

export const getCVAnalyses = catchAsync(async (req, res, next) => {
    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    // verify ownership
    if (cv.userId.toString() !== req.user._id.toString()) {
        return next(new AppError("Not authorized to view analyses for this CV", 403));
    }

    const analyses = await CVAnalysis.find({ CVId: cv._id }).sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        count: analyses.length,
        data: { analyses },
    });
});
