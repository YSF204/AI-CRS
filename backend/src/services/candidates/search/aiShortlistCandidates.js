import Job from "../../../models/Job.js";
import CV from "../../../models/CV.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import { rankCandidates } from "../../../integrations/ai/openai.js";
import { safeParseJson } from "../../shared/aiResponseParser.js";
import { buildRequirementsText } from "./buildRequirementsText.js";
import { formatCandidateCvBlock } from "./formatCandidateCvBlock.js";
import { mapRankedCandidates } from "./mapRankedCandidates.js";

export const aiShortlistCandidates = async ({ jobId, userId }) => {
    const job = await Job.findById(jobId);
    if (!job) {
        throw new AppError("Job not found", 404);
    }

    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer not found", 404);
    }

    if (String(job.employerId) !== String(employer._id)) {
        throw new AppError("You do not own this job", 403);
    }

    const allCvs = await CV.find({}).populate("userId", "firstName lastName email");
    if (!allCvs.length) {
        throw new AppError("No candidates found in the system", 404);
    }

    const requirementsBody = {
        position: job.position,
        description: job.description,
        technicalSkills: job.technicalSkills || [],
        softSkills: job.softSkills || [],
        yearsOfExperience: job.yearsOfExperience,
        language: job.language || [],
        additionalNotes: "",
    };

    const requirementsText = buildRequirementsText(requirementsBody);
    const candidateBlocks = allCvs.map((cv) => formatCandidateCvBlock(cv));

    const aiResponse = await rankCandidates(
        {
            position: job.position,
            description: job.description,
            technicalSkills: job.technicalSkills || [],
            softSkills: job.softSkills || [],
            yearsOfExperience: job.yearsOfExperience,
            language: job.language || [],
        },
        requirementsText,
        candidateBlocks,
    );

    const ranked = safeParseJson(aiResponse, null);
    if (!Array.isArray(ranked)) {
        throw new AppError("Failed to parse AI response", 500);
    }

    const candidates = mapRankedCandidates(allCvs, ranked);

    return {
        job: {
            _id: job._id,
            position: job.position,
            description: job.description,
        },
        candidates,
        total: candidates.length,
    };
};

export default aiShortlistCandidates;
