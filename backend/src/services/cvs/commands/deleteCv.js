import CV from "../../../models/CV.js";
import CVAnalysis from "../../../models/CVAnalysis.js";
import AppError from "../../../utils/appError.js";
import verifyCvOwnership from "../helpers/verifyCvOwnership.js";

export const deleteCv = async ({ cvId, userId }) => {
    const cv = await CV.findById(cvId);
    if (!cv) {
        throw new AppError("CV not found", 404);
    }

    verifyCvOwnership(cv, userId);

    await CVAnalysis.deleteMany({ CVId: cv._id });
    await CV.findByIdAndDelete(cvId);
};

export default deleteCv;
