import Application from "../../../models/Application.js";
import Employer from "../../../models/Employer.js";
import Job from "../../../models/Job.js";
import AppError from "../../../utils/appError.js";

export const getApplicationsByJob = async ({ userId, jobId }) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer profile not found", 404);
    }

    const job = await Job.findOne({ _id: jobId, employerId: employer._id });
    if (!job) {
        throw new AppError("Job not found or not owned by you", 404);
    }

    const applications = await Application.find({ jobId })
        .populate("userId", "firstName lastName email")
        .populate("cvId")
        .sort({ createdAt: -1 });

    return {
        count: applications.length,
        applications,
    };
};

export default getApplicationsByJob;
