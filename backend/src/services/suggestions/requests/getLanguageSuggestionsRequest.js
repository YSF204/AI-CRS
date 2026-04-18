import AppError from "../../../utils/appError.js";
import { getLanguageSuggestions } from "../../suggestionService.js";

export const getLanguageSuggestionsRequest = async (body) => {
    const context = {
        jobTitle: body.jobTitle || "",
        skills: body.skills || [],
        industry: body.industry || "general",
        currentInput: body.currentInput || "",
    };

    try {
        return await getLanguageSuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate language suggestions", 500);
    }
};

export default getLanguageSuggestionsRequest;
