const SECTION_NAMES = [
  "contactInformation",
  "summary",
  "workExperience",
  "education",
  "skills",
  "certifications",
  "languages",
  "formatting",
  "keywords",
];

export function normalizeATSScore(raw) {
  if (!raw || typeof raw !== "object") {
    return { overallScore: 0, sections: {}, topStrengths: [], topWeaknesses: [], improvementSuggestions: [], summary: "" };
  }

  const sections = raw.sections || {};
  const validSections = {};

  for (const [key, val] of Object.entries(sections)) {
    const score = clampScore(val.score);
    validSections[key] = {
      score,
      strengths: Array.isArray(val.strengths) ? val.strengths.slice(0, 5) : [],
      weaknesses: Array.isArray(val.weaknesses) ? val.weaknesses.slice(0, 5) : [],
    };
  }

  const sectionScores = Object.values(validSections).map((s) => s.score);
  const computedOverall =
    sectionScores.length > 0
      ? Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length)
      : 0;

  const overallScore = clampScore(raw.overallScore ?? computedOverall);

  return {
    overallScore,
    sections: validSections,
    topStrengths: Array.isArray(raw.topStrengths) ? raw.topStrengths.slice(0, 5) : [],
    topWeaknesses: Array.isArray(raw.topWeaknesses) ? raw.topWeaknesses.slice(0, 5) : [],
    improvementSuggestions: Array.isArray(raw.improvementSuggestions) ? raw.improvementSuggestions.slice(0, 10) : [],
    summary: typeof raw.summary === "string" ? raw.summary : "",
  };
}

export function normalizeEditorAnalysis(raw) {
  if (!raw || typeof raw !== "object") {
    return { overallScore: 0, sections: [], generalAdvice: [], issues: [] };
  }

  const sections = Array.isArray(raw.sections) ? raw.sections : [];
  for (const sec of sections) {
    if (sec.score != null) sec.score = clampScore(sec.score);
  }

  return {
    overallScore: clampScore(raw.overallScore ?? 0),
    sections,
    generalAdvice: Array.isArray(raw.generalAdvice) ? raw.generalAdvice : [],
    issues: Array.isArray(raw.issues) ? raw.issues : [],
  };
}

function clampScore(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return 0;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export { clampScore };
