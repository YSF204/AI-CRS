import Job from "../../../models/Job.js";
import { findEmployerProfileByUserId } from "../helpers/findEmployerProfileByUserId.js";

export const getEmployerJobs = async ({ userId }) => {
    const employer = await findEmployerProfileByUserId(userId);
    return Job.find({ employerId: employer._id }).sort({ createdAt: -1 });
};

export default getEmployerJobs;
