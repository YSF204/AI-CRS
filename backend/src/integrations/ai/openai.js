import OpenAI from "openai";
import fs from "fs";
import {
  SYSTEM_PROMPTS,
  CV_ANALYSIS_PROMPTS,
  JOB_MATCHING_PROMPTS,
  ATS_SCORE_PROMPTS,
  SKILL_GAP_PROMPTS,
} from "./prompts/index.js";

let client;
export const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

// ==========================================
// CV ANALYSIS FUNCTIONS
// ==========================================

/**
 * Analyze CV from uploaded PDF file
 * @param {string} filePath - Path to CV file
 * @param {string} jobDescription - Target job description
 * @returns {Promise<string>} Analysis result
 */
export const analyzeCVFromFile = async (filePath, jobDescription = "") => {
  const file = await getClient().files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: CV_ANALYSIS_PROMPTS.ANALYZE_UPLOADED_CV(jobDescription),
          },
          {
            type: "input_file",
            file_id: file.id,
          },
        ],
      },
    ],
  });

  return response.output_text;
};

/**
 * Analyze CV from database (text format)
 * @param {string} cvText - CV content as text
 * @param {string} jobDescription - Target job description
 * @returns {Promise<string>} Analysis result
 */
export const analyzeCVFromDatabase = async (cvText, jobDescription = "") => {
  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: CV_ANALYSIS_PROMPTS.ANALYZE_DATABASE_CV(jobDescription),
          },
          {
            type: "input_text",
            text: cvText,
          },
        ],
      },
    ],
  });

  return response.output_text;
};

/**
 * Analyze specific CV section
 * @param {string} section - Section name
 * @param {object} sectionData - Section content
 * @returns {Promise<string>} Analysis result
 */
export const analyzeCVSection = async (section, sectionData) => {
  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: CV_ANALYSIS_PROMPTS.ANALYZE_SECTION(section, sectionData),
      },
    ],
  });

  return response.output_text;
};

/**
 * Analyze CV for ATS score and optimization recommendations
 * @param {object} cvData - Structured CV data
 * @returns {Promise<string>} ATS analysis result
 */
export const analyzeATSScore = async (cvData) => {
  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: ATS_SCORE_PROMPTS.ANALYZE_ATS_SCORE(cvData),
      },
    ],
  });

  return response.output_text;
};

// ==========================================
// JOB MATCHING FUNCTIONS
// ==========================================

/**
 * Match candidates to a job posting
 * @param {object} jobPosting - Job details
 * @param {array} candidates - Array of candidate CVs
 * @returns {Promise<string>} Matching result
 */
export const matchCandidatesToJob = async (jobPosting, candidates) => {
  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: JOB_MATCHING_PROMPTS.MATCH_CANDIDATES_TO_JOB(
          jobPosting,
          candidates,
        ),
      },
    ],
  });

  return response.output_text;
};

/**
 * Match jobs to candidate CV
 * @param {object} candidateCV - Candidate's CV data
 * @param {array} jobs - Array of job postings
 * @returns {Promise<string>} Matching result
 */
export const matchCVToJobs = async (candidateCV, jobs) => {
  // FIX #7: Use chat.completions.create with JSON mode instead of deprecated responses API
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a job matching AI. You MUST respond with ONLY valid JSON, no additional text, no markdown formatting. Always return a JSON array of match objects.",
      },
      {
        role: "user",
        content: JOB_MATCHING_PROMPTS.MATCH_JOBS_TO_CANDIDATE(
          candidateCV,
          jobs,
        ),
      },
    ],
  });

  const rawResponse = response.choices[0].message.content;

  // FIX #7: Log first 300 chars of response for debugging
  console.log(
    `[AI Matching] Raw response (first 300 chars): ${rawResponse.substring(0, 300)}`,
  );

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(rawResponse);
    // If the result is an object with a 'matches' property, use that; otherwise treat array as-is
    return Array.isArray(parsed) ? parsed : parsed.matches || parsed;
  } catch (error) {
    console.error(`[AI Matching] Failed to parse JSON response:`, rawResponse);
    throw new Error(
      `AI matching failed to return valid JSON: ${error.message}`,
    );
  }
};

/**
 * Generate application analysis for CV
 * @param {string} cvText - CV content
 * @param {string} jobDescription - Job description
 * @returns {Promise<string>} Analysis result
 */
export const analyzeApplicationCV = async (filePath, jobDescription) => {
  const file = await getClient().files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: CV_ANALYSIS_PROMPTS.ANALYZE_UPLOADED_CV(jobDescription),
          },
          {
            type: "input_file",
            file_id: file.id,
          },
        ],
      },
    ],
  });

  return response.output_text;
};

/**
 * Rank candidates for a position
 * @param {object} jobPosting - Job requirements
 * @param {string} requirementsText - Text version of requirements
 * @param {array} candidates - Candidate CVs
 * @returns {Promise<string>} Ranking result
 */
export const rankCandidates = async (
  jobPosting,
  requirementsText,
  candidates,
) => {
  const response = await getClient().responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: `You are a Senior Technical Recruiter and ATS expert.

You will receive multiple candidate CVs, each delimited by "=== CANDIDATEID [cvId] ===".

Rank them strictly based on how well they fit the following position:

${requirementsText}

Return ONLY a valid JSON array (no markdown, no code fences), sorted best-first:

[
  {
    "cvId": "<exact cvId from delimiter>",
    "rank": <integer starting at 1, 1 = best fit>,
    "matchScore": <number 0-100>,
    "reasoning": "<2-3 sentence explanation of fit>"
  }
]

If NO candidates match, return: []`,
      },
    ],
  });

  return response.output_text;
};

// ==========================================
// SKILL GAP ANALYSIS
// ==========================================

export const analyzeSkillGap = async ({ cvData, targetRole, additionalInfo }) => {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: SKILL_GAP_PROMPTS.ANALYZE_SKILL_GAP({ cvData, targetRole, additionalInfo }),
      },
    ],
  });

  const raw = response.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    console.error("[Skill Gap] Failed to parse JSON:", raw.substring(0, 300));
    throw new Error("AI returned invalid JSON for skill gap analysis");
  }
};

// ==========================================
// SYSTEM PROMPT GETTERS
// ==========================================

/**
 * Get system prompt for CV analysis
 * @returns {string} System prompt
 */
export const getSystemPromptForAnalysis = () => {
  return SYSTEM_PROMPTS.CV_ANALYSIS;
};

/**
 * Get system prompt for job matching
 * @returns {string} System prompt
 */
export const getSystemPromptForMatching = () => {
  return SYSTEM_PROMPTS.JOB_MATCHING;
};

/**
 * Get system prompt for form suggestions
 * @returns {string} System prompt
 */
export const getSystemPromptForSuggestions = () => {
  return SYSTEM_PROMPTS.FORM_SUGGESTIONS;
};

// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================

export default {
  // CV Analysis
  analyzeCVFromFile,
  analyzeCVFromDatabase,
  analyzeCVSection,
  analyzeApplicationCV,
  analyzeATSScore,
  analyzeSkillGap,

  // Job Matching
  matchCandidatesToJob,
  matchCVToJobs,
  rankCandidates,

  // System Prompts
  getSystemPromptForAnalysis,
  getSystemPromptForMatching,
  getSystemPromptForSuggestions,
};
