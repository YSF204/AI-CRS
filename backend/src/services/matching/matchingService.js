import OpenAI from "openai";

let client;

const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

// ============================================================
//   SKILL ALIAS MAP
//   Groups alternative spellings / names for the same skill.
//   When matching, every alias is treated as the canonical term.
// ============================================================
const SKILL_ALIASES = {
  // JavaScript ecosystem
  "javascript": ["js", "javascript", "ecmascript", "es6", "es2015", "es2016", "es2017", "es2018", "es2019", "es2020"],
  "typescript": ["ts", "typescript"],
  "nodejs": ["node", "node.js", "nodejs", "node js"],
  "react": ["react", "react.js", "reactjs", "react js"],
  "nextjs": ["next", "next.js", "nextjs", "next js"],
  "vue": ["vue", "vue.js", "vuejs", "vue js"],
  "angular": ["angular", "angularjs", "angular.js"],
  "express": ["express", "express.js", "expressjs"],
  "jquery": ["jquery", "jquery.js"],
  "redux": ["redux", "redux toolkit", "rtk"],

  // Python ecosystem
  "python": ["python", "python3", "python2", "py"],
  "django": ["django", "django rest framework", "drf"],
  "flask": ["flask"],
  "fastapi": ["fastapi", "fast api"],

  // Java ecosystem
  "java": ["java", "java se", "java ee", "jvm"],
  "spring": ["spring", "spring boot", "spring framework", "springboot"],

  // C# / .NET
  "csharp": ["c#", "csharp", "c sharp"],
  "dotnet": [".net", "dotnet", "asp.net", "asp net"],

  // Mobile
  "reactnative": ["react native", "react-native", "reactnative"],
  "flutter": ["flutter", "dart"],
  "swift": ["swift", "ios development", "ios"],
  "kotlin": ["kotlin", "android development", "android"],

  // Databases
  "sql": ["sql", "structured query language"],
  "mysql": ["mysql", "my sql"],
  "postgresql": ["postgresql", "postgres", "psql"],
  "mongodb": ["mongodb", "mongo", "mongo db"],
  "redis": ["redis"],
  "elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
  "sqlite": ["sqlite", "sqlite3"],
  "mssql": ["mssql", "sql server", "microsoft sql server", "t-sql", "tsql"],

  // Cloud & DevOps
  "aws": ["aws", "amazon web services", "amazon aws"],
  "gcp": ["gcp", "google cloud", "google cloud platform"],
  "azure": ["azure", "microsoft azure"],
  "docker": ["docker", "containers", "containerization"],
  "kubernetes": ["kubernetes", "k8s", "kubectl"],
  "terraform": ["terraform", "infrastructure as code", "iac"],
  "cicd": ["ci/cd", "cicd", "continuous integration", "continuous delivery", "continuous deployment", "github actions", "gitlab ci", "jenkins", "circleci"],

  // Version Control
  "git": ["git", "github", "gitlab", "bitbucket", "version control"],

  // API
  "restapi": ["rest", "rest api", "restful", "restful api", "http api"],
  "graphql": ["graphql", "graph ql"],

  // Testing
  "testing": ["unit testing", "integration testing", "test driven development", "tdd", "bdd", "jest", "mocha", "cypress", "selenium", "pytest"],

  // UI/UX & styling
  "css": ["css", "css3", "stylesheets"],
  "html": ["html", "html5"],
  "tailwind": ["tailwind", "tailwindcss", "tailwind css"],
  "sass": ["sass", "scss"],
  "figma": ["figma", "figma design"],

  // Machine Learning / AI
  "machinelearning": ["machine learning", "ml", "artificial intelligence", "ai", "deep learning", "dl"],
  "tensorflow": ["tensorflow", "tf"],
  "pytorch": ["pytorch", "torch"],

  // Soft skills
  "communication": ["communication", "communication skills", "verbal communication", "written communication"],
  "teamwork": ["teamwork", "team player", "collaboration", "collaborative"],
  "leadership": ["leadership", "team lead", "team leader", "managing teams"],
  "problemsolving": ["problem solving", "problem-solving", "analytical thinking", "critical thinking"],
  "agile": ["agile", "scrum", "kanban", "agile methodology", "scrum master"],
};

// Build a reverse lookup: alias → canonical key
const buildAliasLookup = () => {
  const lookup = new Map();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    for (const alias of aliases) {
      lookup.set(alias.toLowerCase(), canonical);
    }
  }
  return lookup;
};
const ALIAS_LOOKUP = buildAliasLookup();

// Normalize a single skill string to its canonical form (or itself if unknown)
const normalizeSkill = (skill) => {
  const lower = skill.toLowerCase().trim();
  return ALIAS_LOOKUP.get(lower) || lower;
};

