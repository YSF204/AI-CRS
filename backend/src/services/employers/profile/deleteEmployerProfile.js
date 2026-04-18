import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";

export const deleteEmployerProfile = async ({ userId }) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer profile not found", 404);
    }

    await Employer.findByIdAndDelete(employer._id);
};

export default deleteEmployerProfile;
