import CV from "../../../models/CV.js";
import CVAnalysis from "../../../models/CVAnalysis.js";
import AppError from "../../../utils/appError.js";
import { analyzeCVFromDatabase } from "../../../integrations/ai/openai.js";
import verifyCvOwnership from "../helpers/verifyCvOwnership.js";
import parseAiJsonResponse from "../helpers/parseAiJsonResponse.js";

const toBulletText = (value) => (Array.isArray(value) ? value.join("\n• ") : value || "N/A");

const formatCvAsText = (cv) =>
    [
        `Job Title: ${cv.jobTitle}`,
        `Summary: ${cv.summary}`,
        `Email: ${cv.contact?.email || "N/A"}`,
        `Phone: ${cv.contact?.phone || "N/A"}`,
        `Location: ${cv.address?.city || ""}, ${cv.address?.street || ""}`,
        `Experience: ${cv.experience?.map((entry) => `${entry.position} at ${entry.institutionName} (${entry.duration}y) - ${entry.summary || ""}`).join(" | ") || "None"}`,
        `Education: ${cv.education?.map((entry) => `${entry.certification} at ${entry.institutionName} (${entry.duration}y)`).join(" | ") || "None"}`,
        `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
        `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
        `Languages: ${cv.language?.join(", ") || "None"}`,
        ...(cv.customSections?.map(
            (section) =>
                `${section.title}: ${section.items?.map((item) => `${item.name}${item.description ? ` - ${item.description}` : ""}`).join(", ")}`,
        ) || []),
        `Layout: ${JSON.stringify(cv.layout)}`,
    ].join("\n");

export const analyzeSavedCv = async ({ cvId, userId, jobDescription }) => {
    const cv = await CV.findById(cvId);
    if (!cv) {
        throw new AppError("CV not found", 404);
    }

    verifyCvOwnership(cv, userId);

    const aiResult = await analyzeCVFromDatabase(formatCvAsText(cv), jobDescription);
    const parsed = parseAiJsonResponse(aiResult);
    const analysisData = parsed.analysis || {};

    return CVAnalysis.create({
        userId,
        CVId: cv._id,
        atsScore: analysisData.score || 0,
        strength: toBulletText(analysisData.strengths),
        weakness: toBulletText(analysisData.weaknesses),
        suggestion: toBulletText(analysisData.suggestions),
    });
};

export default analyzeSavedCv;
