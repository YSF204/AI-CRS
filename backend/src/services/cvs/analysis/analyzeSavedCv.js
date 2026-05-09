import CV from "../../../models/CV.js";
import CVAnalysis from "../../../models/CVAnalysis.js";
import AppError from "../../../utils/appError.js";
import { analyzeATSScore, analyzeCVSection as runSectionAnalysis } from "../../../integrations/ai/openai.js";
import verifyCvOwnership from "../helpers/verifyCvOwnership.js";
import parseAiJsonResponse from "../helpers/parseAiJsonResponse.js";
import { normalizeATSScore } from "./normalizeScore.js";

const toBulletText = (value) => (Array.isArray(value) ? value.join("\n• ") : value || "N/A");

export const buildCvDataForATS = (cv) => ({
  fullName: cv.fullName || "",
  jobTitle: cv.jobTitle || "",
  summary: cv.summary || "",
  contact: {
    phone: cv.contact?.phone || "",
    email: cv.contact?.email || "",
    linkedin: cv.contact?.linkedin || "",
    github: cv.contact?.github || "",
  },
  address: {
    city: cv.address?.city || "",
    country: cv.address?.country || "",
  },
  experience: (cv.experience || []).map((e) => ({
    position: e.position || "",
    institutionName: e.institutionName || "",
    durationFrom: e.durationFrom || "",
    durationTo: e.durationTo || "",
    summary: e.summary || "",
  })),
  education: (cv.education || []).map((e) => ({
    institutionName: e.institutionName || "",
    certification: e.certification || "",
    durationFrom: e.durationFrom || "",
    durationTo: e.durationTo || "",
    summary: e.summary || "",
  })),
  technicalSkills: cv.technicalSkills || [],
  softSkills: cv.softSkills || [],
  languages: cv.language || cv.languages || [],
  certifications:
    cv.customSections
      ?.filter((s) => s.sectionType === "certifications")
      .flatMap((s) => s.items.map((item) => item.name || "")) || [],
});

export const runUnifiedATSScoring = async (cv) => {
  const cvData = buildCvDataForATS(cv);
  const aiResult = await analyzeATSScore(cvData);
  const raw = parseAiJsonResponse(aiResult);
  return normalizeATSScore(raw);
};

export const analyzeSavedCv = async ({ cvId, userId, jobDescription }) => {
  const cv = await CV.findById(cvId);
  if (!cv) throw new AppError("CV not found", 404);
  verifyCvOwnership(cv, userId);

  const normalized = await runUnifiedATSScoring(cv);

  return CVAnalysis.create({
    userId,
    CVId: cv._id,
    atsScore: normalized.overallScore,
    strength: toBulletText(normalized.topStrengths),
    weakness: toBulletText(normalized.topWeaknesses),
    suggestion: toBulletText(normalized.improvementSuggestions),
  });
};

export default analyzeSavedCv;
