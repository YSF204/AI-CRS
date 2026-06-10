import fs from "fs";
import os from "os";
import path from "path";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import {
  analyzeCVFromFile,
  analyzeCVFromDatabase,
  analyzeCVSection,
  analyzeATSScore,
  analyzeSkillGap,
} from "../integrations/ai/openai.js";
import CV from "../models/CV.js";
import CVAnalysis from "../models/CVAnalysis.js";
import htmlToPdf from "../utils/pdfGen.js";
import {
  extractCertifications,
  calculateExperienceYears,
} from "../utils/profileNormalizer.js";
import { generateAIMatchAnalysis } from "../services/matching/matchingService.js";
import { runUnifiedATSScoring, buildCvDataForATS } from "../services/cvs/analysis/analyzeSavedCv.js";
import { normalizeEditorAnalysis, normalizeEditorIssues, normalizeATSScore } from "../services/cvs/analysis/normalizeScore.js";
import parseAiJsonResponse from "../services/cvs/helpers/parseAiJsonResponse.js";
import crypto from "crypto";
import { getSupabaseClient, SUPABASE_BUCKET } from "../config/supabase.js";

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
  const cvs = await CV.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

  // Attach latest ATS score to each CV
  for (let cv of cvs) {
    const analysis = await CVAnalysis.findOne({ CVId: cv._id }).sort({ createdAt: -1 });
    cv.atsScore = analysis ? analysis.atsScore : null;
  }

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

  const updatedCV = await CV.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
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

/**
 * Safe JSON parsing helper for AI responses
 */
