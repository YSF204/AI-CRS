import Job from "../../../models/Job.js";
import { ensureJobOwnedByUser } from "../helpers/ensureJobOwnedByUser.js";

export const deleteJob = async ({ jobId, userId }) => {
    await ensureJobOwnedByUser({ jobId, userId });
    await Job.findByIdAndDelete(jobId);

    return { deleted: true };
};

export default deleteJob;
