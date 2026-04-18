import AppError from "../../../utils/appError.js";

export const handleExpiredJwtError = () =>
    new AppError("Your token has expired. Please log in again.", 401);

export default handleExpiredJwtError;
