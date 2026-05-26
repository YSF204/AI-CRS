import AppError from "../../../utils/appError.js";
import { analyzeCVSection as runSectionAnalysis } from "../../../integrations/ai/openai.js";
import parseAiJsonResponse from "../helpers/parseAiJsonResponse.js";

export const analyzeCvSection = async ({ section, data }) => {
    if (!section || !data) {
        throw new AppError("Section and data are required", 400);
    }

    const aiAnalysis = await runSectionAnalysis(section, data);
    const parsed = parseAiJsonResponse(aiAnalysis);

    return {
        section,
        issues: parsed.issues || [],
        atsScore: parsed.atsScore || null,
        atsFeedback: parsed.atsFeedback || "",
    };
};

export default analyzeCvSection;
