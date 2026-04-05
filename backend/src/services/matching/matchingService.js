import { GoogleGenAI } from "@google/genai";

let client;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

/**
 * Calculate job match percentage between applicant and job requirements
 * Weights:
 * - Technical Skills: 40%
 * - Experience: 30%
 * - Soft Skills: 15%
 * - Languages: 15%
 */
export const calculateMatchPercentage = (applicantInfo, jobRequirements) => {
  const weights = {
    technicalSkills: 0.4,
    experience: 0.3,
    softSkills: 0.15,
    languages: 0.15,
  };

  // Technical Skills Match (0-100)
  const applicantTechSkills = applicantInfo.technicalSkills || [];
  const jobTechSkills = jobRequirements.technicalSkills || [];
  const techSkillsMatch = calculateSkillsMatch(
    applicantTechSkills,
    jobTechSkills,
  );

  // Experience Match (0-100)
  const yearsRequired = jobRequirements.yearsOfExperience || 0;
  const yearsApplicant = applicantInfo.yearsOfExperience || 0;
  const experienceMatch = calculateExperienceMatch(
    yearsApplicant,
    yearsRequired,
  );

  // Soft Skills Match (0-100)
  const applicantSoftSkills = applicantInfo.softSkills || [];
  const jobSoftSkills = jobRequirements.softSkills || [];
  const softSkillsMatch = calculateSkillsMatch(
    applicantSoftSkills,
    jobSoftSkills,
  );

  // Languages Match (0-100)
  const applicantLanguages = applicantInfo.languages || [];
  const jobLanguages = jobRequirements.language || [];
  const languagesMatch = calculateSkillsMatch(applicantLanguages, jobLanguages);

  // Calculate weighted score
  const totalScore =
    techSkillsMatch * weights.technicalSkills +
    experienceMatch * weights.experience +
    softSkillsMatch * weights.softSkills +
    languagesMatch * weights.languages;

  return {
    percentage: Math.round(totalScore),
    breakdown: {
      technicalSkillsMatch: Math.round(techSkillsMatch),
      experienceMatch: Math.round(experienceMatch),
      softSkillsMatch: Math.round(softSkillsMatch),
      languagesMatch: Math.round(languagesMatch),
    },
  };
};

/**
 * Calculate skills match between two arrays (case-insensitive, partial matching)
 */
const calculateSkillsMatch = (applicantSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!applicantSkills || applicantSkills.length === 0) return 0;

  const normalizedApplicant = applicantSkills.map((s) =>
    s.toLowerCase().trim(),
  );
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

  const matches = normalizedRequired.filter((skill) =>
    normalizedApplicant.some(
      (appSkill) =>
        appSkill.includes(skill) ||
        skill.includes(appSkill) ||
        appSkill === skill,
    ),
  );

  return (matches.length / normalizedRequired.length) * 100;
};

/**
 * Calculate experience match
 */
const calculateExperienceMatch = (yearsApplicant, yearsRequired) => {
  if (yearsRequired === 0) return 100;
  if (yearsApplicant === 0) return 0;

  const percentMatch = (yearsApplicant / yearsRequired) * 100;
  // Cap at 100% - having more experience is not penalized
  return Math.min(percentMatch, 100);
};

/**
 * Generate detailed AI-powered match analysis
 */
const buildLocalFallbackAnalysis = (applicantInfo, jobInfo) => {
  const techSkills = applicantInfo.technicalSkills || [];
  const jobTech = jobInfo.technicalSkills || [];
  const softSkills = applicantInfo.softSkills || [];
  const jobSoft = jobInfo.softSkills || [];
  const languages = applicantInfo.languages || [];
  const jobLanguages = jobInfo.language || [];
  const yearsApplicant = applicantInfo.yearsOfExperience || 0;
  const yearsRequired = jobInfo.yearsOfExperience || 0;

  const matchingTech = techSkills.filter((skill) =>
    jobTech.some((req) => req.toLowerCase().includes(skill.toLowerCase())),
  );
  const missingTech = jobTech.filter(
    (req) =>
      !matchingTech.some((skill) =>
        req.toLowerCase().includes(skill.toLowerCase()),
      ),
  );

  const matchingSoft = softSkills.filter((skill) =>
    jobSoft.some((req) => req.toLowerCase().includes(skill.toLowerCase())),
  );

  const languageMatch = languages.filter((language) =>
    jobLanguages.some((req) =>
      req.toLowerCase().includes(language.toLowerCase()),
    ),
  );

  const experienceSentence =
    yearsApplicant >= yearsRequired
      ? `The applicant has sufficient experience (${yearsApplicant} years) for the role.`
      : `The applicant has less experience (${yearsApplicant} years) than the role requests (${yearsRequired} years).`;

  const strengths = [];
  const weaknesses = [];

  if (matchingTech.length > 0) {
    strengths.push(`Strong technical match: ${matchingTech.join(", ")}.`);
  }
  if (matchingSoft.length > 0) {
    strengths.push(`Good soft skill fit: ${matchingSoft.join(", ")}.`);
  }
  if (languageMatch.length > 0) {
    strengths.push(`Language fit: ${languageMatch.join(", ")}.`);
  }
  if (missingTech.length > 0) {
    weaknesses.push(`Missing technical skills: ${missingTech.join(", ")}.`);
  }
  if (yearsApplicant < yearsRequired) {
    weaknesses.push(
      `Experience gap: needs ${yearsRequired - yearsApplicant} more year(s).`,
    );
  }

  const summary =
    strengths.length > 0
      ? strengths.join(" ")
      : "The applicant has a viable profile for this role.";
  const concern =
    weaknesses.length > 0 ? weaknesses.join(" ") : "No major gaps detected.";

  return `${summary} ${experienceSentence} ${concern}`;
};

