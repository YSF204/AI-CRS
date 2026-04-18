import Job from "../../../models/Job.js";
import AppError from "../../../utils/appError.js";
import { findEmployerProfileByUserId } from "../helpers/findEmployerProfileByUserId.js";

export const createJob = async ({ userId, body }) => {
    const {
        position,
        description,
        salary,
        workSite,
        workDuration,
        yearsOfExperience,
        language,
        certification,
        softSkills,
        technicalSkills,
    } = body;

    if (
        !position ||
        !description ||
        !salary ||
        !workSite ||
        !workDuration ||
        !yearsOfExperience
    ) {
        throw new AppError("Please provide all required fields", 400);
    }

    const employer = await findEmployerProfileByUserId(userId);

    return Job.create({
        employerId: employer._id,
        position,
        description,
        salary,
        workSite,
        workDuration,
        yearsOfExperience,
        language: language || [],
        certification: certification || [],
        softSkills: softSkills || [],
        technicalSkills: technicalSkills || [],
        status: "OPEN",
    });
};

export default createJob;
