import {
    calculateMatchPercentage,
    generateAIMatchAnalysis,
    extractStrengthsWeaknesses,
} from "../../matching/matchingService.js";

export const computeAnalyzeScore = async ({
    normalizedProfile,
    job,
    isPdfUpload,
    parsedPdfAnalysis,
    userId,
}) => {
    const matchResult = calculateMatchPercentage(normalizedProfile, job);

    let percentageScore;
    let strengths = [];
    let weaknesses = [];
    let matchAnalysis = "";

    if (isPdfUpload) {
        percentageScore = parsedPdfAnalysis?.overall_fit_percentage ?? matchResult.percentage;
        strengths = parsedPdfAnalysis?.strengths || [];
        weaknesses = (parsedPdfAnalysis?.gaps || []).map(
            (gap) => `${gap.severity || "Unknown"} Gap: ${gap.gap || ""} - ${gap.suggestion || ""}`,
        );
        matchAnalysis = parsedPdfAnalysis?.recruiter_summary || "";
    } else {
        try {
            const aiAnalysis = await generateAIMatchAnalysis(
                normalizedProfile,
                job,
                job._id,
                userId,
                "EXISTING_PROFILE",
            );

            if (aiAnalysis && !aiAnalysis.error) {
                percentageScore = aiAnalysis.overall_fit_percentage ?? matchResult.percentage;
                strengths = aiAnalysis.strengths || [];
                weaknesses = (aiAnalysis.gaps || []).map(
                    (gap) => `${gap.severity || "Unknown"} Gap: ${gap.gap || ""} - ${gap.suggestion || ""}`,
                );
                matchAnalysis = aiAnalysis.recruiter_summary || "";
            }
        } catch (_error) {
            matchAnalysis = "Analysis generation failed";
        }
    }

    if (percentageScore == null) {
        percentageScore = matchResult.percentage;
    }

    if (strengths.length === 0 && weaknesses.length === 0) {
        const extracted = extractStrengthsWeaknesses(matchAnalysis, matchResult.breakdown);
        strengths = extracted.strengths;
        weaknesses = extracted.weaknesses;
    }

    return {
        matchPercentage: percentageScore,
        matchDetails: {
            ...matchResult.breakdown,
            matchAnalysis,
        },
        strengths,
        weaknesses,
        backgroundAnalysisRequired: false,
    };
};

export default computeAnalyzeScore;
