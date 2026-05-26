import Employer from "../../../models/Employer.js";
import potentialCandidates from "../../../models/PotentialCandidates.js";
import AppError from "../../../utils/appError.js";

export const getEmployerSearchHistory = async ({ userId }) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer not found", 404);
    }

    return potentialCandidates
        .find({ employerId: employer._id })
        .populate("candidate.userId", "firstName lastName email")
        .populate("candidate.CVId", "jobTitle summary technicalSkills experience education")
        .sort("-createdAt");
};

export default getEmployerSearchHistory;
