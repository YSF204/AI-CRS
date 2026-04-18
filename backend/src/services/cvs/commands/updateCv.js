import CV from "../../../models/CV.js";
import AppError from "../../../utils/appError.js";
import verifyCvOwnership from "../helpers/verifyCvOwnership.js";

export const updateCv = async ({ cvId, userId, payload }) => {
    const cv = await CV.findById(cvId);
    if (!cv) {
        throw new AppError("CV not found", 404);
    }

    verifyCvOwnership(cv, userId);

    const { layout, ...rest } = payload;
    const updateData = { ...rest, userId };

    if (layout?.sectionOrder !== undefined) {
        updateData["layout.sectionOrder"] = layout.sectionOrder;
    }
    if (layout?.visibleSections !== undefined) {
        updateData["layout.visibleSections"] = layout.visibleSections;
    }

    return CV.findByIdAndUpdate(cvId, updateData, { new: true, runValidators: true });
};

export default updateCv;
