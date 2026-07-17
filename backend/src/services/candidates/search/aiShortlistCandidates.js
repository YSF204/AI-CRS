import Job from "../../../models/Job.js";
import Application from "../../../models/Application.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import { rankCandidates } from "../../../integrations/ai/openai.js";
import { safeParseJson } from "../../shared/aiResponseParser.js";
import { buildRequirementsText } from "./buildRequirementsText.js";
import { formatCandidateCvBlock, normalizeApplicationToCvLike } from "./formatCandidateCvBlock.js";
import { mapRankedApplications } from "./mapRankedCandidates.js";
import { calculateMatchPercentage } from "../../matching/matchingService.js";

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

    const applications = await Application.find({ jobId })
        .populate("userId", "firstName lastName email")
        .populate("cvId");

    if (!applications.length) {
        return {
            job: {
                _id: job._id,
                position: job.position,
                description: job.description,
            },
            candidates: [],
            total: 0,
            message: "No applications found for this job",
        };
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
    const normalized = applications.map(normalizeApplicationToCvLike);
    const candidateBlocks = normalized.map(formatCandidateCvBlock);

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

    let ranked = safeParseJson(aiResponse, null);
    if (!Array.isArray(ranked)) {
        throw new AppError("Failed to parse AI response", 500);
    }

    if (ranked.length === 0 && applications.length > 0) {
        ranked = applications.map((app, i) => ({
            cvId: String(app._id),
            rank: i + 1,
            matchScore: 50,
            reasoning: "AI ranking unavailable; applicant included by default.",
        }));
    }

    const localScores = new Map();
    for (const app of applications) {
        try {
            const info = app.applicantInfo || {};
            const localResult = calculateMatchPercentage(
                {
                    technicalSkills: info.technicalSkills || [],
                    softSkills: info.softSkills || [],
                    languages: info.languages || [],
                    yearsOfExperience: info.yearsOfExperience || 0,
                    experience: info.experience || [],
                },
                job,
            );
            localScores.set(String(app._id), localResult.percentage);
        } catch (err) {
            console.warn(`[aiShortlist] Local score failed for app ${app._id}:`, err.message);
        }
    }

    const candidates = mapRankedApplications(applications, ranked, localScores);

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


