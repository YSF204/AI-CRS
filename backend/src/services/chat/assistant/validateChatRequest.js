import AppError from "../../../utils/appError.js";

export const validateChatRequest = ({ messages }) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new AppError("Messages array is required", 400);
    }
};

export default validateChatRequest;