const safeParseAIResponse = (responseText) => {
  try {
    // Remove markdown code blocks
    const clean = responseText
      .replace(/^```json\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("AI response parse error:", error.message);
    return null;
  }
};

/**
 * Create fallback CV data from text
 */
const createFallbackCVData = () => {
  return {
    jobTitle: "Uploaded CV",
    summary: "Profile extracted from uploaded PDF document",
    contact: { phone: "", email: "" },
    address: { city: "", street: "" },
    experience: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    language: [],
    certifications: [],
  };
};

export const analyzeCVFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Please upload a PDF file", 400));

  const { jobDescription } = req.body;

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-crs-cv-"));
  const tempFilePath = path.join(tempDir, `${crypto.randomBytes(8).toString("hex")}.pdf`);
  fs.writeFileSync(tempFilePath, req.file.buffer);

  const supabaseFileName = `${req.user._id}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.pdf`;
  const supabaseFilePath = `cvs/${supabaseFileName}`;
  let pdfUrl = "";

  try {
    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(supabaseFilePath, req.file.buffer, {
        contentType: req.file.mimetype || "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(supabaseFilePath);
    pdfUrl = publicData?.publicUrl || "";
  } catch (error) {
    console.warn("Supabase CV upload failed, falling back to local storage:", error.message);

    const localDir = path.join(process.cwd(), "src", "uploads", "cvs");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localFilePath = path.join(localDir, supabaseFileName);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    pdfUrl = `${backendUrl}/uploads/cvs/${supabaseFileName}`;
  }

  let aiResult;
  try {
    aiResult = await analyzeCVFromFile(tempFilePath, jobDescription);
  } catch (error) {
    console.error("AI file analysis error:", error);
    fs.rmSync(tempDir, { recursive: true, force: true });
    return next(
      new AppError("Unable to analyze PDF file, please try again", 500),
    );
  }

  if (!aiResult) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return next(
      new AppError("No response from AI analysis, please try again", 500),
    );
  }

  let parsed = safeParseAIResponse(aiResult);

  if (!parsed) {
    console.warn("AI response parsing failed, using fallback structure");
    parsed = {
      cvData: createFallbackCVData(),
      analysis: {
        score: 50,
        strengths: ["PDF successfully uploaded"],
        weaknesses: ["Could not fully parse document"],
        suggestions: ["Please review and complete your profile details"],
      },
    };
  }

  // Validate response has required structure
  if (!parsed.cvData) {
    parsed.cvData = createFallbackCVData();
  }
  if (!parsed.analysis) {
    parsed.analysis = {
      score: 50,
      strengths: ["Document processed"],
      weaknesses: [],
      suggestions: [],
    };
  }

  const str = (v) => (Array.isArray(v) ? v.join("\n• ") : v || "N/A");

  const cvData = parsed.cvData || {};

  // Scrub empty AI extraction entries to avoid Mongoose validation crashes
  const scrubbedExperience = (cvData.experience || []).filter(
    (e) => e.institutionName?.trim() && e.position?.trim(),
  );
  const scrubbedEducation = (cvData.education || []).filter(
    (e) => e.institutionName?.trim() && e.certification?.trim(),
  );

  // Extract certifications from all sources: explicit array + education entries
  const allCertifications = extractCertifications(
    { certifications: cvData.certifications || [] },
    cvData.education || [],
    [],
  );

  // Create custom sections for certifications if any exist
  const customSections = [];
  if (allCertifications.length > 0) {
    customSections.push({
      title: "Certifications",
      sectionType: "certifications",
      items: allCertifications.map((cert) => ({
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
    Promise.resolve(parsed.analysis || {}),
  ]);

  const analysis = await CVAnalysis.create({
    userId: req.user._id,
    CVId: cv._id,
    atsScore: analysisData.score || 0,
    strength: str(analysisData.strengths),
    weakness: str(analysisData.weaknesses),
    suggestion: str(analysisData.suggestions),
  });

  fs.rmSync(tempDir, { recursive: true, force: true });

  res.status(201).json({
    success: true,
    message: "CV extracted and analyzed successfully",
    data: { cv, analysis, pdfUrl },
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
    `Experience: ${cv.experience?.map((e) => `${e.position} at ${e.institutionName} (${e.duration}y) - ${e.summary || ""}`).join(" | ") || "None"}`,
    `Education: ${cv.education?.map((e) => `${e.certification} at ${e.institutionName} (${e.duration}y)`).join(" | ") || "None"}`,
    `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
    `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
    `Languages: ${cv.language?.join(", ") || "None"}`,
    ...(cv.customSections?.map(
      (s) =>
        `${s.title}: ${s.items?.map((i) => `${i.name}${i.description ? " - " + i.description : ""}`).join(", ")}`,
    ) || []),
    `Layout: ${JSON.stringify(cv.layout)}`,
  ].join("\n");

  let aiResult;
  try {
    aiResult = await analyzeCVFromDatabase(cvText, jobDescription);
  } catch (error) {
    console.error("AI database analysis error:", error);
    return next(new AppError("Unable to analyze CV, please try again", 500));
  }

  if (!aiResult) {
    return next(
      new AppError("No response from AI analysis, please try again", 500),
    );
  }

  let parsed = safeParseAIResponse(aiResult);

  if (!parsed) {
    console.warn("CV analysis response parsing failed, using fallback");
    parsed = {
      analysis: {
        score: 75,
        strengths: ["CV successfully loaded"],
        weaknesses: ["Could not fully analyze"],
        suggestions: [
          "Review and update your profile details for better matching",
        ],
      },
    };
  }

  const str = (v) => (Array.isArray(v) ? v.join("\n• ") : v || "N/A");

  // save the analysis linked to the CV
  const analysisData = parsed.analysis || {};
  const analysis = await CVAnalysis.create({
    userId: req.user._id,
    CVId: cv._id,
    atsScore: analysisData.score || 75,
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

  await cv.populate("userId", "firstName lastName");

  // Use HTML generation only
  if (!html) {
    return next(
      new AppError("Please provide HTML content for PDF generation", 400),
    );
  }

  let pdfResult;

  try {
    pdfResult = await htmlToPdf(html, cv._id);
  } catch (error) {
    console.error("PDF generation failed:", error.message);
    return next(new AppError(`PDF generation failed: ${error.message}`, 500));
  }

  const userName = (cv.userId && cv.userId.fullName) ? cv.userId.fullName : (cv.fullName || "User");
  const filename = `cv_${userName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
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

  const aiAnalysis = await analyzeCVSection(section, data);

  let parsed;
  try {
    const clean = aiAnalysis.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    return next(
      new AppError("AI returned an invalid response, please try again", 500),
    );
  }

  if (section === "fullCv") {
    console.log("[CV Analysis] Received data summary:", {
      summary: (data.summary || "").substring(0, 80) + "...",
      experienceCount: (data.experience || []).length,
      educationCount: (data.education || []).length,
      technicalSkillsCount: (data.technicalSkills || []).length,
      softSkillsCount: (data.softSkills || []).length,
      languageCount: (data.language || []).length,
      customSectionsCount: (data.customSections || []).length,
      hasLinkedin: !!data.contact?.linkedin,
      hasGithub: !!data.contact?.github,
    });
    const normalized = normalizeEditorAnalysis(parsed);

    let atsResult = null;
    let overallScore = normalized.overallScore;

    try {
      const cvPayload = { ...data, fullName: fullName || data.fullName || "" };
      const atsReadyData = buildCvDataForATS(cvPayload);
      const aiAtsRaw = await analyzeATSScore(atsReadyData);
      const atsParsed = parseAiJsonResponse(aiAtsRaw);
      atsResult = normalizeATSScore(atsParsed);
      overallScore = atsResult.overallScore;
    } catch (atsErr) {
      console.error("Unified ATS scoring failed in fullCv analysis:", atsErr.message);
    }

    const emptyCount = normalized.sections.filter((s) => s.status === "Empty").length;
    const isEmpty =
      overallScore < 25 &&
      normalized.sections.length > 0 &&
      emptyCount >= Math.floor(normalized.sections.length * 0.6);

    const toBulletText = (value) => (Array.isArray(value) ? value.join("\n• ") : value || "N/A");

    if (data.cvId && atsResult) {
      try {
        await CVAnalysis.deleteMany({ CVId: data.cvId });
        await CVAnalysis.create({
          userId: req.user._id,
          CVId: data.cvId,
          atsScore: atsResult.overallScore,
          strength: toBulletText(atsResult.topStrengths),
          weakness: toBulletText(atsResult.topWeaknesses),
          suggestion: toBulletText(atsResult.improvementSuggestions),
          fullAnalysis: {
            overallScore: atsResult.overallScore,
            sections: atsResult.sections,
            topStrengths: atsResult.topStrengths,
            topWeaknesses: atsResult.topWeaknesses,
            improvementSuggestions: atsResult.improvementSuggestions,
            summary: atsResult.summary,
          },
        });
      } catch (saveErr) {
        console.error("Failed to save CV analysis:", saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        section,
        overallScore,
        sections: normalized.sections,
        topStrengths: atsResult ? atsResult.topStrengths : [],
        topWeaknesses: atsResult ? atsResult.topWeaknesses : [],
        improvementSuggestions: atsResult ? atsResult.improvementSuggestions : [],
        summary: atsResult ? atsResult.summary : "",
        generalAdvice: normalized.generalAdvice,
        issues: normalized.issues,
        isEmpty,
        atsBreakdown: atsResult,
        cvUpdatedAt: new Date().toISOString(),
      },
    });
  }

  const issues = normalizeEditorIssues(parsed.issues || []);
  const atsScore = parsed.atsScore || null;
  const atsFeedback = parsed.atsFeedback || "";

  res.status(200).json({
    success: true,
    data: {
      section,
      issues,
      atsScore,
      atsFeedback,
    },
  });
});

export const skillGapAnalysis = catchAsync(async (req, res, next) => {
  const { cvData, targetRole, additionalInfo } = req.body;

  if (!targetRole || !targetRole.trim()) {
    return next(new AppError("Target role is required", 400));
  }

  if (!cvData) {
    return next(new AppError("CV data is required", 400));
  }

  const result = await analyzeSkillGap({
    cvData,
    targetRole: targetRole.trim(),
    additionalInfo: additionalInfo || "",
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
