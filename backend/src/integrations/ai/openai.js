import OpenAI from "openai";
import fs from "fs";

let client;
const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

const buildPrompt = (
  jobDescription,
) => `You are a Senior Technical Recruiter and ATS expert.

Do TWO things with the attached CV:

1. EXTRACT the CV data into structured fields
2. ANALYZE the CV and score it

${jobDescription ? `Target job: "${jobDescription}"` : ""}

Respond with ONLY a valid JSON object (no markdown, no code fences).

{
  "cvData": {
    "jobTitle": "<extracted job title or target role>",
    "summary": "<extracted profile summary>",
    "contact": {
      "email": "<email or null>",
      "phone": "<phone or null>",
      "linkedin": "<linkedin url or null>",
      "github": "<github url or null>"
    },
    "address": {
      "city": "<city or N/A>",
      "street": "<street or N/A>"
    },
    "experience": [
      { "institutionName": "<company>", "position": "<role>", "duration": <years as number>, "summary": "<brief description>" }
    ],
    "education": [
      { "institutionName": "<school>", "certification": "<degree>", "duration": <years as number>, "summary": "<brief description>" }
    ],
    "technicalSkills": ["<skill1>", "<skill2>"],
    "softSkills": ["<skill1>", "<skill2>"],
    "language": ["<lang1>", "<lang2>"]
  },
  "analysis": {
    "score": <number 0-100>,
    "strengths": "<3-5 short bullet points>",
    "weaknesses": "<3-5 short bullet points>",
    "suggestions": "<3-5 short bullet points>"
  }
}`;

// for uploaded PDF files — extracts CV data + analyzes in one call
export const analyzeCVFromFile = async (filePath, jobDescription) => {
  const file = await getClient().files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: buildPrompt(jobDescription) },
          { type: "input_file", file_id: file.id },
        ],
      },
    ],
  });

  return response.output_text;
};

const promptForCvInDatabase = (
  jobDescription,
) => `You are a Senior Technical Recruiter and ATS expert.

Do ONE thing with the attached CV:

1. ANALYZE the CV and score it

${jobDescription ? `Target job: "${jobDescription}"` : ""}

Respond with ONLY a valid JSON object (no markdown, no code fences).

{
  "analysis": {
    "score": <number 0-100>,
    "strengths": "<3-5 short bullet points>",
    "weaknesses": "<3-5 short bullet points>",
    "suggestions": "<3-5 short bullet points>"
  }
}`;

// for CV in the database
export const analyzeCVFromDatabase = async (cvText, jobDescription) => {
  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: promptForCvInDatabase(jobDescription) },
          { type: "input_text", text: cvText },
        ],
      },
    ],
  });

  return response.output_text;
};

const matchJobsPrompt = () => {
  return `You are an intelligent CV-to-Job Matching Engine integrated into a professional recruitment platform (AI-CRS). Your sole responsibility is to analyze a candidate's CV and compare it against a provided list of job listings from the database, then return only the jobs that are genuinely relevant to the candidate's professional profile.

---

## YOUR BEHAVIOR RULES

1. **Deep CV Analysis**
   - Extract the candidate's: job title(s), professional field, skills (technical & soft), years of experience, education level, certifications, languages, and industry background.
   - Identify the candidate's PRIMARY career domain (e.g., Software Development, Graphic Design, Nursing, Accounting, etc.).
   - Identify any SECONDARY or transferable skills that could broaden the match scope slightly.

2. **Strict Domain Filtering**
   - ONLY return jobs that belong to the same professional domain or a closely related one.
   - NEVER return jobs from unrelated fields. Example: a Software Developer must NOT see Chef, Nurse, Driver, or Plumber listings — even if those jobs exist in the database.
   - If the candidate is a junior, do not exclude senior roles entirely — include them but flag them.
   - If the candidate is senior, still include junior/mid roles as they may choose to apply.

3. **Relevance Scoring**
   - Assign each matched job a relevance score from 0 to 100 based on:
     - Field match (40 points): Does the job belong to the candidate's domain?
     - Skills match (30 points): How many required skills does the candidate have?
     - Experience match (20 points): Does the candidate's experience level align?
     - Education match (10 points): Does the candidate meet the educational requirements?
   - Only return jobs with a relevance score of 50 or above.
   - Sort results from highest to lowest score.

4. **Output Format**
   Return your response ONLY as a valid JSON array. Do not include any preamble, explanation, or markdown. Each object in the array must follow this exact structure:

   [
     {
       "job_id": "string",
       "job_title": "string",
       "company": "string",
       "relevance_score": number,
       "match_reasons": ["reason 1", "reason 2", "reason 3"],
       "missing_skills": ["skill 1", "skill 2"],
       "experience_fit": "junior | mid | senior | overqualified | underqualified",
       "recommendation_note": "A 1-2 sentence personalized note explaining why this job suits the candidate."
     }
   ]

   If NO jobs match the candidate's profile, return an empty array: []

5. **Edge Cases**
   - If the CV is empty, unreadable, or clearly not a professional resume, return: { "error": "invalid_cv", "message": "The uploaded document does not appear to be a valid CV. Please upload a proper resume." }
   - If the jobs list is empty, return: { "error": "no_jobs", "message": "No job listings are currently available in the database." }
   - Never hallucinate job listings that were not provided to you.
   - Never modify or fabricate job details.`;
};

