import AppError from "../../../utils/appError.js";
import { clearSuggestionCache } from "../../suggestionService.js";

export const clearSuggestionsCacheRequest = () => {
    try {
        clearSuggestionCache();
    } catch (_error) {
        throw new AppError("Failed to clear suggestion cache", 500);
    }
};

export default clearSuggestionsCacheRequest;
