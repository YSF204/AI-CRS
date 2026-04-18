import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";

export const findEmployerProfileByUserId = async (userId) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer profile not found", 404);
    }

    return employer;
};

export default findEmployerProfileByUserId;
