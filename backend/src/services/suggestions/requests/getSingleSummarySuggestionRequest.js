import AppError from "../../../utils/appError.js";
import { getSummarySuggestions } from "../../suggestionService.js";

export const getSingleSummarySuggestionRequest = async (body) => {
    const context = {
        jobTitle: body.jobTitle || "",
        experience: body.experience || [],
        skills: body.skills || [],
        currentInput: body.currentInput || "",
    };

    try {
        const suggestions = await getSummarySuggestions(context);
        return suggestions[0] || "";
    } catch (_error) {
        throw new AppError("Failed to generate single summary suggestion", 500);
    }
};

export default getSingleSummarySuggestionRequest;
