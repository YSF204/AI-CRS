import Job from "../../../models/Job.js";

export const getAllJobs = async () =>
    Job.find({ status: "OPEN" })
        .populate("employerId", "company")
        .sort({ createdAt: -1 });

export default getAllJobs;
