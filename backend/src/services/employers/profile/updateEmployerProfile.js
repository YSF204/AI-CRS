import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";

export const updateEmployerProfile = async ({ userId, body }) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer profile not found", 404);
    }

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const timeSinceLastUpdate = Date.now() - employer.updatedAt.getTime();
    if (timeSinceLastUpdate < sevenDaysMs) {
        const daysLeft = Math.ceil((sevenDaysMs - timeSinceLastUpdate) / (1000 * 60 * 60 * 24));
        throw new AppError(
            `Profile details can only be changed once every 7 days. Try again in ${daysLeft} days.`,
            429,
        );
    }

    if (body.company) {
        if (body.company.name !== undefined) employer.company.name = body.company.name;
        if (body.company.website !== undefined) employer.company.website = body.company.website;
        if (body.company.contactEmail !== undefined) employer.company.contactEmail = body.company.contactEmail;
        if (body.company.branches !== undefined) employer.company.branches = body.company.branches;
    }

    await employer.save();
    return employer;
};

export default updateEmployerProfile;