export const generateAIMatchAnalysis = async (
  applicantInfo,
  jobInfo,
  jobId = null,
  userId = null,
) => {
  try {
    // Add timestamp to ensure unique requests
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const prompt = `[Analysis ID: ${timestamp}-${uniqueId} | Job: ${jobId || "N/A"} | User: ${userId || "N/A"}]

You are an expert HR recruiter and career advisor. Analyze the match between a job applicant and a job position. Provide detailed, individualized feedback specific to this candidate's profile.

APPLICANT PROFILE:
Name: ${applicantInfo.fullName || "Candidate"}
Email: ${applicantInfo.email || "Not provided"}
Summary: ${applicantInfo.summary || "Not provided"}
Years of Experience: ${applicantInfo.yearsOfExperience || 0} years
Technical Skills (${applicantInfo.technicalSkills?.length || 0}): ${applicantInfo.technicalSkills?.join(", ") || "None listed"}
Soft Skills (${applicantInfo.softSkills?.length || 0}): ${applicantInfo.softSkills?.join(", ") || "None listed"}
Languages: ${applicantInfo.languages?.join(", ") || "None listed"}

JOB REQUIREMENTS:
Position: ${jobInfo.position}
Description: ${jobInfo.description}
Years Required: ${jobInfo.yearsOfExperience}
Technical Skills Needed: ${jobInfo.technicalSkills?.join(", ") || "Not specified"}
Soft Skills Needed: ${jobInfo.softSkills?.join(", ") || "Not specified"}
Languages Needed: ${jobInfo.language?.join(", ") || "Not specified"}

IMPORTANT: Provide a specific, personalized analysis for THIS EXACT candidate based on their unique profile.

Analyze and provide:
1. Key matching strengths between this specific candidate and this specific job
2. Specific gaps or concerns for this candidate
3. Overall fit assessment with reasoning

Be specific about skills gaps or matches. Reference the actual skills listed above. Keep analysis to 3-4 sentences, professional, and actionable.`;

    const response = await getClient().models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error generating AI match analysis:", error);
    return buildLocalFallbackAnalysis(applicantInfo, jobInfo);
  }
};

/**
 * Extract strengths and weaknesses from match analysis and breakdown
 */
export const extractStrengthsWeaknesses = (aiAnalysis, matchBreakdown) => {
  const strengths = [];
  const weaknesses = [];

  // Extract from match breakdown percentages
  if (matchBreakdown.technicalSkillsMatch >= 70) {
    strengths.push("Strong technical skills alignment");
  } else if (matchBreakdown.technicalSkillsMatch < 40) {
    weaknesses.push(
      `Technical skills gap (${matchBreakdown.technicalSkillsMatch}% match)`,
    );
  }

  if (matchBreakdown.experienceMatch >= 80) {
    strengths.push("Meets or exceeds required experience level");
  } else if (matchBreakdown.experienceMatch < 50) {
    weaknesses.push(
      `Limited relevant experience (${matchBreakdown.experienceMatch}% match)`,
    );
  }

  if (matchBreakdown.softSkillsMatch >= 70) {
    strengths.push("Excellent soft skills alignment");
  } else if (matchBreakdown.softSkillsMatch < 40) {
    weaknesses.push(
      `Soft skills gap (${matchBreakdown.softSkillsMatch}% match)`,
    );
  }

  if (matchBreakdown.languagesMatch >= 80) {
    strengths.push("Language requirements fully met");
  } else if (
    matchBreakdown.languagesMatch > 0 &&
    matchBreakdown.languagesMatch < 50
  ) {
    weaknesses.push(
      `Limited language proficiency (${matchBreakdown.languagesMatch}% match)`,
    );
  }

  // If no specific weaknesses identified, provide generic insight
  if (weaknesses.length === 0 && !aiAnalysis.includes("concern")) {
    strengths.push("Well-rounded profile for this role");
  }

  // If analysis mentions concerns, add them
  if (aiAnalysis.toLowerCase().includes("gap")) {
    weaknesses.push("Implementation gap identified in analysis");
  }

  return {
    strengths:
      strengths.length > 0
        ? strengths
        : ["Profile aligns with job requirements"],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
  };
};

export default {
  calculateMatchPercentage,
  generateAIMatchAnalysis,
  extractStrengthsWeaknesses,
};
