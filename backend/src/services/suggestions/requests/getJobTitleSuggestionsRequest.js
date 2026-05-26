import AppError from "../../../utils/appError.js";
import { getJobTitleSuggestions } from "../../suggestionService.js";

export const getJobTitleSuggestionsRequest = async (body) => {
    const context = {
        jobTitle: body.jobTitle || "",
        experience: body.experience || [],
        skills: body.skills || [],
        industry: body.industry || "general",
        currentInput: body.currentInput || "",
    };

    try {
        return await getJobTitleSuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate job title suggestions", 500);
    }
};

export default getJobTitleSuggestionsRequest;
