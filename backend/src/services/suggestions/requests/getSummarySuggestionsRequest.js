import AppError from "../../../utils/appError.js";
import { getSummarySuggestions } from "../../suggestionService.js";

export const getSummarySuggestionsRequest = async (body) => {
    const context = {
        jobTitle: body.jobTitle || "",
        experience: body.experience || [],
        skills: body.skills || [],
        currentInput: body.currentInput || "",
    };

    try {
        return await getSummarySuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate summary suggestions", 500);
    }
};

export default getSummarySuggestionsRequest;
