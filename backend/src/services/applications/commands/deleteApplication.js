import Application from "../../../models/Application.js";
import AppError from "../../../utils/appError.js";
import { assertApplicationAccess } from "../../shared/ownershipService.js";

export const deleteApplication = async ({ applicationId, userId }) => {
    const application = await Application.findById(applicationId).populate("employerId");
    if (!application) {
        throw new AppError("Application not found", 404);
    }

    assertApplicationAccess(application, userId, userId);
    await Application.findByIdAndDelete(applicationId);

    return { deleted: true };
};

export default deleteApplication;
