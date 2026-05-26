import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";

export const createEmployerProfile = async ({ userId, company }) => {
    if (!company) {
        throw new AppError("Please provide company details", 400);
    }

    const existing = await Employer.findOne({ userId });
    if (existing) {
        throw new AppError("Employer profile already exists", 400);
    }

    return Employer.create({ userId, company });
};

export default createEmployerProfile;
