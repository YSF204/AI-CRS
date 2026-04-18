import AppError from "../../../utils/appError.js";
import { getEducationSuggestions } from "../../suggestionService.js";

export const getEducationSuggestionsRequest = async (body) => {
    const context = {
        certification: body.certification || "",
        institution: body.institution || "",
        summary: body.summary || "",
        currentInput: body.currentInput || "",
    };

    try {
        return await getEducationSuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate education suggestions", 500);
    }
};

export default getEducationSuggestionsRequest;
