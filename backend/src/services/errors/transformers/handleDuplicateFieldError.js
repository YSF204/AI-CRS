import AppError from "../../../utils/appError.js";

const getDuplicateValue = (error) => {
    const rawMessage = error.errmsg || error.message || "";
    const match = rawMessage.match(/(["'])(\\?.)*?\1/);
    return match ? match[0] : "Value";
};

export const handleDuplicateFieldError = (error) => {
    const value = getDuplicateValue(error);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

export default handleDuplicateFieldError;
