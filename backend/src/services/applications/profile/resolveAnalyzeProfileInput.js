import CV from "../../../models/CV.js";
import AppError from "../../../utils/appError.js";
import { analyzeApplicationCV } from "../../../integrations/ai/openai.js";
import { resolveUploadedFilePath } from "../../../utils/resolveUploadedFilePath.js";
import { assertCvOwnership } from "../../shared/ownershipService.js";
import { mapExistingCvToNormalizedProfile, mapParsedPdfToNormalizedProfile } from "../../shared/profileInputMapper.js";
import { normalizeAiApplicationAnalysis } from "../../shared/aiResponseParser.js";

export const resolveAnalyzeProfileInput = async ({ user, cvId, file, jobDescription }) => {
    if (!cvId && !file) {
        throw new AppError("Please select a CV or upload a PDF file", 400);
    }

    if (file) {
        const { filePath, cleanup } = await resolveUploadedFilePath(file);
        try {
            const aiRaw = await analyzeApplicationCV(filePath, jobDescription || "");
            const parsedPdfAnalysis = normalizeAiApplicationAnalysis(aiRaw);
            const normalizedProfile = mapParsedPdfToNormalizedProfile({ parsedPdfAnalysis, user });

            return {
                normalizedProfile,
                applicationMethod: "uploadPdf",
                cvData: null,
                parsedPdfAnalysis,
                isManualApplication: false,
            };
        } finally {
            if (cleanup) await cleanup();
        }
    }

    const cvData = await CV.findById(cvId);
    assertCvOwnership(cvData, user._id);

    return {
        normalizedProfile: mapExistingCvToNormalizedProfile(cvData),
        applicationMethod: "existingCv",
        cvData,
        parsedPdfAnalysis: null,
        isManualApplication: false,
    };
};

export default resolveAnalyzeProfileInput;
