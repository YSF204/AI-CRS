import AppError from "../../../utils/appError.js";

export const parseAiJsonResponse = (response, errorMessage = "AI returned an invalid response, please try again") => {
    try {
        const clean = response.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    } catch (_error) {
        throw new AppError(errorMessage, 500);
    }
};

export default parseAiJsonResponse;
