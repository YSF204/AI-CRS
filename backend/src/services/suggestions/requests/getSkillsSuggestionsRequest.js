import AppError from "../../../utils/appError.js";
import { getSkillsSuggestions } from "../../suggestionService.js";

export const getSkillsSuggestionsRequest = async (body) => {
    const context = {
        jobTitle: body.jobTitle || "",
        experience: body.experience || [],
        skills: body.skills || [],
        industry: body.industry || "general",
        currentInput: body.currentInput || "",
    };

    try {
        return await getSkillsSuggestions(context);
    } catch (_error) {
        throw new AppError("Failed to generate skills suggestions", 500);
    }
};

export default getSkillsSuggestionsRequest;
