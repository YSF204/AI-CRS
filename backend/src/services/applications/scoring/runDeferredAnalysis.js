import { calculateMatchPercentage, generateAIMatchAnalysis } from "../../matching/matchingService.js";
import { shouldSkipAnalysis } from "../profile/shouldSkipAnalysis.js";

export const runDeferredAnalysis = async ({
    application,
    normalizedProfile,
    job,
    userId,
    isPdfUpload,
    isManualApplication,
    skipAnalysis,
    parsePdfInBackground,
}) => {
    if (!isPdfUpload && !shouldSkipAnalysis(skipAnalysis)) {
        return { updated: false };
    }

    try {
        let aiAnalysis = null;
        let parsedBackgroundPdf = null;

        if (isPdfUpload && typeof parsePdfInBackground === "function") {
            parsedBackgroundPdf = await parsePdfInBackground();
            aiAnalysis = parsedBackgroundPdf;
        } else {
            aiAnalysis = await generateAIMatchAnalysis(
                normalizedProfile,
                job,
                job._id,
                userId,
                isManualApplication ? "MANUAL_FORM" : "EXISTING_PROFILE",
            );
        }

        const update = {};
        if (parsedBackgroundPdf) {
            const matchResult = calculateMatchPercentage(normalizedProfile, job);
            update.matchPercentage = parsedBackgroundPdf.overall_fit_percentage ?? matchResult.percentage;
            update["matchDetails.matchAnalysis"] =
                parsedBackgroundPdf.recruiter_summary || "Analysis complete.";
        } else if (aiAnalysis && !aiAnalysis.error) {
            update["matchDetails.matchAnalysis"] = aiAnalysis.recruiter_summary || "";
        } else {
            update["matchDetails.matchAnalysis"] = "Background AI analysis failed.";
        }

        await application.constructor.findByIdAndUpdate(application._id, update);
        return { updated: true };
    } catch (_error) {
        await application.constructor.findByIdAndUpdate(application._id, {
            "matchDetails.matchAnalysis": "Failed to analyze during background check.",
        });
        return { updated: false };
    }
};

export default runDeferredAnalysis;
