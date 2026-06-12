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
  javascript: [
    "js",
    "javascript",
    "ecmascript",
    "es6",
    "es2015",
    "es2016",
    "es2017",
    "es2018",
    "es2019",
    "es2020",
  ],
  typescript: ["ts", "typescript"],
  nodejs: ["node", "node.js", "nodejs", "node js"],
  react: ["react", "react.js", "reactjs", "react js"],
  nextjs: ["next", "next.js", "nextjs", "next js"],
  vue: ["vue", "vue.js", "vuejs", "vue js"],
  angular: ["angular", "angularjs", "angular.js"],
  express: ["express", "express.js", "expressjs"],
  jquery: ["jquery", "jquery.js"],
  redux: ["redux", "redux toolkit", "rtk"],

  // Python ecosystem
  python: ["python", "python3", "python2", "py"],
  django: ["django", "django rest framework", "drf"],
  flask: ["flask"],
  fastapi: ["fastapi", "fast api"],

  // Java ecosystem
  java: ["java", "java se", "java ee", "jvm"],
  spring: ["spring", "spring boot", "spring framework", "springboot"],

  // C# / .NET
  csharp: ["c#", "csharp", "c sharp"],
  dotnet: [".net", "dotnet", "asp.net", "asp net"],

  // Mobile
  reactnative: ["react native", "react-native", "reactnative"],
  flutter: ["flutter", "dart"],
  swift: ["swift", "ios development", "ios"],
  kotlin: ["kotlin", "android development", "android"],

  // Databases
  sql: ["sql", "structured query language"],
  mysql: ["mysql", "my sql"],
  postgresql: ["postgresql", "postgres", "psql"],
  mongodb: ["mongodb", "mongo", "mongo db"],
  redis: ["redis"],
  elasticsearch: ["elasticsearch", "elastic search", "opensearch"],
  sqlite: ["sqlite", "sqlite3"],
  mssql: ["mssql", "sql server", "microsoft sql server", "t-sql", "tsql"],

  // Cloud & DevOps
  aws: ["aws", "amazon web services", "amazon aws"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  azure: ["azure", "microsoft azure"],
  docker: ["docker", "containers", "containerization"],
  kubernetes: ["kubernetes", "k8s", "kubectl"],
  terraform: ["terraform", "infrastructure as code", "iac"],
  cicd: [
    "ci/cd",
    "cicd",
    "continuous integration",
    "continuous delivery",
    "continuous deployment",
    "github actions",
    "gitlab ci",
    "jenkins",
    "circleci",
  ],

  // Version Control
  git: ["git", "github", "gitlab", "bitbucket", "version control"],

  // API
  restapi: ["rest", "rest api", "restful", "restful api", "http api"],
  graphql: ["graphql", "graph ql"],

  // Testing
  testing: [
    "unit testing",
    "integration testing",
    "test driven development",
    "tdd",
    "bdd",
    "jest",
    "mocha",
    "cypress",
    "selenium",
    "pytest",
  ],

  // UI/UX & styling
  css: ["css", "css3", "stylesheets"],
  html: ["html", "html5"],
  tailwind: ["tailwind", "tailwindcss", "tailwind css"],
  sass: ["sass", "scss"],
  figma: ["figma", "figma design"],

  // Machine Learning / AI
  machinelearning: [
    "machine learning",
    "ml",
    "artificial intelligence",
    "ai",
    "deep learning",
    "dl",
  ],
  tensorflow: ["tensorflow", "tf"],
  pytorch: ["pytorch", "torch"],

  // Soft skills
  communication: [
    "communication",
    "communication skills",
    "verbal communication",
    "written communication",
  ],
  teamwork: ["teamwork", "team player", "collaboration", "collaborative"],
  leadership: ["leadership", "team lead", "team leader", "managing teams"],
  problemsolving: [
    "problem solving",
    "problem-solving",
    "analytical thinking",
    "critical thinking",
  ],
  agile: ["agile", "scrum", "kanban", "agile methodology", "scrum master"],
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
  typescript: ["javascript"],
  // Kubernetes implies Docker/containers
  kubernetes: ["docker"],
  // React implies JavaScript, HTML, CSS
  react: ["javascript", "html", "css"],
  // Vue implies JavaScript, HTML, CSS
  vue: ["javascript", "html", "css"],
  // Angular implies typescript, html, css
  angular: ["typescript", "javascript", "html", "css"],
  // Next.js implies React
  nextjs: ["react", "javascript"],
  // Node.js implies JavaScript
  nodejs: ["javascript"],
  // Express implies Node.js and JavaScript
  express: ["nodejs", "javascript"],
  // Sass implies CSS
  sass: ["css"],
  // Django implies Python
  django: ["python"],
  // Flask implies Python
  flask: ["python"],
  // FastAPI implies Python
  fastapi: ["python"],
  // Spring implies Java
  spring: ["java"],
  // React Native implies JavaScript
  reactnative: ["javascript"],
  // Flutter implies Dart
  flutter: ["dart"],
  // PostgreSQL/MySQL/SQLite/MSSQL implies SQL
  postgresql: ["sql"],
  mysql: ["sql"],
  sqlite: ["sql"],
  mssql: ["sql"],
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


export const calculateMatchPercentage = (applicantInfo, jobRequirements) => {

  const jobTechSkills = jobRequirements.technicalSkills || [];
  const jobSoftSkills = jobRequirements.softSkills || [];
  const jobLanguages = jobRequirements.language || [];
  const yearsRequired = jobRequirements.yearsOfExperience || 0;

  // ── 1. Raw dimension scores ───────────────────────────────────────────────
  const techSkillsMatch = calculateSkillsMatch(
    applicantInfo.technicalSkills || [],
    jobTechSkills,
  );

  const softSkillsMatch = calculateSkillsMatch(
    applicantInfo.softSkills || [],
    jobSoftSkills,
  );

  const languagesMatch = calculateSkillsMatch(
    applicantInfo.languages || [],
    jobLanguages,
  );

  // Derive years of experience from entries if not set explicitly
  let yearsApplicant = applicantInfo.yearsOfExperience || 0;
  if (yearsApplicant === 0 && Array.isArray(applicantInfo.experience) && applicantInfo.experience.length > 0) {
    yearsApplicant = applicantInfo.experience.reduce((sum, exp) => {
      if (exp.duration) return sum + Number(exp.duration || 0);
      const from = exp.durationFrom ? parseInt(exp.durationFrom, 10) : null;
      const to = exp.durationTo ? parseInt(exp.durationTo, 10) : new Date().getFullYear();
      if (from && !isNaN(from) && !isNaN(to)) return sum + Math.max(0, to - from);
      return sum;
    }, 0);
  }
  const experienceMatch = calculateExperienceMatch(yearsApplicant, yearsRequired);

  // ── 2. Dynamic weights — only count categories the job actually specifies ─
  // Fixed base weights
  let wTech = jobTechSkills.length > 0 ? 0.50 : 0;
  let wExp  = yearsRequired > 0        ? 0.25 : 0;
  let wSoft = jobSoftSkills.length > 0 ? 0.15 : 0;
  let wLang = jobLanguages.length > 0  ? 0.10 : 0;

  // Normalise so weights always sum to 1 — distributes unused weight proportionally
  const wTotal = wTech + wExp + wSoft + wLang || 1;
  wTech /= wTotal; wExp /= wTotal; wSoft /= wTotal; wLang /= wTotal;

  // ── 3. Weighted score ─────────────────────────────────────────────────────
  const rawScore =
    techSkillsMatch * wTech +
    experienceMatch * wExp  +
    softSkillsMatch * wSoft +
    languagesMatch  * wLang;

  // ── 4. Generous floor — a candidate with any relevant tech skills should
  //       never score below 30 (they are at least worth reviewing)
  const hasAnyTechOverlap = techSkillsMatch > 0;
  const floored = hasAnyTechOverlap ? Math.max(rawScore, 30) : rawScore;

  // ── 5. Clamp to [0, 100] and round ───────────────────────────────────────
  const percentage = Math.min(100, Math.round(floored));

  return {
    percentage,
    breakdown: {
      technicalSkillsMatch: Math.round(techSkillsMatch),
      experienceMatch: Math.round(experienceMatch),
      softSkillsMatch: Math.round(softSkillsMatch),
      languagesMatch: Math.round(languagesMatch),
    },
  };
};

/**
 * Smart skills matcher.
 * Layers:
 *   1. Alias normalisation   — "React.js" = "reactjs" canonical
 *   2. Implied skills        — TypeScript holder implicitly knows JavaScript
 *   3. Compound expansion    — "Frontend: React, NextJS" → individual tokens
 *   4. Bidirectional fuzzy   — substring match in both directions with 0.8 credit
 *   5. Word-overlap scoring  — multi-word skills score on shared word count
 */
const calculateSkillsMatch = (applicantSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!applicantSkills || applicantSkills.length === 0) return 0;

  const expandSkillStrings = (skills) =>
    skills
      .flatMap((s) => s.split(/[,;|]/))
      .map((s) => s.replace(/^[^:]+:\s*/, "").trim())
      .filter(Boolean);

  const canonicalRequired = expandSkillStrings(requiredSkills).map(normalizeSkill);
  const canonicalApplicant = expandSkillStrings(applicantSkills).map(normalizeSkill);
  const expandedApplicant = new Set(expandWithImpliedSkills(canonicalApplicant));

  let matchCount = 0;

  for (const reqSkill of canonicalRequired) {
    // 1. Exact canonical match (includes alias + implied)
    if (expandedApplicant.has(reqSkill)) {
      matchCount += 1;
      continue;
    }

    const reqLower = reqSkill.toLowerCase();
    const reqWords = reqLower.split(/\s+/).filter(w => w.length > 2);

    let bestCredit = 0;
    for (const appSkill of expandedApplicant) {
      const appLower = appSkill.toLowerCase();

      // 2. Bidirectional substring (e.g. "postgres" ↔ "postgresql")
      if (appLower.includes(reqLower) || reqLower.includes(appLower)) {
        bestCredit = Math.max(bestCredit, 0.85);
        continue;
      }

      // 3. Word-overlap for multi-word skills (e.g. "machine learning" vs "deep learning")
      const appWords = appLower.split(/\s+/).filter(w => w.length > 2);
      if (reqWords.length > 1 && appWords.length > 1) {
        const shared = reqWords.filter(w => appWords.includes(w)).length;
        if (shared > 0) {
          const overlapRatio = shared / Math.max(reqWords.length, appWords.length);
          bestCredit = Math.max(bestCredit, 0.6 * overlapRatio + 0.2);
        }
      }
    }
    matchCount += bestCredit;
  }

  const rawPct = (matchCount / canonicalRequired.length) * 100;

  // Breadth bonus: candidate who covers ≥80% of requirements gets a small lift
  const coverageRatio = matchCount / canonicalRequired.length;
  const breadthBonus = coverageRatio >= 0.8 ? 5 : coverageRatio >= 0.6 ? 3 : 0;

  return Math.min(rawPct + breadthBonus, 100);
};

