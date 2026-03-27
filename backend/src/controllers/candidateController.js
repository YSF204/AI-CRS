import CV from "../models/CV.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Employer from "../models/Employer.js";
import { rankCandidates } from "../integrations/ai/openai.js";
import potentialCandidates from "../models/PotentialCandidates.js";

const Max_Candidates = 20;

const employerRequierments = (body) => {
    const { position,
        description,
        technicalSkills = [],
        softSkills = [],
        yearsOfExperience,
        language = [],
        additionalNotes } = body;

    return [
        `Position: ${position}`,
        description ? `Description: ${description}` : null,
        technicalSkills.length ? `Required Technical Skills: ${technicalSkills.join(", ")}` : null,
        softSkills.length ? `Required Soft Skills: ${softSkills.join(", ")}` : null,
        yearsOfExperience != null ? `Years of Experience: ${yearsOfExperience}` : null,
        language.length ? `Languages: ${language.join(", ")}` : null,
        additionalNotes ? `Notes: ${additionalNotes}` : null,
    ].filter(Boolean).join("\n");
};

const formateCvBlock = (cv) => {
    return [
        `=== CANDIDATE ${cv._id} ===`,
        `job title: ${cv.jobTitle ? cv.jobTitle : "N/A"}`,
        `summary : ${cv.summary || "N/A"}`,
        `Email : ${cv.contact?.email || "N/A"}`,
        `Phone : ${cv.contact?.phone || "N/A"}`,
        `GitHub : ${cv.contact?.github || "N/A"}`,
        `LinkedIn : ${cv.contact?.linkedin || "N/A"}`,
        `Location : ${[cv.address?.city, cv.address?.street].filter(Boolean).join(", ") || "N/A"}`,
        `Technical Skills : ${cv.technicalSkills?.join(", ") || "N/A"}`,
        `Soft Skills : ${cv.softSkills?.join(", ") || "N/A"}`,
        `Languages : ${cv.language?.join(", ") || "N/A"}`,
        `Experience: ${cv.experience?.length
            ? cv.experience.map(e =>
                `${e.position} at ${e.institutionName} (${e.duration}y)${e.summary ? " - " + e.summary : ""}`).join(" | ")
            : "None"
        }`,
        `Education: ${cv.education?.length
            ? cv.education.map(e =>
                `${e.certification} at ${e.institutionName} (${e.duration}y)${e.summary ? " - " + e.summary : ""}`).join(" | ")
            : "None"
        }`,
        ...(cv.customSections?.map(
            s => `${s.title}: ${s.items?.map(i => `${i.name}${i.description ? " - " + i.description : ""}`).join(", ")}`
        ) || []),
    ].join("\n");



}


export const findPotintialCandidates = catchAsync(async (req, res, next) => {

    const { position } = req.body;
    if (!position) {
        return next(new AppError("Position name is requierd", 400));
    }

    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) return next(new AppError("Employer not found", 404));

    const allCvs = await CV.find({}).populate("userId", "firstName lastName email");

    if (!allCvs.length) return next(new AppError("No candidates were found in this system", 404))

    // FORMATING FOR THE AI
    const requiermentsText = employerRequierments(req.body);

    const cvBlock = allCvs.map(cv => formateCvBlock(cv));


    // Send for the AI 
    const aiResponse = await rankCandidates(requiermentsText, cvBlock);

    let ranked;
    try {
        const clean = aiResponse.replace(/```json|```/g, "").trim();
        ranked = JSON.parse(clean);
    } catch (error) {
        return next(new AppError("Failed to parse AI response", 500));
    }


    // this line below , is a mapping for all the cvs from the DB , Instead of searching for each cv in the DB using the 
    // cvId from the AI respone , we use this map to get the cv data in very fast way
    // O(1) LOOKUP instead of O(n) for each cv , its like a dictionary or hash map .
    const cvMap = new Map(allCvs.map(cv => [cv._id.toString(), cv]));

    const candidates = ranked.map(item =>{
        const cv = cvMap.get(item.cvId?.toString());
        if(!cv) return null;

        return {
            cvId: cv._id,
                userId: cv.userId?._id,
                rank: item.rank,
                matchScore: item.matchScore,
                reasoning: item.reasoning,
                strengths: Array.isArray(item.strengths) ? item.strengths : (item.strengths ? [item.strengths] : []),
                skillsMatched: item.skillsMatched || [],
                skillsMissing: item.skillsMissing || [],
                profile: {
                    name: cv.userId ? `${cv.userId.firstName} ${cv.userId.lastName}` : "Unknown",
                    email: cv.userId?.email,
                    jobTitle: cv.jobTitle,
                    summary: cv.summary,
                    technicalSkills: cv.technicalSkills,
                    experience: cv.experience,
                    education: cv.education,
                },
        }
    }).filter(Boolean).sort((a,b) =>a.rank - b.rank).slice(0,Max_Candidates);

    // saving the history 

    await potentialCandidates.create({
        employerId: employer._id,   
        searchRequirements: {
            position: req.body.position,
            description: req.body.description,
            technicalSkills: req.body.technicalSkills || [],
            softSkills: req.body.softSkills || [],
            yearsOfExperience: req.body.yearsOfExperience,
            language: req.body.language || [],
            additionalNotes: req.body.additionalNotes,
        },
        candidate: candidates.map(c => ({
            userId: c.userId,
            CVId: c.cvId,
            rank: c.rank,
            matchScore: c.matchScore,
            reasoning: c.reasoning,
            strengths: c.strengths,
            skillsMatched: c.skillsMatched,
            skillsMissing: c.skillsMissing,
        })),
    });

    res.status(200).json({
        status: "success",
        data: {
            candidates,
            total : candidates.length
        }
    });

})

export const getEmployerSearchHistory = catchAsync(async (req, res, next) => {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) return next(new AppError("Employer not found", 404));

    const history = await potentialCandidates.find({ employerId: employer._id })
        .populate('candidate.userId', 'firstName lastName email')
        .populate('candidate.CVId', 'jobTitle summary technicalSkills experience education')
        .sort('-createdAt');

    res.status(200).json({
        status: "success",
        data: history
    });
});
