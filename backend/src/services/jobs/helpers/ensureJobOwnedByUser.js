import Employer from "../../../models/Employer.js";
import Job from "../../../models/Job.js";
import AppError from "../../../utils/appError.js";
import { assertJobOwnership } from "../../shared/ownershipService.js";

export const ensureJobOwnedByUser = async ({ jobId, userId }) => {
    const [job, employer] = await Promise.all([
        Job.findById(jobId),
        Employer.findOne({ userId }),
    ]);

    if (!job) {
        throw new AppError("Job not found", 404);
    }

    if (!employer) {
        throw new AppError("Employer not found", 404);
    }

    assertJobOwnership(job, employer._id);
    return { job, employer };
};

export default ensureJobOwnedByUser;
