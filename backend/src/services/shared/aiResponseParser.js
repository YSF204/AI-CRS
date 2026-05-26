export const stripCodeFences = (value) => {
    if (typeof value !== "string") return "";
    return value
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
};

export const safeParseJson = (value, fallback = null) => {
    if (value == null) return fallback;
    if (typeof value === "object") return value;

    try {
        return JSON.parse(stripCodeFences(value));
    } catch (error) {
        return fallback;
    }
};

export const normalizeAiArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value.filter(Boolean);
};

export const normalizeAiApplicationAnalysis = (value) => {
    const parsed = safeParseJson(value, {});

    return {
        overall_fit_percentage:
            typeof parsed?.overall_fit_percentage === "number"
                ? parsed.overall_fit_percentage
                : null,
        recruiter_summary:
            typeof parsed?.recruiter_summary === "string"
                ? parsed.recruiter_summary
                : "",
        strengths: normalizeAiArray(parsed?.strengths),
        gaps: normalizeAiArray(parsed?.gaps),
        cvData: parsed?.cvData && typeof parsed.cvData === "object" ? parsed.cvData : null,
        candidate_name:
            typeof parsed?.candidate_name === "string" ? parsed.candidate_name : "",
    };
};

export default {
    stripCodeFences,
    safeParseJson,
    normalizeAiArray,
    normalizeAiApplicationAnalysis,
};
