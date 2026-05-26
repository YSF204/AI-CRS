import Application from "../../../models/Application.js";

export const getMyApplications = async ({ userId }) => {
    const applications = await Application.find({ userId })
        .populate({ path: "jobId", select: "position workSite salary", model: "Job" })
        .populate({ path: "employerId", select: "company.name", model: "Employer" })
        .sort({ createdAt: -1 });

    return {
        count: applications.length,
        applications,
    };
};

export default getMyApplications;
