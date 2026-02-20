import CV from "../models/CV.js";
import { matchCVToJob } from "../integrations/ai/openai.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Job from "../models/Job.js";

export const recommendJobs = catchAsync(async (req, res, next) => {
    const { id: cvId } = req.params;
    const cv = await CV.findById(cvId);

    if (!cv) {
        return next(new AppError("CV not found", 404));
    }

    if (cv.userId.toString() !== req.user._id.toString()) {
        return next(new AppError("Not authorized to access this CV", 403));
    }

    const cvText = [
        `Summary: ${cv.summary}`,
        `Email: ${cv.contact?.email || "N/A"}`,
        `Phone: ${cv.contact?.phone || "N/A"}`,
        `Location: ${cv.address?.city || ""}, ${cv.address?.street || ""}`,
        `Experience: ${cv.experience?.map(e => `${e.position} at ${e.institutionName} (${e.duration}y) - ${e.summary || ""}`).join(" | ") || "None"}`,
        `Education: ${cv.education?.map(e => `${e.certification} at ${e.institutionName} (${e.duration}y)`).join(" | ") || "None"}`,
        `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
        `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
        `Languages: ${cv.language?.join(", ") || "None"}`,
        ...cv.customSections?.map(s => `${s.title}: ${s.items?.map(i => `${i.name}${i.description ? " - " + i.description : ""}`).join(", ")}`) || [],
    ].join("\n");

    const jobs = await Job.find({ status: "OPEN" });

    if (!jobs.length) {
        return next(new AppError("No jobs found", 404));
    }

    const jobsText = jobs.map((job, i) =>
        `Job ${i + 1} 
        [ID: ${job._id}] 
        | ${job.position} 
        | Skills: ${job.technicalSkills?.join(", ")} 
        | SoftSkills: ${job.softSkills?.join(", ")} 
        | Experience: ${job.yearsOfExperience}y 
        | Site: ${job.workSite}`
    ).join("\n");

    const match = await matchCVToJob(cvText, jobsText);

    let parsed;
    try {
        const clean = match.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
    } catch {
        return next(new AppError("AI returned an invalid response", 500));
    }

    res.status(200).json({
        success: true,
        data: { match: parsed },
    });




});