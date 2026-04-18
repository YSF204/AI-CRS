import Job from "../../../models/Job.js";
import AppError from "../../../utils/appError.js";

export const findOpenJobById = async (jobId) => {
    const job = await Job.findById(jobId).populate("employerId");

    if (!job) {
        throw new AppError("Job not found", 404);
    }

    if (job.status !== "OPEN") {
        throw new AppError("This job is no longer open", 400);
    }

    return job;
};

export default findOpenJobById;
