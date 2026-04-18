import AppError from "../../../utils/appError.js";

export const handleInvalidJwtError = () =>
    new AppError("Invalid token. Please log in again.", 401);

export default handleInvalidJwtError;
