import AppError from "../../../utils/appError.js";

export const handleValidationError = (error) => {
    const errors = Object.values(error.errors || {}).map((entry) => entry.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
};

export default handleValidationError;
