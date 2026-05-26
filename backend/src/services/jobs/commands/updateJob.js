import Job from "../../../models/Job.js";
import { ensureJobOwnedByUser } from "../helpers/ensureJobOwnedByUser.js";

export const updateJob = async ({ jobId, userId, body }) => {
    await ensureJobOwnedByUser({ jobId, userId });

    return Job.findByIdAndUpdate(jobId, { ...body }, { new: true, runValidators: true });
};

export default updateJob;
