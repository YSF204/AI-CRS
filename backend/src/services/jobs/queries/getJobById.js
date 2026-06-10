import Job from "../../../models/Job.js";
import AppError from "../../../utils/appError.js";
import { getExternalJobs } from "./getExternalJobs.js";

export const getJobById = async (id) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isMongoId) {
        const externalJobs = await getExternalJobs();
        const found = externalJobs.find((j) => j.id === id || j.externalUrl === id);
        if (found) {
            return {
                _id: found.id,
                position: found.title,
                employerId: {
                    company: {
                        name: found.company,
                    },
                },
                workDuration: found.type,
                workSite: found.raw?.workSite || found.location,
                createdAt: found.posted === "Recently" ? new Date() : found.posted,
                salary: found.raw?.salary || null,
                description: found.raw?.description || found.title,
                yearsOfExperience: found.raw?.yearsOfExperience || 0,
                technicalSkills: found.raw?.technicalSkills || [],
                softSkills: found.raw?.softSkills || [],
                language: found.raw?.language || [],
                externalUrl: found.externalUrl,
            };
        }
    }

    const job = await Job.findById(id).populate("employerId", "company");
    if (!job) {
        throw new AppError("Job not found", 404);
    }

    return job;
};

export default getJobById;
