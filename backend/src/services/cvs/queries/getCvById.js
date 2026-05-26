import CV from "../../../models/CV.js";
import AppError from "../../../utils/appError.js";
import verifyCvOwnership from "../helpers/verifyCvOwnership.js";

export const getCvById = async ({ cvId, userId }) => {
    const cv = await CV.findById(cvId);
    if (!cv) {
        throw new AppError("CV not found", 404);
    }

    verifyCvOwnership(cv, userId);
    return cv;
};

export default getCvById;
