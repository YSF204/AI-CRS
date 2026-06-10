import Employer from "../../../models/Employer.js";
import potentialCandidates from "../../../models/PotentialCandidates.js";
import AppError from "../../../utils/appError.js";

const getCandidateName = (cv, user) => {
    const fullName = typeof cv.fullName === "string" ? cv.fullName.trim() : "";
    if (fullName) return fullName;

    if (user && typeof user === "object") {
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        if (name) return name;
    }

    return "";
};

export const getEmployerSearchHistory = async ({ userId }) => {
    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer not found", 404);
    }

    const history = await potentialCandidates
        .find({ employerId: employer._id })
        .populate("candidate.userId", "firstName lastName email")
        .populate("candidate.CVId")
        .sort("-createdAt");

    return history.map((record) => {
        const recordObj = record.toObject();
        if (Array.isArray(recordObj.candidate)) {
            recordObj.candidate = recordObj.candidate.map((c) => {
                const cv = c.CVId || {};
                const user = c.userId || {};

                const contact = {
                    email: cv.contact?.email || user.email || "",
                    phone: cv.contact?.phone || "",
                    github: cv.contact?.github || "",
                    linkedin: cv.contact?.linkedin || "",
                };

                return {
                    cvId: cv._id || c.CVId,
                    userId: user._id || c.userId,
                    rank: c.rank,
                    matchScore: c.matchScore,
                    reasoning: c.reasoning,
                    strengths: c.strengths || [],
                    skillsMatched: c.skillsMatched || [],
                    skillsMissing: c.skillsMissing || [],
                    profile: {
                        name: getCandidateName(cv, user),
                        email: contact.email,
                        contact,
                        jobTitle: cv.jobTitle,
                        summary: cv.summary,
                        technicalSkills: cv.technicalSkills,
                        experience: cv.experience,
                        education: cv.education,
                    },
                };
            });
        }
        return recordObj;
    });
};

export default getEmployerSearchHistory;
