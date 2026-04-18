import AppError from "../../../utils/appError.js";
import { getExperienceSuggestions } from "../../suggestionService.js";

export const getExperienceEntrySuggestionsRequest = async (body) => {
    const context = {
        position: body.position || "",
        company: body.company || "",
        summary: body.summary || "",
        currentInput: body.currentInput || "",
    };

    try {
        return await getExperienceSuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate experience suggestions", 500);
    }
};

export default getExperienceEntrySuggestionsRequest;
