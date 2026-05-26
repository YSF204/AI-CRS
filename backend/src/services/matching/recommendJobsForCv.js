import CV from "../../models/CV.js";
import Job from "../../models/Job.js";
import AppError from "../../utils/appError.js";
import { matchCVToJobs } from "../../integrations/ai/openai.js";
import { calculateMatchPercentage } from "./matchingService.js";
import { buildNormalizedProfile } from "../../utils/profileNormalizer.js";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI recommendation timed out")), ms),
    ),
  ]);

const buildLocalJobRecommendations = (cv, jobs, normalizedProfile) => {
  const cvTech = new Set(
    (normalizedProfile?.technicalSkills || cv.technicalSkills || []).map(
      (skill) => skill.toLowerCase(),
    ),
  );
  const cvSoft = new Set(
    (normalizedProfile?.softSkills || cv.softSkills || []).map((skill) =>
      skill.toLowerCase(),
    ),
  );
  const cvExperience =
    normalizedProfile?.yearsOfExperience ||
    (cv.experience || []).reduce(
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

      return {
        jobId: job._id.toString(),
        position: job.position,
        matchScore: Math.min(
          100,
          Math.round(
            techMatched.length * 3 +
              softMatched.length * 1.5 +
              experienceScore * 0.2,
          ),
        ),
        skillsMatched: [...new Set([...techMatched, ...softMatched])],
        skillsMissing: jobTech.filter(
          (skill) => !cvTech.has(skill.toLowerCase()),
        ),
        reasoning: `Candidate matches ${techMatched.length} of ${jobTech.length} technical skills and ${softMatched.length} soft skills.`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

const normalizeAiMatches = (parsedMatches, jobs) => {
  const jobsById = new Map(jobs.map((job) => [job._id.toString(), job]));
  const jobsByTitle = new Map(
    jobs.map((job) => [job.position?.toLowerCase().trim(), job]),
  );

  return parsedMatches
    .map((job) => {
      const rawId = String(job.job_id || "").trim();
      const rawTitle = String(job.job_title || "").trim();
      let matchedJob = jobsById.get(rawId);

      if (!matchedJob && rawTitle) {
        matchedJob = jobsByTitle.get(rawTitle.toLowerCase());
      }

      if (!matchedJob) return null;

      return {
        jobId: matchedJob._id.toString(),
        position: matchedJob.position,
        workSite: matchedJob.workSite,
        matchScore: Number(job.relevance_score) || 0,
        skillsMatched: job.match_reasons || [],
        skillsMissing: job.missing_skills || [],
        reasoning: job.recommendation_note || "",
      };
    })
    .filter(Boolean);
};

const formatCvText = (cv) =>
  [
    `Summary: ${cv.summary}`,
    `Email: ${cv.contact?.email || "N/A"}`,
    `Phone: ${cv.contact?.phone || "N/A"}`,
    `Location: ${cv.address?.city || ""}, ${cv.address?.street || ""}`,
    `Experience: ${cv.experience?.map((entry) => `${entry.position} at ${entry.institutionName} (${entry.duration}y) - ${entry.summary || ""}`).join(" | ") || "None"}`,
    `Education: ${cv.education?.map((entry) => `${entry.certification} at ${entry.institutionName} (${entry.duration}y)`).join(" | ") || "None"}`,
    `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
    `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
    `Languages: ${cv.language?.join(", ") || "None"}`,
    ...(cv.customSections?.map(
      (section) =>
        `${section.title}: ${section.items?.map((item) => `${item.name}${item.description ? ` - ${item.description}` : ""}`).join(", ")}`,
    ) || []),
  ].join("\n");

export const recommendJobsForCv = async ({ cvId, userId }) => {
  const cv = await CV.findById(cvId);
  if (!cv) {
    throw new AppError("CV not found", 404);
  }

  if (cv.userId.toString() !== userId.toString()) {
    throw new AppError("Not authorized to access this CV", 403);
  }

  const normalizedProfile = buildNormalizedProfile({
    applicantInfo: {
      fullName: cv.fullName,
      email: cv.contact?.email,
      phone: cv.contact?.phone,
      technicalSkills: cv.technicalSkills,
      softSkills: cv.softSkills,
      languages: cv.language,
    },
    experience: cv.experience || [],
    education: cv.education || [],
    customSections: cv.customSections || [],
    cvData: cv,
  });

  const jobs = await Job.find({ status: "OPEN" });
  if (!jobs.length) {
    throw new AppError("No jobs found", 404);
  }

  const localRanked = buildLocalJobRecommendations(cv, jobs, normalizedProfile);
  const candidateIds = new Set(
    localRanked.slice(0, 35).map((job) => job.jobId),
  );
  const candidateJobs = jobs.filter((job) =>
    candidateIds.has(job._id.toString()),
  );
  const aiInputJobs = candidateJobs.length > 0 ? candidateJobs : jobs;

  const jobsText = JSON.stringify(
    aiInputJobs.map((job) => ({
      job_id: job._id.toString(),
      job_title: job.position,
      company: "Employer",
      description: job.description,
      required_skills: job.technicalSkills || [],
      preferred_skills: job.softSkills || [],
      required_experience_years: job.yearsOfExperience || 0,
      required_education: "",
      field: job.position || "",
    })),
  );

  let rankedMatches;
  try {
    const aiMatch = await withTimeout(
      matchCVToJobs(formatCvText(cv), jobsText),
      25000,
    );
    // FIX #7: matchCVToJobs now returns parsed JSON directly, not a string
    const parsed = Array.isArray(aiMatch) ? aiMatch : aiMatch;

    if (!Array.isArray(parsed)) {
      if (parsed.error) {
        throw new AppError(parsed.message || "CV Match error", 400);
      }
      throw new Error("Expected AI match response to be an array");
    }

    rankedMatches = normalizeAiMatches(parsed, aiInputJobs);
  } catch (error) {
    if (error instanceof AppError) throw error;
    rankedMatches = localRanked;
  }

  return rankedMatches
    .filter((job) => job.matchScore >= 30)
    .map((jobMatch) => {
      const job = jobs.find((entry) => entry._id.toString() === jobMatch.jobId);
      if (!job) return jobMatch;

      const matchResult = calculateMatchPercentage(normalizedProfile, job);
      return {
        ...jobMatch,
        canonicalPercentage: matchResult.percentage,
        matchScore: jobMatch.reasoning?.includes("Candidate matches")
          ? matchResult.percentage
          : jobMatch.matchScore,
        breakdown: matchResult.breakdown,
      };
    });
};

export default recommendJobsForCv;
