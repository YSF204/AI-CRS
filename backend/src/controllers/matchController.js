import CV from "../models/CV.js";
import { matchCVToJobs } from "../integrations/ai/openai.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Job from "../models/Job.js";

const buildLocalJobRecommendations = (cv, jobs) => {
  const cvTech = new Set(
    (cv.technicalSkills || []).map((s) => s.toLowerCase()),
  );
  const cvSoft = new Set((cv.softSkills || []).map((s) => s.toLowerCase()));
  const cvExperience = (cv.experience || []).reduce(
    (sum, exp) => sum + Number(exp.duration || 0),
    0,
  );

  return jobs
    .map((job) => {
      const jobTech = job.technicalSkills || [];
      const jobSoft = job.softSkills || [];
      const techMatched = jobTech.filter((skill) =>
        cvTech.has(skill.toLowerCase()),
      );
      const softMatched = jobSoft.filter((skill) =>
        cvSoft.has(skill.toLowerCase()),
      );
      const experienceScore = job.yearsOfExperience
        ? Math.min(
            100,
            Math.round((cvExperience / job.yearsOfExperience) * 100),
          )
        : 100;
      const score = Math.min(
        100,
        Math.round(
          techMatched.length * 3 +
            softMatched.length * 1.5 +
            experienceScore * 0.2,
        ),
      );

      return {
        jobId: job._id.toString(),
        position: job.position,
        matchScore: score,
        skillsMatched: [...new Set([...techMatched, ...softMatched])],
        skillsMissing: jobTech.filter(
          (skill) => !cvTech.has(skill.toLowerCase()),
        ),
        reasoning: `Candidate matches ${techMatched.length} of ${jobTech.length} technical skills and ${softMatched.length} soft skills.`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

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
    `Experience: ${cv.experience?.map((e) => `${e.position} at ${e.institutionName} (${e.duration}y) - ${e.summary || ""}`).join(" | ") || "None"}`,
    `Education: ${cv.education?.map((e) => `${e.certification} at ${e.institutionName} (${e.duration}y)`).join(" | ") || "None"}`,
    `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
    `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
    `Languages: ${cv.language?.join(", ") || "None"}`,
    ...(cv.customSections?.map(
      (s) =>
        `${s.title}: ${s.items?.map((i) => `${i.name}${i.description ? " - " + i.description : ""}`).join(", ")}`,
    ) || []),
  ].join("\n");

  const jobs = await Job.find({ status: "OPEN" });

  if (!jobs.length) {
    return next(new AppError("No jobs found", 404));
  }

  const jobsText = jobs
    .map(
      (job, i) =>
        `Job ${i + 1} 
        [ID: ${job._id}] 
        | ${job.position} 
        | Skills: ${job.technicalSkills?.join(", ")} 
        | SoftSkills: ${job.softSkills?.join(", ")} 
        | Experience: ${job.yearsOfExperience}y 
        | Site: ${job.workSite}`,
    )
    .join("\n");

  let parsed;
  try {
    const match = await matchCVToJobs(cvText, jobsText);
    const clean = match.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) {
      throw new Error("Expected AI match response to be an array");
    }
  } catch (error) {
    console.error("AI recommendation error:", error);
    parsed = buildLocalJobRecommendations(cv, jobs);
  }

  res.status(200).json({
    success: true,
    data: { match: parsed },
  });
});