// ============================================================
//   IMPLIED SKILLS MAP
//   If a candidate has skill A, they implicitly also have skill B.
//   Only one direction (A → B, not B → A).
// ============================================================
const IMPLIED_SKILLS = {
  // TypeScript implies JavaScript
  "typescript": ["javascript"],
  // Kubernetes implies Docker/containers
  "kubernetes": ["docker"],
  // React implies JavaScript, HTML, CSS
  "react": ["javascript", "html", "css"],
  // Vue implies JavaScript, HTML, CSS
  "vue": ["javascript", "html", "css"],
  // Angular implies typescript, html, css
  "angular": ["typescript", "javascript", "html", "css"],
  // Next.js implies React
  "nextjs": ["react", "javascript"],
  // Node.js implies JavaScript
  "nodejs": ["javascript"],
  // Express implies Node.js and JavaScript
  "express": ["nodejs", "javascript"],
  // Sass implies CSS
  "sass": ["css"],
  // Django implies Python
  "django": ["python"],
  // Flask implies Python
  "flask": ["python"],
  // FastAPI implies Python
  "fastapi": ["python"],
  // Spring implies Java
  "spring": ["java"],
  // React Native implies JavaScript
  "reactnative": ["javascript"],
  // Flutter implies Dart
  "flutter": ["dart"],
  // PostgreSQL/MySQL/SQLite/MSSQL implies SQL
  "postgresql": ["sql"],
  "mysql": ["sql"],
  "sqlite": ["sql"],
  "mssql": ["sql"],
};

// Expand a list of canonical skills to include implied skills
const expandWithImpliedSkills = (canonicalSkills) => {
  const expanded = new Set(canonicalSkills);
  for (const skill of canonicalSkills) {
    const implied = IMPLIED_SKILLS[skill] || [];
    for (const imp of implied) {
      expanded.add(imp);
    }
  }
  return Array.from(expanded);
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
 * Calculate skills match between two arrays.
 * Uses:
 *   1. Alias normalization  — "React.js" = "React", "Node" = "Node.js"
 *   2. Implied skills       — If applicant knows TypeScript → also knows JavaScript
 *   3. Partial string match — Fallback for unknown aliases
 */
const calculateSkillsMatch = (applicantSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!applicantSkills || applicantSkills.length === 0) return 0;

  // Normalize required skills to canonical form
  const canonicalRequired = requiredSkills.map(normalizeSkill);

  // Normalize applicant skills to canonical form, then expand with implied skills
  const canonicalApplicant = applicantSkills.map(normalizeSkill);
  const expandedApplicant = new Set(expandWithImpliedSkills(canonicalApplicant));

  let matchCount = 0;
  for (const reqSkill of canonicalRequired) {
    // 1. Direct canonical match
    if (expandedApplicant.has(reqSkill)) {
      matchCount++;
      continue;
    }

    // 2. Fallback: partial string match for unknown/unlisted skills
    const reqLower = reqSkill.toLowerCase();
    const partialMatch = [...expandedApplicant].some(
      (appSkill) =>
        appSkill.includes(reqLower) ||
        reqLower.includes(appSkill)
    );
    if (partialMatch) {
      matchCount += 0.8; // partial credit for fuzzy match
    }
  }

  return Math.min((matchCount / canonicalRequired.length) * 100, 100);
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
Your job is to deeply understand a candidate's profile and evaluate their true fit for a specific role — not just compare keywords.

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

### 3. TRANSFERABLE SKILLS
Experience in a related technology counts:
- Someone who built REST APIs in Django can work with Flask/FastAPI
- SQL expertise transfers across MySQL, PostgreSQL, MSSQL, SQLite
- AWS experience makes GCP/Azure adaptation fast

### 4. PROJECT EVIDENCE
If the candidate's work history required skill X (even if X isn't explicitly listed), credit them.
Example: "Led microservices project on AWS EKS" → implies Docker, Kubernetes, AWS

### 5. CERTIFICATION INTELLIGENCE
Certifications prove knowledge. "AWS Certified Solutions Architect" = cloud/AWS expertise.

### 6. HONEST GAPS
Only list a skill as a gap if it is truly missing with no reasonable implication path.

---

## ANALYSIS FRAMEWORK

You will evaluate the candidate across 6 weighted dimensions:

1. TECHNICAL SKILLS MATCH         — Weight: 30%
   - Use the implied skills rules above — do not just compare text.
   - Credit transferable knowledge. Note what was inferred in the summary.
   - Missing critical skills reduce this score significantly.

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

## EDGE CASES & SAFEGUARDS
- If the candidate profile contains random characters, keyboard smashes (e.g., 'adjadlandlaismdasljn'), gibberish, or lacks any coherent professional information:
  → YOU MUST return an overall_fit_percentage of 0, set "fit_label" to "Not Recommended", and note in "recruiter_summary" that the input was invalid or gibberish. Do NOT hallucinate a match for incoherent text!
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

    const response = await getClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" }
    });

    const cleanJson = response.choices[0].message.content.trim();
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
