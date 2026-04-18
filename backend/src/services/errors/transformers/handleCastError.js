import AppError from "../../../utils/appError.js";

export const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}.`;
    return new AppError(message, 400);
};

export default handleCastError;
