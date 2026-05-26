import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import CV from "../models/CV.js";
import Job from "../models/Job.js";
import { calculateMatchPercentage } from "../services/matching/matchingService.js";
import { buildNormalizedProfile } from "../utils/profileNormalizer.js";
import { matchCVToJobs } from "../integrations/ai/openai.js";
import { getExternalJobs } from "../services/jobs/queries/getExternalJobs.js";

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

/**
 * Matches external jobs based on title keywords and CV profile
 */
const matchExternalJobs = (cv, externalJobs, normalizedProfile) => {
  const cvRoles = new Set([
    ...(cv.experience || []).map((e) => e.position.toLowerCase()),
    ...(cv.education || []).map((e) => e.certification.toLowerCase()),
  ]);
  const cvSkills = new Set([
    ...(cv.technicalSkills || []).map((s) => s.toLowerCase()),
    ...(normalizedProfile?.technicalSkills || []).map((s) => s.toLowerCase()),
  ]);

  return externalJobs
    .map((job) => {
      const title = job.title.toLowerCase();
      
      // Simple keyword matching: does the title overlap with CV roles or skills?
      let score = 0;
      const matchedKeywords = [];

      cvRoles.forEach(role => {
        if (title.includes(role)) {
          score += 40;
          matchedKeywords.push(role);
        }
      });

      cvSkills.forEach(skill => {
        if (title.includes(skill)) {
          score += 20;
          matchedKeywords.push(skill);
        }
      });

      // Cap at 95% since we don't have deep info
      score = Math.min(95, score);

      if (score < 20) return null; // Too weak

      return {
        jobId: job.id, // This is the URL for external jobs
        position: job.title,
        company: job.company,
        location: job.location,
        workSite: job.location,
        matchScore: score,
        skillsMatched: matchedKeywords.slice(0, 5),
        reasoning: `Matched based on title alignment with your experience: ${matchedKeywords.slice(0, 3).join(", ")}.`,
        isExternal: true,
        externalUrl: job.externalUrl,
        sourceName: job.sourceName,
      };
    })
    .filter(Boolean)
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

  // Fetch both internal and external jobs
  const [jobs, externalJobs] = await Promise.all([
    Job.find({ status: "OPEN" }),
    getExternalJobs(),
  ]);

  if (!jobs.length && !externalJobs.length) {
    return next(new AppError("No jobs found", 404));
  }

  console.log(`[recommendJobs] CV=${cvId}, Analyzing ${jobs.length} internal and ${externalJobs.length} external jobs`);

  // --- INTERNAL MATCHING ---
  const localRanked = buildLocalJobRecommendations(cv, jobs, normalizedProfile);
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
    const match = await withTimeout(matchCVToJobs(cvText, jobsText), 25000);
    let aiResult = Array.isArray(match) ? match : match;

    if (Array.isArray(aiResult)) {
      parsed = normalizeAiMatches(aiResult, aiInputJobs);
      usedAiMatching = true;
    } else {
      parsed = localRanked;
    }
  } catch (error) {
    console.warn(`[recommendJobs] AI matching failed: ${error.message}`);
    parsed = localRanked;
  }

  // Calculate final internal scores
  let internalMatches = parsed.map((jobMatch) => {
    const job = jobs.find((j) => j._id.toString() === jobMatch.jobId);
    if (!job) return jobMatch;
    const matchResult = calculateMatchPercentage(normalizedProfile, job);
    return {
      ...jobMatch,
      matchScore: Math.max(jobMatch.matchScore || 0, matchResult.percentage),
      breakdown: matchResult.breakdown,
    };
  });

  // --- EXTERNAL MATCHING ---
  const externalMatches = matchExternalJobs(cv, externalJobs, normalizedProfile);

  // --- COMBINE AND DEDUPLICATE ---
  const internalSeen = new Set();
  const dedupedInternal = internalMatches.filter(m => {
    if (internalSeen.has(m.jobId)) return false;
    internalSeen.add(m.jobId);
    return true;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const externalSeen = new Set();
  const dedupedExternal = externalMatches.filter(m => {
    // Deduplicate by URL
    if (externalSeen.has(m.externalUrl)) return false;
    externalSeen.add(m.externalUrl);
    return true;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  console.log(`[recommendJobs] Returning ${dedupedInternal.length} internal and ${dedupedExternal.length} external results`);

  res.status(200).json({
    success: true,
    data: { 
      match: dedupedInternal, // Keep 'match' for backward compatibility
      internalMatches: dedupedInternal,
      externalMatches: dedupedExternal
    },
  });
});
