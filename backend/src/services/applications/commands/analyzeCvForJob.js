import AppError from "../../../utils/appError.js";
import { resolveAnalyzeProfileInput } from "../profile/resolveAnalyzeProfileInput.js";
import { computeAnalyzeScore } from "../scoring/computeAnalyzeScore.js";
import { findOpenJobById } from "../helpers/findOpenJobById.js";

export const analyzeCvForJob = async ({ body, user, file }) => {
    const { jobId, cvId } = body;
    if (!jobId) {
        throw new AppError("Job ID is required", 400);
    }

    const job = await findOpenJobById(jobId);
    const profileInput = await resolveAnalyzeProfileInput({
        user,
        cvId,
        file,
        jobDescription: job.description || "",
    });

    const score = await computeAnalyzeScore({
        normalizedProfile: profileInput.normalizedProfile,
        job,
        isPdfUpload: Boolean(file),
        parsedPdfAnalysis: profileInput.parsedPdfAnalysis,
        userId: user._id,
    });

    return {
        ...score,
        jobId,
        cvId: cvId || profileInput.cvData?._id || `temp_${Date.now()}`,
        applicantInfo: {
            fullName: profileInput.normalizedProfile.fullName || "Candidate",
            email: profileInput.normalizedProfile.email || "",
            phone: profileInput.normalizedProfile.phone || "",
        },
    };
};

export default analyzeCvForJob;
