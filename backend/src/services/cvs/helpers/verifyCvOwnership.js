import AppError from "../../../utils/appError.js";

export const verifyCvOwnership = (cv, userId) => {
    if (cv.userId.toString() !== userId.toString()) {
        throw new AppError("Not authorized to access this CV", 403);
    }
};

export default verifyCvOwnership;
