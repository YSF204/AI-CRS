import Application from "../../../models/Application.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import { sendApplicantStatusUpdate } from "../notifications/sendApplicantStatusUpdate.js";

export const updateApplicationStatus = async ({ applicationId, status, userId }) => {
    if (!["pending", "accepted", "rejected"].includes(status)) {
        throw new AppError("Invalid status value", 400);
    }

    const application = await Application.findById(applicationId);
    if (!application) {
        throw new AppError("Application not found", 404);
    }

    const employer = await Employer.findById(application.employerId);
    if (!employer || String(employer.userId) !== String(userId)) {
        throw new AppError("Not authorized to update this application", 403);
    }

    application.status = status;
    await application.save();

    try {
        await sendApplicantStatusUpdate({
            applicantEmail: application.applicantInfo?.email,
            fullName: application.applicantInfo?.fullName || "Candidate",
            status,
        });
    } catch (_error) {
        // best effort
    }

    return application;
};

export default updateApplicationStatus;
