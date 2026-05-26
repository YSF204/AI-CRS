import CV from "../../../models/CV.js";
import { analyzeApplicationCV } from "../../../integrations/ai/openai.js";
import { resolveUploadedFilePath } from "../../../utils/resolveUploadedFilePath.js";
import { assertCvOwnership } from "../../shared/ownershipService.js";
import {
    mapExistingCvToNormalizedProfile,
    mapManualFormToNormalizedProfile,
    mapParsedPdfToNormalizedProfile,
} from "../../shared/profileInputMapper.js";
import { normalizeAiApplicationAnalysis } from "../../shared/aiResponseParser.js";
import { shouldSkipAnalysis } from "./shouldSkipAnalysis.js";

export const resolveApplicationProfileInput = async ({ user, body, file, jobDescription }) => {
    const {
        cvId,
        skipAnalysis,
        fullName,
        email,
        phone,
        linkedin,
        portfolioUrl,
        yearsOfExperience,
        technicalSkills,
        softSkills,
        languages,
        certifications,
        education,
        summary,
        additionalInformation,
    } = body;

    const manualOverrides = {
        fullName,
        email,
        phone,
        linkedin,
        portfolioUrl,
        yearsOfExperience,
        technicalSkills,
        softSkills,
        languages,
        certifications,
        education,
        summary,
        additionalInformation,
    };

    let cvData = null;
    let parsedPdfAnalysis = null;
    let applicationMethod = "manual";
    let isManualApplication = cvId === "manual" || !cvId;

    if (cvId && cvId !== "manual") {
        cvData = await CV.findById(cvId);
        assertCvOwnership(cvData, user._id);
        applicationMethod = file ? "uploadPdf" : "existingCv";
        isManualApplication = false;
    } else if (file) {
        applicationMethod = "uploadPdf";
        isManualApplication = false;

        if (!shouldSkipAnalysis(skipAnalysis)) {
            const { filePath, cleanup } = await resolveUploadedFilePath(file);
            try {
                const aiRaw = await analyzeApplicationCV(filePath, jobDescription || "");
                parsedPdfAnalysis = normalizeAiApplicationAnalysis(aiRaw);
            } finally {
                if (cleanup) await cleanup();
            }
        }
    }

    let normalizedProfile;
    if (cvData) {
        normalizedProfile = mapExistingCvToNormalizedProfile(cvData, manualOverrides);
    } else if (parsedPdfAnalysis?.cvData) {
        normalizedProfile = mapParsedPdfToNormalizedProfile({
            parsedPdfAnalysis,
            user,
            manualOverrides,
        });
    } else {
        normalizedProfile = mapManualFormToNormalizedProfile({ body, user });
    }

    return {
        normalizedProfile,
        applicationMethod,
        cvData,
        parsedPdfAnalysis,
        isManualApplication,
    };
};

export default resolveApplicationProfileInput;
