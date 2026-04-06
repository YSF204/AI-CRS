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
  inputType = "EXISTING_PROFILE",
  rawCvText = null
) => {
  try {
    const candidateProfileContent = rawCvText 
      ? rawCvText 
      : JSON.stringify(applicantInfo, null, 2);

    const prompt = `You are an expert AI Recruitment Analyst integrated into a professional recruitment platform called AI-CRS. 
Your job is to perform a deep, structured, and honest analysis of a candidate's profile against a specific 
job's requirements, and produce a comprehensive fit report including an overall match percentage.

You analyze three possible input types:
- A parsed CV (uploaded document)
- A manually filled application form
- A pre-existing candidate profile from the system

Regardless of the input type, you extract the same structured information and run the same analysis.

---

## ANALYSIS FRAMEWORK

You will evaluate the candidate across 6 weighted dimensions:

1. TECHNICAL SKILLS MATCH         — Weight: 30%
   - Compare candidate's listed skills vs. the job's required and preferred skills.
   - Partial matches count (e.g., knows React but job wants Vue → partial frontend match).
   - Missing critical skills reduce this score significantly.
   - Bonus points for skills listed as "nice to have" that the candidate has.

2. EXPERIENCE MATCH               — Weight: 25%
   - Compare years of relevant experience vs. required years.
   - Consider quality of experience: relevant industry, similar role titles, scope of work.
   - Overqualification is noted but does not heavily penalize.
   - No experience in the field = very low score even if years are high elsewhere.

3. EDUCATION & CERTIFICATIONS     — Weight: 15%
   - Compare education level and field of study vs. job requirements.
   - Industry certifications (e.g., AWS, PMP, CPA) are weighted heavily if job requires them.
   - If job doesn't require specific education and candidate has a degree → neutral/positive.

4. SOFT SKILLS & CULTURE FIT      — Weight: 10%
   - Infer soft skills from CV language, job descriptions written by the candidate, achievements.
   - Match against soft skills listed in the job posting (e.g., teamwork, leadership, communication).
   - Score based on evidence found in the candidate's profile.

5. LANGUAGE & LOCATION FIT        — Weight: 10%
   - Check if the candidate meets language requirements.
   - Check location/remote compatibility if specified.
   - Penalize only if the job has hard requirements the candidate clearly does not meet.

6. ACHIEVEMENTS & ADDED VALUE     — Weight: 10%
   - Does the candidate show measurable results? (e.g., "increased sales by 30%", "led team of 10")
   - Awards, publications, portfolios, open source contributions, etc.
   - These differentiate candidates with similar base scores.

---

## SCORING RULES

- Calculate a weighted score for each dimension (0–100).
- Compute the OVERALL FIT PERCENTAGE as the weighted average of all 6 dimensions.
- Apply a final adjustment:
    • If the candidate is missing ANY hard-requirement skill marked as mandatory → cap overall at 65%
    • If the candidate meets ALL mandatory requirements perfectly → allow score up to 100%
    • If the CV/profile is incomplete or vague → reduce confidence and note it explicitly

---

## OUTPUT FORMAT

Return ONLY a valid JSON object. No markdown, no preamble, no explanation outside the JSON.

{
  "candidate_name": "string or 'Unknown' if not found",
  "job_title": "string",
  "company": "string",
  "overall_fit_percentage": 0,
  "fit_label": "Excellent Fit | Strong Fit | Good Fit | Moderate Fit | Weak Fit | Not Recommended",
  "confidence_level": "High | Medium | Low",
  "confidence_note": "Short reason for confidence level",
  "dimension_scores": {
    "technical_skills": { "score": 0, "weight": 30, "weighted_contribution": 0, "summary": "string" },
    "experience": { "score": 0, "weight": 25, "weighted_contribution": 0, "summary": "string" },
    "education_certifications": { "score": 0, "weight": 15, "weighted_contribution": 0, "summary": "string" },
    "soft_skills_culture": { "score": 0, "weight": 10, "weighted_contribution": 0, "summary": "string" },
    "language_location": { "score": 0, "weight": 10, "weighted_contribution": 0, "summary": "string" },
    "achievements_value": { "score": 0, "weight": 10, "weighted_contribution": 0, "summary": "string" }
  },
  "strengths": ["Clear strength point 1"],
  "gaps": [ { "gap": "Name of the gap", "severity": "Critical", "suggestion": "What the candidate could do to close this gap" } ],
  "matched_skills": ["skill1"],
  "missing_required_skills": ["skill1"],
  "missing_optional_skills": ["skill1"],
  "bonus_skills": ["skill1"],
  "experience_verdict": {
    "required_years": 0,
    "candidate_years": 0,
    "relevant_years": 0,
    "verdict": "Meets requirement"
  },
  "recruiter_summary": "A 3–4 sentence professional paragraph...",
  "candidate_advice": "A 2–3 sentence message...",
  "hiring_recommendation": "Strongly Recommend | Recommend | Recommend with Reservations | Do Not Recommend"
}

---

## EDGE CASES
- If candidate profile is empty → return: { "error": "invalid_input", "message": "..." }

Perform a full candidate-to-job fit analysis using the following data.

<input_type>${inputType}</input_type>

<candidate_profile>
${candidateProfileContent}
</candidate_profile>

<job_listing>
${JSON.stringify({
  job_id: jobId,
  job_title: jobInfo.position || jobInfo.job_title,
  company: jobInfo.company,
  description: jobInfo.description,
  required_skills: jobInfo.technicalSkills || jobInfo.required_skills,
  preferred_skills: jobInfo.softSkills || jobInfo.preferred_skills,
  required_experience_years: jobInfo.yearsOfExperience || jobInfo.required_experience_years,
  required_education: jobInfo.required_education || "",
  required_certifications: [],
  required_languages: jobInfo.language || jobInfo.required_languages,
  location: jobInfo.location || jobInfo.workSite,
  job_type: jobInfo.jobType || "",
  seniority_level: jobInfo.seniorityLevel || ""
}, null, 2)}
</job_listing>

Return only the JSON analysis object as described. No extra text.`;

    const response = await getClient().models.generateContent({
      model: "gemini-2.0-flash-lite", // Using Gemini 2.0 as it was natively configured
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const cleanJson = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating AI match analysis:", error);
    return null;
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
