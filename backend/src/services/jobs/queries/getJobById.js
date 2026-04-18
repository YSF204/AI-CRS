import Job from "../../../models/Job.js";
import AppError from "../../../utils/appError.js";

export const getJobById = async (id) => {
    const job = await Job.findById(id).populate("employerId", "company");
    if (!job) {
        throw new AppError("Job not found", 404);
    }

    return job;
};

export default getJobById;