export const matchCVToJobs = async (cvText, jobText) => {
  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: matchJobsPrompt() },
          { type: "input_text", text: `<cv>\n${cvText}\n</cv>\n\n<jobs>\n${jobText}\n</jobs>` },
        ],
      },
    ],
  });

  return response.output_text;
};

// Analyze a CV against a specific job - uses OpenAI File API for direct PDF processing
export const analyzeApplicationCV = async (filePath, jobDescription) => {
  const file = await getClient().files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const prompt = `You are an expert AI Recruitment Analyst integrated into a professional recruitment platform called AI-CRS.
Your job is to perform a deep, structured, and honest analysis of a candidate's CV against a specific job's requirements.

Respond with ONLY a valid JSON object (no markdown, no code fences).

{
  "candidate_name": "string or 'Unknown' if not found",
  "job_title": "string",
  "company": "string",
  "applicant_form": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "yearsOfExperience": <number>,
    "technicalSkills": ["skill"],
    "softSkills": ["skill"],
    "languages": ["lang"],
    "summary": "string",
    "additionalInformation": "string"
  },
  "overall_fit_percentage": <number 0-100>,
  "fit_label": "Excellent Fit | Strong Fit | Good Fit | Moderate Fit | Weak Fit | Not Recommended",
  "confidence_level": "High | Medium | Low",
  "confidence_note": "Short reason for confidence level",
  "dimension_scores": {
    "technical_skills": { "score": <number 0-100>, "summary": "string" },
    "experience": { "score": <number 0-100>, "summary": "string" },
    "education_certifications": { "score": <number 0-100>, "summary": "string" },
    "soft_skills_culture": { "score": <number 0-100>, "summary": "string" },
    "language_location": { "score": <number 0-100>, "summary": "string" },
    "achievements_value": { "score": <number 0-100>, "summary": "string" }
  },
  "strengths": ["Clear strength point 1"],
  "gaps": [{ "gap": "Name of the gap", "severity": "Critical|High|Medium|Low", "suggestion": "What the candidate could do to close this gap" }],
  "matched_skills": ["skill1"],
  "missing_required_skills": ["skill1"],
  "recruiter_summary": "A 3-4 sentence professional paragraph summarizing the candidate's fit for this role."
}

Target job: "${jobDescription}"

Analyze the attached PDF CV and return the JSON analysis object. No extra text.`;

  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_file", file_id: file.id },
        ],
      },
    ],
  });

  return response.output_text;
};

const rankCandidatesPrompt = (
  requiemrents,
) => ` You are a Senior Technical Recruiter and ATS expert.
You will receive multiple candidate CVs, each delimited by "=== CANDIDATE [cvId] ===".
Rank them strictly based on how well they fit the following position:
${requiemrents}
Return ONLY a valid JSON array (no markdown, no code fences), sorted best-first:
[
  {
    "cvId": "<exact cvId from the delimiter>",
    "rank": <integer starting at 1, 1 = best fit>,
    "matchScore": <number 0-100>,
    "reasoning": "<2-3 sentence explanation>",
    "strengths": "<2-4 bullet points on why this candidate stands out>",
    "skillsMatched": ["<skills the candidate has that the position requires>"],
    "skillsMissing": ["<skills the position requires but the candidate lacks>"]
  }
]`;

export const rankCandidates = async (requiemrentsText, CV) => {
  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: rankCandidatesPrompt(requiemrentsText) },
          { type: "input_text", text: CV.join("\n\n") },
        ],
      },
    ],
  });
  return response.output_text;
};
