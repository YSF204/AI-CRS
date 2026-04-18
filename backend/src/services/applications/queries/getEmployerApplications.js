import Application from "../../../models/Application.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";

export const getEmployerApplications = async ({ userId }) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer profile not found", 404);
    }

    const applications = await Application.find({ employerId: employer._id })
        .populate("userId", "firstName lastName email")
        .populate("jobId", "position workSite salary")
        .populate("cvId", "jobTitle technicalSkills")
        .sort({ createdAt: -1 });

    return {
        count: applications.length,
        applications,
    };
};

export default getEmployerApplications;
