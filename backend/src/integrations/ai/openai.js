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

IMPORTANT CERTIFICATION HANDLING:
- Extract ALL certifications, even if they appear standalone (not tied to a school)
- Standalone certifications should go into the certifications array, NOT education
- Education entries are ONLY for degrees/diplomas tied to institutions
- If a certification appears with an institution (e.g., "AWS Certified at Amazon"), put it in education
- If a certification appears alone (e.g., "AWS Certified Solutions Architect"), put it in certifications array

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
      { "institutionName": "<company>", "position": "<role>", "durationFrom": "<YYYY-MM>", "durationTo": "<YYYY-MM or empty if present>", "summary": "<brief description>" }
    ],
    "education": [
      { "institutionName": "<school>", "certification": "<degree/diploma name>", "durationFrom": "<YYYY-MM>", "durationTo": "<YYYY-MM or empty>", "summary": "<brief description>" }
    ],
    "certifications": ["<standalone certification 1>", "<standalone certification 2>"],
    "technicalSkills": ["<skill1>", "<skill2>"],
    "softSkills": ["<skill1>", "<skill2>"],
    "language": ["<lang1>", "<lang2>"],
    "yearsOfExperience": <total years as number>
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
   - Assign each matched job a relevance score from 0 to 100 based on a realistic holistic assessment.
   - Consider the WHOLE picture: skills (implied + explicit), experience quality, and domain applicability.
   - CALIBRATION:
     - 80-100%: Strong to Perfect match. The candidate is highly qualified for this exact role.
     - 60-79%: Good match. Meets core needs despite some minor gaps.
     - 30-59%: Weak match. Missing major requirements.
   - Do NOT be artificially restrictive. Let capable candidates score 75%+ if their skills match the requirements, especially through inference and implication.
   - Only return jobs with a relevance score of 30 or above.
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
Your job is to deeply understand a candidate's CV and evaluate their fit for a specific role.

## CRITICAL INTELLIGENCE RULES — READ CAREFULLY

### 1. UNDERSTAND, DON'T JUST COMPARE TEXT
You are NOT a keyword matcher. You must reason about what the candidate actually knows and can do.

### 2. IMPLIED SKILLS
Many skills imply others. A candidate who has skill A also inherently has skill B:
- TypeScript → also knows JavaScript (TypeScript IS JavaScript with types)
- Kubernetes → also knows Docker/containers (you cannot use K8s without Docker)
- React / Vue / Angular → also knows JavaScript, HTML, CSS
- Next.js → also knows React and JavaScript
- Node.js / Express → also knows JavaScript
- Django / Flask / FastAPI → also knows Python
- Spring Boot → also knows Java
- PostgreSQL / MySQL / SQLite → also knows SQL
- Sass/SCSS → also knows CSS
- React Native → also knows JavaScript

### 3. TRANSFERABLE SKILLS
Experience in a related technology or domain should count:
- Someone who built REST APIs in Django can also work with Flask or FastAPI
- Someone experienced with AWS can adapt to GCP or Azure faster than a fresh hire
- A developer who has used Jest/Mocha understands testing principles applicable elsewhere
- SQL expertise transfers across MySQL, PostgreSQL, SQLite, MSSQL

### 4. PROJECT EVIDENCE
If the candidate lists a project or role that required skill X (even if X isn't explicitly listed), credit them for X.
Example: "Built a microservices architecture on AWS EKS" → implies Docker, Kubernetes, AWS, microservices

### 5. CERTIFICATION INTELLIGENCE
A certification proves knowledge that may not be in the skills section. 
"AWS Certified Solutions Architect" proves cloud computing and AWS even without listing "AWS" in skills.

### 6. HONEST GAPS
If a skill is truly missing AND there is no reasonable implication path, list it as a gap.
Do NOT fabricate skills. Be honest about genuine gaps but be intelligent about what can be inferred.

---

## OUTPUT FORMAT

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
    "technicalSkills": ["skill — include BOTH explicit and strongly implied skills"],
    "softSkills": ["skill"],
    "languages": ["lang"],
    "summary": "string",
    "additionalInformation": "string"
  },
  "overall_fit_percentage": <number 0-100>,
  // HOW TO SCORE overall_fit_percentage:
  // This is YOUR holistic assessment as an expert recruiter — NOT a formula.
  // Consider the WHOLE picture: skills (implied + explicit), experience quality, project evidence, certifications.
  // CALIBRATION:
  //   90-100%: Near perfect match, candidate has virtually everything required
  //   75-89%:  Strong fit, has most requirements with minor gaps
  //   60-74%:  Good fit, solid foundation with some gaps
  //   45-59%:  Moderate, meets basic needs but has notable gaps
  //   30-44%:  Weak, missing several key requirements
  //   0-29%:   Not suitable, significant misalignment
  // DO NOT be artificially conservative. A candidate whose CV was built to match the job
  // and demonstrates the required skills (even through implication/inference) should score 75%+.
  // Only give a low score if there are GENUINE critical gaps.

  "fit_label": "Excellent Fit | Strong Fit | Good Fit | Moderate Fit | Weak Fit | Not Recommended",
  "confidence_level": "High | Medium | Low",
  "confidence_note": "Short reason for confidence level",
  "dimension_scores": {
    "technical_skills": { "score": <number 0-100>, "summary": "string — explain what you inferred, not just what was listed" },
    "experience": { "score": <number 0-100>, "summary": "string" },
    "education_certifications": { "score": <number 0-100>, "summary": "string" },
    "soft_skills_culture": { "score": <number 0-100>, "summary": "string" },
    "language_location": { "score": <number 0-100>, "summary": "string" },
    "achievements_value": { "score": <number 0-100>, "summary": "string" }
  },
  "strengths": ["Clear strength point — reference specific CV evidence"],
  "gaps": [{ "gap": "Name of the gap", "severity": "Critical|High|Medium|Low", "suggestion": "Actionable suggestion" }],
  "matched_skills": ["skills matched explicitly or through inference — note inference in parentheses e.g. 'JavaScript (inferred from TypeScript)'"],
  "missing_required_skills": ["skill1"],
  "recruiter_summary": "A 3-4 sentence professional paragraph summarizing the candidate's true fit, considering both explicit and inferred knowledge."
}

Target job: "${jobDescription}"

Analyze the attached PDF CV using the intelligence rules above. Think deeply. Return only the JSON.`;

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
