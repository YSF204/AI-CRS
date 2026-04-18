import Application from "../../../models/Application.js";
import { assertApplicationAccess } from "../../shared/ownershipService.js";

export const getApplicationById = async ({ applicationId, userId }) => {
    const application = await Application.findById(applicationId)
        .populate("userId")
        .populate("jobId")
        .populate("cvId")
        .populate("employerId");

    assertApplicationAccess(application, userId, userId);
    return application;
};

export default getApplicationById;
