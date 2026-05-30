import CV from "../../../models/CV.js";
import Employer from "../../../models/Employer.js";
import potentialCandidates from "../../../models/PotentialCandidates.js";
import AppError from "../../../utils/appError.js";
import { rankCandidates } from "../../../integrations/ai/openai.js";
import { safeParseJson } from "../../shared/aiResponseParser.js";
import { buildRequirementsText } from "./buildRequirementsText.js";
import { formatCandidateCvBlock } from "./formatCandidateCvBlock.js";
import { mapRankedCandidates } from "./mapRankedCandidates.js";

export const findPotentialCandidates = async ({ userId, body }) => {
    const { position } = body;
    if (!position) {
        throw new AppError("Position name is requierd", 400);
    }

    const employer = await Employer.findOne({ userId });
    if (!employer) {
        throw new AppError("Employer not found", 404);
    }

    const query = {};
    const orConditions = [];
    
    if (body.position) {
        orConditions.push({ jobTitle: { $regex: body.position, $options: "i" } });
    }
    if (body.technicalSkills && body.technicalSkills.length > 0) {
        orConditions.push({ technicalSkills: { $in: body.technicalSkills } });
    }
    
    if (orConditions.length > 0) {
        query.$or = orConditions;
    }
    
    let allCvs = await CV.find(query).populate("userId", "firstName lastName email").limit(50);
    
    // Fallback: If no specific matches found, fetch a subset of any CVs to avoid returning nothing
    if (!allCvs.length) {
        allCvs = await CV.find({}).populate("userId", "firstName lastName email").limit(20);
    }
    
    if (!allCvs.length) {
        throw new AppError("No candidates were found in this system", 404);
    }

    const requirementsText = buildRequirementsText(body);
    const candidateBlocks = allCvs.map((cv) => formatCandidateCvBlock(cv));

    const aiResponse = await rankCandidates(
        {
            position: body.position,
            description: body.description,
            technicalSkills: body.technicalSkills || [],
            softSkills: body.softSkills || [],
            yearsOfExperience: body.yearsOfExperience,
            language: body.language || [],
            additionalNotes: body.additionalNotes,
        },
        requirementsText,
        candidateBlocks,
    );

    const ranked = safeParseJson(aiResponse, null);
    const candidates = Array.isArray(ranked) && ranked.length > 0
        ? mapRankedCandidates(allCvs, ranked)
        : mapRankedCandidates(
            allCvs,
            allCvs.map((cv, index) => ({
                cvId: String(cv._id),
                rank: index + 1,
                matchScore: Math.max(95 - index * 3, 50),
                reasoning: "Fallback ranking used because the AI response was empty or invalid.",
            })),
        );

    await potentialCandidates.create({
        employerId: employer._id,
        searchRequirements: {
            position: body.position,
            description: body.description,
            technicalSkills: body.technicalSkills || [],
            softSkills: body.softSkills || [],
            yearsOfExperience: body.yearsOfExperience,
            language: body.language || [],
            additionalNotes: body.additionalNotes,
        },
        candidate: candidates.map((candidate) => ({
            userId: candidate.userId,
            CVId: candidate.cvId,
            rank: candidate.rank,
            matchScore: candidate.matchScore,
            reasoning: candidate.reasoning,
            strengths: candidate.strengths,
            skillsMatched: candidate.skillsMatched,
            skillsMissing: candidate.skillsMissing,
        })),
    });

    return {
        candidates,
        total: candidates.length,
    };
};

export default findPotentialCandidates;
