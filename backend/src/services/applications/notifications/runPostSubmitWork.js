import { analyzeApplicationCV } from "../../../integrations/ai/openai.js";
import { resolveUploadedFilePath } from "../../../utils/resolveUploadedFilePath.js";
import { normalizeAiApplicationAnalysis } from "../../shared/aiResponseParser.js";
import { runDeferredAnalysis } from "../scoring/runDeferredAnalysis.js";
import { sendEmployerNotification } from "./sendEmployerNotification.js";
import { sendApplicantConfirmation } from "./sendApplicantConfirmation.js";

export const runPostSubmitWork = async ({
    application,
    normalizedProfile,
    job,
    userId,
    isPdfUpload,
    isManualApplication,
    skipAnalysis,
    file,
}) => {
    try {
        await sendEmployerNotification({
            applicationId: application._id,
            employerId: job.employerId,
            applicant: normalizedProfile,
            job,
            matchPercentage: application.matchPercentage,
            matchDetails: application.matchDetails,
        });
    } catch (_error) {
        // best effort
    }

    try {
        await sendApplicantConfirmation({
            applicant: normalizedProfile,
            job,
            matchPercentage: application.matchPercentage,
        });
    } catch (_error) {
        // best effort
    }

    await runDeferredAnalysis({
        application,
        normalizedProfile,
        job,
        userId,
        isPdfUpload,
        isManualApplication,
        skipAnalysis,
        parsePdfInBackground: file
            ? async () => {
                const { filePath, cleanup } = await resolveUploadedFilePath(file);
                try {
                    const raw = await analyzeApplicationCV(filePath, job.description || "");
                    return normalizeAiApplicationAnalysis(raw);
                } finally {
                    if (cleanup) await cleanup();
                }
            }
            : null,
    });
};

export default runPostSubmitWork;
