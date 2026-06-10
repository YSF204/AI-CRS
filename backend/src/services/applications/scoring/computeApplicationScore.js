import { calculateMatchPercentage, generateAIMatchAnalysis } from "../../matching/matchingService.js";
import { shouldSkipAnalysis } from "../profile/shouldSkipAnalysis.js";

export const computeApplicationScore = async ({
    normalizedProfile,
    job,
    isPdfUpload,
    parsedPdfAnalysis,
    skipAnalysis,
    isManualApplication,
    userId,
    preComputedMatchPercentage,
    preComputedMatchDetails,
}) => {
    // ─── Use pre-computed result from prior analyze step ───────────────────────
    // When the user clicks "Analyze My Fit" and then "Submit Application",
    // the frontend sends the already-computed score so we store exactly what
    // the user saw — no second AI call, no different result.
    if (preComputedMatchPercentage != null && !isNaN(Number(preComputedMatchPercentage))) {
        const localResult = calculateMatchPercentage(normalizedProfile, job);
        return {
            matchPercentage: Number(preComputedMatchPercentage),
            matchDetails: {
                ...(preComputedMatchDetails || localResult.breakdown),
                matchAnalysis: preComputedMatchDetails?.matchAnalysis || "",
            },
            backgroundAnalysisRequired: false,
        };
    }

    // ─── Normal scoring path ────────────────────────────────────────────────────
    const matchResult = calculateMatchPercentage(normalizedProfile, job);

    let matchPercentage = matchResult.percentage;
    let matchAnalysis = "";
    let backgroundAnalysisRequired = false;

    if (shouldSkipAnalysis(skipAnalysis)) {
        backgroundAnalysisRequired = true;
        if (isPdfUpload) {
            matchPercentage = null;
            matchAnalysis = "Analysis pending...";
        } else {
            matchPercentage = matchResult.percentage;
            matchAnalysis = "AI analysis is running in the background. Check back shortly.";
        }
    } else if (isPdfUpload && parsedPdfAnalysis) {
        matchPercentage = parsedPdfAnalysis.overall_fit_percentage ?? matchResult.percentage;
        matchAnalysis = parsedPdfAnalysis.recruiter_summary || "";
    } else if (!isManualApplication) {
        try {
            const aiAnalysis = await generateAIMatchAnalysis(
                normalizedProfile,
                job,
                job._id,
                userId,
                "EXISTING_PROFILE",
            );

            if (aiAnalysis && !aiAnalysis.error) {
                matchPercentage = aiAnalysis.overall_fit_percentage ?? matchResult.percentage;
                matchAnalysis = aiAnalysis.recruiter_summary || "";
            }
        } catch (_error) {
            matchPercentage = matchResult.percentage;
            matchAnalysis = "Analysis generation failed";
        }
    }

    return {
        matchPercentage,
        matchDetails: {
            ...matchResult.breakdown,
            matchAnalysis,
        },
        backgroundAnalysisRequired,
    };
};

export default computeApplicationScore;