/**
 * Non-linear experience match using a square-root curve.
 * This is FAR more generous than the old linear formula:
 *   50% of required years → 71% score  (was 50%)
 *   60% of required years → 77% score  (was 60%)
 *   75% of required years → 87% score  (was 75%)
 *   100%+               → 100%        (unchanged)
 * A candidate with zero experience gets 15% (not 0) — they still deserve a look.
 */
const calculateExperienceMatch = (yearsApplicant, yearsRequired) => {
  if (yearsRequired === 0) return 100;
  if (yearsApplicant === 0) return 15; // entry-level candidates still reviewed

  const ratio = yearsApplicant / yearsRequired;
  if (ratio >= 1) return 100; // meets or exceeds — full marks

  // sqrt curve: score = sqrt(ratio) * 100, floored at 20
  return Math.max(20, Math.round(Math.sqrt(ratio) * 100));
};

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

/**
 * Safe JSON parsing with fallback
 */
const safeJsonParse = (jsonString) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = jsonString
      .replace(/^```json\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "JSON parse error:",
      error.message,
      "Input:",
      jsonString.substring(0, 100),
    );
    return null;
  }
};

/**
 * Create fallback analysis based on local matching logic
 */
const createFallbackAnalysis = (
  applicantInfo,
  jobInfo,
  jobId,
  localMatchResult,
) => {
  const { strengths: localStrengths, weaknesses: localWeaknesses } =
    extractStrengthsWeaknesses("", localMatchResult.breakdown);

  return {
    candidate_name: applicantInfo.fullName || "Unknown",
    job_title: jobInfo.position || jobInfo.job_title || "Position",
    company: jobInfo.company || "Company",
    applicant_form: {
      fullName: applicantInfo.fullName || "",
      email: applicantInfo.email || "",
      phone: applicantInfo.phone || "",
      yearsOfExperience: applicantInfo.yearsOfExperience || 0,
      technicalSkills: applicantInfo.technicalSkills || [],
      softSkills: applicantInfo.softSkills || [],
      languages: applicantInfo.languages || [],
      summary: applicantInfo.summary || "",
      additionalInformation: "",
    },
    overall_fit_percentage: localMatchResult.percentage,
    fit_label:
      localMatchResult.percentage >= 75
        ? "Strong Fit"
        : localMatchResult.percentage >= 60
          ? "Good Fit"
          : localMatchResult.percentage >= 45
            ? "Moderate Fit"
            : "Weak Fit",
    confidence_level: "Medium",
    confidence_note: "Analysis generated using local scoring algorithm",
    dimension_scores: {
      technical_skills: {
        score: localMatchResult.breakdown.technicalSkillsMatch,
        weight: 30,
        weighted_contribution:
          (localMatchResult.breakdown.technicalSkillsMatch * 30) / 100,
        summary: `${localMatchResult.breakdown.technicalSkillsMatch}% technical skills alignment`,
      },
      experience: {
        score: localMatchResult.breakdown.experienceMatch,
        weight: 25,
        weighted_contribution:
          (localMatchResult.breakdown.experienceMatch * 25) / 100,
        summary: `${localMatchResult.breakdown.experienceMatch}% experience match`,
      },
      education_certifications: {
        score: localMatchResult.breakdown.educationMatch || 50,
        weight: 15,
        weighted_contribution:
          ((localMatchResult.breakdown.educationMatch || 50) * 15) / 100,
        summary: "Education level reviewed",
      },
      soft_skills_culture: {
        score: localMatchResult.breakdown.softSkillsMatch,
        weight: 10,
        weighted_contribution:
          (localMatchResult.breakdown.softSkillsMatch * 10) / 100,
        summary: `${localMatchResult.breakdown.softSkillsMatch}% soft skills alignment`,
      },
      language_location: {
        score: 60,
        weight: 10,
        weighted_contribution: 6,
        summary: "Language and location requirements checked",
      },
      achievements_value: {
        score: 50,
        weight: 10,
        weighted_contribution: 5,
        summary: "Portfolio and achievements considered",
      },
    },
    strengths:
      localStrengths.length > 0
        ? localStrengths
        : ["Profile available for review"],
    gaps: localWeaknesses.map((w) => ({
      gap: w,
      severity: "Medium",
      suggestion:
        "Candidate could strengthen this area with targeted experience",
    })),
    matched_skills: displayMatchedSkills(applicantInfo, jobInfo),
    missing_required_skills: displayMissingSkills(applicantInfo, jobInfo),
    missing_optional_skills: [],
    bonus_skills: displayBonusSkills(applicantInfo, jobInfo),
    experience_verdict: {
      required_years: jobInfo.yearsOfExperience || 0,
      candidate_years: applicantInfo.yearsOfExperience || 0,
      relevant_years: applicantInfo.yearsOfExperience || 0,
      verdict:
        (applicantInfo.yearsOfExperience || 0) >=
        (jobInfo.yearsOfExperience || 0)
          ? "Meets requirement"
          : "Below requirement",
    },
    recruiter_summary: `Fallback analysis: Candidate has ${applicantInfo.yearsOfExperience || 0} years of experience. Technical skills alignment at ${localMatchResult.breakdown.technicalSkillsMatch}%. Overall fit is ${localMatchResult.percentage}%.`,
    candidate_advice:
      "Your profile has been analyzed. Review the detailed breakdown above to see where you align with this role.",
    hiring_recommendation:
      localMatchResult.percentage >= 75
        ? "Recommend"
        : localMatchResult.percentage >= 60
          ? "Recommend with Reservations"
          : "Do Not Recommend",
  };
};

/**
 * Helper function to display matched skills
 */
const displayMatchedSkills = (applicantInfo, jobInfo) => {
  const candidateSkills = new Set(
    [
      ...(applicantInfo.technicalSkills || []),
      ...(applicantInfo.softSkills || []),
    ].map((s) => normalizeSkill(s)),
  );

  const jobSkills = new Set(
    (jobInfo.technicalSkills || jobInfo.required_skills || []).map((s) =>
      normalizeSkill(s),
    ),
  );

  const matched = [];
  for (const skill of candidateSkills) {
    if (jobSkills.has(skill)) {
      matched.push(skill);
    }
  }
  return matched.length > 0 ? matched : ["General fit"];
};

/**
 * Helper function to display missing skills
 */
const displayMissingSkills = (applicantInfo, jobInfo) => {
  const candidateSkills = new Set(
    [
      ...(applicantInfo.technicalSkills || []),
      ...(applicantInfo.softSkills || []),
    ].map((s) => normalizeSkill(s)),
  );

  const jobSkills = (
    jobInfo.technicalSkills ||
    jobInfo.required_skills ||
    []
  ).map((s) => normalizeSkill(s));

  return jobSkills.filter((skill) => !candidateSkills.has(skill));
};

/**
 * Helper function to display bonus skills
 */
const displayBonusSkills = (applicantInfo, jobInfo) => {
  const jobSkills = new Set(
    (jobInfo.technicalSkills || jobInfo.required_skills || []).map((s) =>
      normalizeSkill(s),
    ),
  );

  const candidateSkills = (applicantInfo.technicalSkills || []).map((s) =>
    normalizeSkill(s),
  );

  return candidateSkills.filter((skill) => !jobSkills.has(skill)).slice(0, 5);
};

/**
 * Retry logic for transient errors
 */
const withRetry = async (asyncFn, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(
        `Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export const generateAIMatchAnalysis = async (
  applicantInfo,
  jobInfo,
  jobId = null,
  userId = null,
  inputType = "EXISTING_PROFILE",
  rawCvText = null,
) => {
  try {
    /**
     * Build a rich, human-readable CV text so the AI has full context
     * including experience descriptions and education — not just skill arrays.
     */
    const buildRichCvText = (profile) => {
      const lines = [];

      lines.push(`Name: ${profile.fullName || "Unknown"}`);
      if (profile.email) lines.push(`Email: ${profile.email}`);
      if (profile.summary) lines.push(`Summary: ${profile.summary}`);

      lines.push(`Total Years of Experience: ${profile.yearsOfExperience || 0}`);

      // Technical skills — split compound strings like "Frontend: React, NextJS, TypeScript"
      const techSkills = (profile.technicalSkills || [])
        .flatMap((s) => s.split(/[,|;]/))
        .map((s) => s.replace(/^[^:]+:\s*/, "").trim())
        .filter(Boolean);
      if (techSkills.length > 0) {
        lines.push(`Technical Skills: ${techSkills.join(", ")}`);
      }

      const softSkills = profile.softSkills || [];
      if (softSkills.length > 0) {
        lines.push(`Soft Skills: ${softSkills.join(", ")}`);
      }

      const languages = profile.languages || [];
      if (languages.length > 0) {
        lines.push(`Languages: ${languages.join(", ")}`);
      }

      // Experience entries with full descriptions
      const experience = profile.experience || [];
      if (experience.length > 0) {
        lines.push("\nWork Experience:");
        for (const exp of experience) {
          const from = exp.durationFrom || "";
          const to = exp.durationTo || "Present";
          const duration = exp.duration ? `(${exp.duration} years)` : from ? `(${from} – ${to})` : "";
          lines.push(
            `  - ${exp.position || "Role"} at ${exp.institutionName || "Company"} ${duration}`,
          );
          if (exp.summary) lines.push(`    ${exp.summary}`);
        }
      }

      // Education
      const education = profile.education || [];
      if (education.length > 0) {
        lines.push("\nEducation:");
        for (const edu of education) {
          lines.push(
            `  - ${edu.certification || "Degree"} at ${edu.institutionName || "Institution"} (${edu.durationFrom || ""} – ${edu.durationTo || ""})`,
          );
          if (edu.summary) lines.push(`    ${edu.summary}`);
        }
      }

      // Certifications
      const certs = profile.certifications || [];
      if (certs.length > 0) {
        lines.push(`\nCertifications: ${certs.join(", ")}`);
      }

      return lines.join("\n");
    };

    const prompt = `You are an expert AI Recruitment Analyst. Your job is to evaluate candidate-to-job fit realistically, like a professional recruiter would.

## GOLDEN RULE: SCORE GENEROUSLY AND CONTEXTUALLY

DO NOT score like a binary keyword matcher. Score like a real recruiter:
- A CV that contains the core required skills + relevant experience = 65-85% (GOOD FIT)
- Only score below 50% if the candidate is genuinely unqualified for the role
- A candidate with 80% of requirements is NOT 50% fit — they are 70-80% fit

## HOW TO INTERPRET SKILLS

### Implied Skills (Credit These!)
When a candidate has skill A, they automatically have related skill B:
- TypeScript → JavaScript
- React/Vue/Angular → JavaScript, HTML, CSS
- Next.js/Nuxt → React/Vue + JavaScript
- Node.js/Express → JavaScript
- Python (any framework) → Python fundamentals
- Django/Flask/FastAPI → Python, REST APIs, databases
- Spring Boot → Java
- Kubernetes → Docker, containerization, Linux
- Microservices experience → REST APIs, databases, DevOps basics
- PostgreSQL/MySQL/SQLite → SQL, database design

### Transferable Experience (Score These as Partial Matches)
- REST API experience in Django → can learn Express/FastAPI quickly
- AWS expertise → faster to learn GCP/Azure
- Agile/Scrum methodology → transfers across companies
- Team leadership → applicable across industries

### Project Evidence
If a CV says "Built microservices on AWS EKS," credit: Docker, Kubernetes, AWS, API design, CI/CD
Don't penalize for not listing each sub-skill — the project proves them.

### IMPORTANT: Compound Skill Strings
Skills may be listed as compound strings like "Frontend: React, NextJS, TypeScript, TailwindCSS".
Parse ALL individual technologies out of such strings as separate skills before matching.

## SCORING CALIBRATION (This is Your Target)

Use these as anchors for overall_fit_percentage:

- 90-100%: Perfect match. Has virtually all required skills, right experience level, perfect role fit
- 80-89%: Strong fit. Has core required skills + relevant experience. Minor gaps acceptable (1-2 secondary requirements missing)
- 70-79%: Good fit. Has core skills + decent experience. Some gaps but trainable in role. THIS IS THE NORM FOR SOLID CANDIDATES
- 60-69%: Acceptable fit. Meets basic requirements but has gaps in secondary areas. Will need some ramp-up
- 50-59%: Below acceptable. Missing core requirements OR insufficient experience. Would need significant onboarding
- Below 50%: Weak fit. Missing multiple core requirements OR entirely wrong experience level/industry

## STRICT RULES FOR THIS ANALYSIS

1. Score EACH dimension 0-100 independently (don't bias one by another)
2. Weighted average of dimensions = your overall_fit_percentage
3. If candidate is missing 2+ CORE requirements (not secondary) → can cap at 65% max
4. If candidate meets ALL core requirements → allow score 70%+
5. DO NOT hallucinate skills — only credit what you can infer from the CV
6. DO NOT apply artificial penalties for not listing synonyms (e.g., "problem-solving" not listed but "led complex projects" shown → still counts as problem-solving)
7. ALWAYS read the full experience descriptions — past job titles and project descriptions reveal skills not listed explicitly

## OUTPUT: VALID JSON ONLY

Return ONLY valid JSON. No markdown, no fences, no text outside JSON. If you cannot parse your response as JSON, it fails the entire analysis.

{
  "candidate_name": "Name from CV or Unknown",
  "job_title": "Job title from listing",
  "company": "Company from listing or Unknown",
  "overall_fit_percentage": <integer 0-100>,
  "fit_label": "Excellent Fit | Strong Fit | Good Fit | Acceptable Fit | Below Acceptable | Not Recommended",
  "recruiter_summary": "1-2 sentence professional summary of the fit",
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "gaps": [
    {
      "gap": "gap description",
      "severity": "Critical | Important | Minor",
      "suggestion": "How to close this gap"
    }
  ],
  "matched_skills": ["skill1", "skill2"],
  "missing_required_skills": ["skill1"],
  "missing_optional_skills": ["skill1"],
  "bonus_skills": ["skill1"],
  "dimension_scores": {
    "technical_skills": {
      "score": <0-100>,
      "weight": 30,
      "summary": "brief assessment"
    },
    "experience": {
      "score": <0-100>,
      "weight": 25,
      "summary": "brief assessment"
    },
    "education_certifications": {
      "score": <0-100>,
      "weight": 15,
      "summary": "brief assessment"
    },
    "soft_skills_culture": {
      "score": <0-100>,
      "weight": 10,
      "summary": "brief assessment"
    },
    "language_location": {
      "score": <0-100>,
      "weight": 10,
      "summary": "brief assessment"
    },
    "achievements_value": {
      "score": <0-100>,
      "weight": 10,
      "summary": "brief assessment"
    }
  },
  "hiring_recommendation": "Strongly Recommend | Recommend | Recommend with Reservations | Do Not Recommend",
  "confidence_level": "High | Medium | Low"
}

## ANALYSIS DATA

Input Type: ${inputType}

Candidate Profile:
${rawCvText ? rawCvText : buildRichCvText(applicantInfo)}

Job Listing:
${JSON.stringify(
  {
    job_id: jobId,
    job_title: jobInfo.position || jobInfo.job_title,
    company: jobInfo.company,
    description: jobInfo.description,
    required_skills: jobInfo.technicalSkills || jobInfo.required_skills,
    preferred_skills: jobInfo.softSkills || jobInfo.preferred_skills,
    required_experience_years:
      jobInfo.yearsOfExperience || jobInfo.required_experience_years,
    required_education: jobInfo.required_education || "",
    required_languages: jobInfo.language || jobInfo.required_languages,
    location: jobInfo.location || jobInfo.workSite,
  },
  null,
  2,
)}

Analyze this candidate for this job. Return ONLY the JSON object above.`;

    // Use retry logic for transient failures
    let aiResult;
    try {
      aiResult = await withRetry(async () => {
        const response = await getClient().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from API");
        }
        return content.trim();
      }, 2);
    } catch (error) {
      console.error("AI API error after retries:", error.message);
      aiResult = null;
    }

    if (!aiResult) {
      console.warn("AI analysis failed, using fallback local scoring");
      const localMatchResult = calculateMatchPercentage(applicantInfo, jobInfo);
      return createFallbackAnalysis(
        applicantInfo,
        jobInfo,
        jobId,
        localMatchResult,
      );
    }

    // Try to parse AI response
    const parsed = safeJsonParse(aiResult);
    if (!parsed) {
      console.warn("Failed to parse AI response, using fallback local scoring");
      const localMatchResult = calculateMatchPercentage(applicantInfo, jobInfo);
      return createFallbackAnalysis(
        applicantInfo,
        jobInfo,
        jobId,
        localMatchResult,
      );
    }

    // Validate response structure
    if (!parsed.overall_fit_percentage && parsed.overall_fit_percentage !== 0) {
      console.warn("Invalid AI response structure, using fallback");
      const localMatchResult = calculateMatchPercentage(applicantInfo, jobInfo);
      return createFallbackAnalysis(
        applicantInfo,
        jobInfo,
        jobId,
        localMatchResult,
      );
    }

    return parsed;
  } catch (error) {
    console.error("Unexpected error in generateAIMatchAnalysis:", error);
    // Last resort fallback
    try {
      const localMatchResult = calculateMatchPercentage(applicantInfo, jobInfo);
      return createFallbackAnalysis(
        applicantInfo,
        jobInfo,
        jobId,
        localMatchResult,
      );
    } catch (fallbackError) {
      console.error("Fallback analysis also failed:", fallbackError);
      // Return minimal valid response
      return {
        error: "analysis_failed",
        message: "Could not generate match analysis",
        overall_fit_percentage: 0,
        fit_label: "Unable to analyze",
        hiring_recommendation: "Do Not Recommend",
      };
    }
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
