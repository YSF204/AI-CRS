import fs from "fs";
import CV from "../models/CV.js";
import CVAnalysis from "../models/CVAnalysis.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { analyzeCVFromFile, analyzeCVFromDatabase, analyzeCVSection } from "../integrations/ai/openai.js";
import htmlToPdf from "../utils/pdfGen.js";
import { extractCertifications, calculateExperienceYears } from "../utils/profileNormalizer.js";
import { generateAIMatchAnalysis } from "../services/matching/matchingService.js";


const verifyOwnership = (cv, userId) => {
    if (cv.userId.toString() !== userId.toString()) {
        throw new AppError("Not authorized to access this CV", 403);
    }
};

// ================================== //
//          CREATE NEW CV             //
// ================================== //

export const createCV = catchAsync(async (req, res, next) => {
    const {
        fullName,
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
        layout,
        templateId,
        profileImage,
    } = req.body;

    const cv = await CV.create({
        userId: req.user._id,
        fullName: fullName || "",
        jobTitle,
        summary: summary || "",
        contact: contact || {},
        address: address || {},
        experience: experience || [],
        education: education || [],
        language: language || [],
        softSkills: softSkills || [],
        technicalSkills: technicalSkills || [],
        customSections: customSections || [],
        templateId: templateId || 1,
        profileImage: profileImage || "",
        layout: {
            sectionOrder: layout?.sectionOrder || [],
            visibleSections: layout?.visibleSections || {},
        },
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

    verifyOwnership(cv, req.user._id);

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

    verifyOwnership(cv, req.user._id);

    const { layout, ...rest } = req.body;

    // Build update object
    const updateData = { ...rest, userId: req.user._id };

    // Merge layout fields individually to avoid overwriting the whole layout object
    if (layout?.sectionOrder !== undefined) {
        updateData["layout.sectionOrder"] = layout.sectionOrder;
    }
    if (layout?.visibleSections !== undefined) {
        updateData["layout.visibleSections"] = layout.visibleSections;
    }

    const updatedCV = await CV.findByIdAndUpdate(
        req.params.id,
        updateData,
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

    verifyOwnership(cv, req.user._id);

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

export const analyzeCVFile = catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError("Please upload a PDF file", 400));

    const { jobDescription } = req.body;

    const aiResult = await analyzeCVFromFile(req.file.path, jobDescription);

    let parsed;
    try {
        const clean = aiResult.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
    } catch {
        fs.unlinkSync(req.file.path);
        return next(new AppError("AI returned an invalid response, please try again", 500));
    }

    const str = (v) => (Array.isArray(v) ? v.join("\n• ") : v || "N/A");

    const cvData = parsed.cvData || {};

    // Scrub empty AI extraction entries to avoid Mongoose validation crashes
    const scrubbedExperience = (cvData.experience || []).filter(e => e.institutionName?.trim() && e.position?.trim());
    const scrubbedEducation = (cvData.education || []).filter(e => e.institutionName?.trim() && e.certification?.trim());

    // Extract certifications from all sources: explicit array + education entries
    const allCertifications = extractCertifications(
        { certifications: cvData.certifications || [] },
        cvData.education || [],
        []
    );

    // Create custom sections for certifications if any exist
    const customSections = [];
    if (allCertifications.length > 0) {
        customSections.push({
            title: "Certifications",
            sectionType: "certifications",
            items: allCertifications.map(cert => ({
                name: cert,
                description: "",
                durationFrom: "",
                durationTo: "",
                link: "",
            })),
        });
    }

    // Run CV and Analysis creation in parallel for speed
    const [cv, analysisData] = await Promise.all([
        CV.create({
            userId: req.user._id,
            jobTitle: cvData.jobTitle || "Uploaded CV",
            summary: cvData.summary || "Extracted from uploaded PDF",
            contact: cvData.contact || {},
            address: cvData.address || { city: "N/A", street: "N/A" },
            experience: scrubbedExperience,
            education: scrubbedEducation,
            technicalSkills: cvData.technicalSkills || [],
            softSkills: cvData.softSkills || [],
            language: cvData.language || [],
            customSections,
            layout: {
                sectionOrder: cvData.layout?.sectionOrder || [],
                visibleSections: cvData.layout?.visibleSections || {},
            },
        }),
        Promise.resolve(parsed.analysis || {})
    ]);

    const analysis = await CVAnalysis.create({
        userId: req.user._id,
        CVId: cv._id,
        atsScore: analysisData.score || 0,
        strength: str(analysisData.strengths),
        weakness: str(analysisData.weaknesses),
        suggestion: str(analysisData.suggestions),
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
        success: true,
        message: "CV extracted and analyzed successfully",
        data: { cv, analysis },
    });
});


// ================================== //
//  ANALYSIS FOR CVs IN APP           //
// ================================== //
export const analyzeCV = catchAsync(async (req, res, next) => {
    const { jobDescription } = req.body;

    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    verifyOwnership(cv, req.user._id);

    // convert the CV data into plain text for the AI
    const cvText = [
        `Job Title: ${cv.jobTitle}`,
        `Summary: ${cv.summary}`,
        `Email: ${cv.contact?.email || "N/A"}`,
        `Phone: ${cv.contact?.phone || "N/A"}`,
        `Location: ${cv.address?.city || ""}, ${cv.address?.street || ""}`,
        `Experience: ${cv.experience?.map(e => `${e.position} at ${e.institutionName} (${e.duration}y) - ${e.summary || ""}`).join(" | ") || "None"}`,
        `Education: ${cv.education?.map(e => `${e.certification} at ${e.institutionName} (${e.duration}y)`).join(" | ") || "None"}`,
        `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
        `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
        `Languages: ${cv.language?.join(", ") || "None"}`,
        ...cv.customSections?.map(s => `${s.title}: ${s.items?.map(i => `${i.name}${i.description ? " - " + i.description : ""}`).join(", ")}`) || [],
        `Layout: ${JSON.stringify(cv.layout)}`,
    ].join("\n");

    const aiResult = await analyzeCVFromDatabase(cvText, jobDescription);

    let parsed;
    try {
        const clean = aiResult.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
    } catch {
        return next(new AppError("AI returned an invalid response, please try again", 500));
    }

    const str = (v) => (Array.isArray(v) ? v.join("\n• ") : v || "N/A");

    // save the analysis linked to the CV
    const analysisData = parsed.analysis || {};
    const analysis = await CVAnalysis.create({
        userId: req.user._id,
        CVId: cv._id,
        atsScore: analysisData.score || 0,
        strength: str(analysisData.strengths),
        weakness: str(analysisData.weaknesses),
        suggestion: str(analysisData.suggestions),
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
    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    verifyOwnership(cv, req.user._id);

    const analyses = await CVAnalysis.find({ CVId: cv._id }).sort({
        createdAt: -1,
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
    const { html } = req.body;

    const cv = await CV.findById(req.params.id);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    verifyOwnership(cv, req.user._id);

    await cv.populate('userId', 'firstName lastName');

    // Use HTML generation only
    if (!html) {
        return next(new AppError("Please provide HTML content for PDF generation", 400));
    }

    let pdfResult;

    try {
        pdfResult = await htmlToPdf(html, cv._id);
    } catch (error) {
        console.error('PDF generation failed:', error.message);
        return next(new AppError(`PDF generation failed: ${error.message}`, 500));
    }

    const filename = `cv_${cv.userId.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    res.download(pdfResult.absolutePath, filename, (err) => {

        if (fs.existsSync(pdfResult.absolutePath)) {
            fs.unlinkSync(pdfResult.absolutePath);
        }

        if (err) {
            return next(new AppError("Error downloading PDF", 500));
        }
    });
});

// ================================== //
//    ANALYZE CV SECTION              //
// ================================== //

export const analyzeSection = catchAsync(async (req, res, next) => {
    const { section, data, fullName } = req.body;

    if (!section || !data) {
        return next(new AppError("Section and data are required", 400));
    }

    // Generate AI analysis for the section using the specific section prompt
    // data is expected to be a flattened object where keys are the field ids
    const aiAnalysis = await analyzeCVSection(section, data);

    let parsed;
    try {
        const clean = aiAnalysis.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
    } catch {
        return next(new AppError("AI returned an invalid response, please try again", 500));
    }

    const issues = parsed.issues || [];
    const atsScore = parsed.atsScore || null;
    const atsFeedback = parsed.atsFeedback || "";

    res.status(200).json({
        success: true,
        data: {
            section,
            issues,
            atsScore,
            atsFeedback
        },
    });
});


