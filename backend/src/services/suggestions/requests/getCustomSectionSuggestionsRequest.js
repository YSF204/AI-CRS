import AppError from "../../../utils/appError.js";
import { getCustomSectionSuggestions } from "../../suggestionService.js";

export const getCustomSectionSuggestionsRequest = async (body) => {
    const context = {
        sectionTitle: body.sectionTitle || "",
        currentContent: body.currentContent || "",
        jobTitle: body.jobTitle || "",
        currentInput: body.currentInput || "",
    };

    try {
        return await getCustomSectionSuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate custom section suggestions", 500);
    }
};

export default getCustomSectionSuggestionsRequest;
