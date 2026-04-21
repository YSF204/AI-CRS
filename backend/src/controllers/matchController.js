import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import CV from "../models/CV.js";
import Job from "../models/Job.js";
import { calculateMatchPercentage } from "../services/matching/matchingService.js";
import { buildNormalizedProfile } from "../utils/profileNormalizer.js";
import { matchCVToJobs } from "../integrations/ai/openai.js";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI recommendation timed out")), ms),
    ),
  ]);

const buildLocalJobRecommendations = (cv, jobs, normalizedProfile) => {
  const cvTech = new Set(
    (normalizedProfile?.technicalSkills || cv.technicalSkills || []).map((s) =>
      s.toLowerCase(),
    ),
  );
  const cvSoft = new Set(
    (normalizedProfile?.softSkills || cv.softSkills || []).map((s) =>
      s.toLowerCase(),
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

      // AI may output a wrong/empty id; fallback to title match against known open jobs.
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

export const recommendJobs = catchAsync(async (req, res, next) => {
  const { id: cvId } = req.params;
  const cv = await CV.findById(cvId);

  if (!cv) {
    return next(new AppError("CV not found", 404));
  }

  if (cv.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to access this CV", 403));
  }

  // Build normalized profile for canonical scoring
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

  console.log(`[recommendJobs] CV=${cvId}, Analyzing ${jobs.length} open jobs`);

  // Fast pre-ranking to reduce prompt size and model latency.
  // We only send the top candidates to AI, then still return normalized matches.
  const localRanked = buildLocalJobRecommendations(cv, jobs, normalizedProfile);
  console.log(
    `[recommendJobs] Local ranking: ${localRanked.length} jobs scored, top score=${localRanked[0]?.matchScore || 0}`,
  );

  const candidateIds = new Set(localRanked.slice(0, 35).map((j) => j.jobId));
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

  let parsed = [];
  let usedAiMatching = false;

  try {
    console.log(
      `[recommendJobs] Calling AI matching with ${aiInputJobs.length} jobs...`,
    );
    const match = await withTimeout(matchCVToJobs(cvText, jobsText), 25000);

    // Safe JSON parsing with error recovery
    let cleanJson = match.replace(/```json|```/g, "").trim();
    let aiResult = JSON.parse(cleanJson);

    if (Array.isArray(aiResult)) {
      console.log(`[recommendJobs] AI returned ${aiResult.length} matches`);
      parsed = normalizeAiMatches(aiResult, aiInputJobs);
      usedAiMatching = true;
    } else if (aiResult?.error) {
      console.warn(`[recommendJobs] AI error response: ${aiResult.message}`);
      parsed = localRanked;
    } else {
      console.warn(
        `[recommendJobs] Unexpected AI response format, using local ranking`,
      );
      parsed = localRanked;
    }
  } catch (error) {
    console.warn(
      `[recommendJobs] AI recommendation failed (${error.message}), falling back to local scoring`,
    );
    parsed = localRanked;
  }

  // Build final job list with combined scoring
  let filteredJobs = parsed.map((jobMatch) => {
    const job = jobs.find((j) => j._id.toString() === jobMatch.jobId);
    if (!job) return jobMatch;

    const matchResult = calculateMatchPercentage(normalizedProfile, job);

    return {
      ...jobMatch,
      canonicalPercentage: matchResult.percentage,
      // Use AI score if available, otherwise use local semantic match
      matchScore: Math.max(jobMatch.matchScore || 0, matchResult.percentage),
      breakdown: matchResult.breakdown,
    };
  });

  // Sort by match score descending
  filteredJobs = filteredJobs.sort(
    (a, b) => (b.matchScore || 0) - (a.matchScore || 0),
  );

  // Always return at least some results (top 20 by score) to avoid "NO STRONG MATCHES" message
  // Even partial matches are valuable; 0% is rare since local scorer almost always finds something
  if (filteredJobs.length > 0) {
    filteredJobs = filteredJobs.slice(0, 20);
  }

  console.log(
    `[recommendJobs] Returning ${filteredJobs.length} jobs to user, used AI=${usedAiMatching}`,
  );

  res.status(200).json({
    success: true,
    data: { match: filteredJobs },
  });
});
