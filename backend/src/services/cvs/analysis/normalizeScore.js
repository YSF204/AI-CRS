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

  // Normalize custom sections returned by AI
  const customSections = Array.isArray(raw.customSections)
    ? raw.customSections.map((cs) => ({
        title: typeof cs.title === "string" ? cs.title : "",
        type: typeof cs.type === "string" ? cs.type : "other",
        score: clampScore(cs.score),
        strengths: Array.isArray(cs.strengths) ? cs.strengths.slice(0, 5) : [],
        weaknesses: Array.isArray(cs.weaknesses) ? cs.weaknesses.slice(0, 5) : [],
      }))
    : [];

  return {
    overallScore,
    sections: validSections,
    customSections,
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
    issues: normalizeEditorIssues(raw.issues),
  };
}

export function normalizeEditorIssues(rawIssues) {
  const issues = Array.isArray(rawIssues) ? rawIssues : [];
  return issues
    .map(normalizeEditorIssue)
    .filter((issue) => issue.fieldId && (issue.reason || issue.improvedText || issue.originalText));
}

function normalizeEditorIssue(issue) {
  if (!issue || typeof issue !== "object") {
    return { fieldId: null, originalText: "", reason: "", improvedText: "" };
  }

  const fieldId = normalizeFieldId(
    issue.fieldId ??
    issue.fieldID ??
    issue.field_id ??
    issue.field ??
    issue.path ??
    issue.key ??
    issue.fieldKey ??
    issue.fieldName,
  );

  return {
    fieldId,
    originalText: normalizeIssueText(issue.originalText ?? issue.original ?? issue.before ?? ""),
    reason: normalizeIssueText(issue.reason ?? issue.issue ?? issue.problem ?? ""),
    improvedText: normalizeIssueText(issue.improvedText ?? issue.suggestion ?? issue.rewrite ?? issue.after ?? ""),
  };
}

function normalizeIssueText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeFieldId(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Normalize common path formats like experience[0].summary to experience_0_summary
  return trimmed
    .replace(/\[(\d+)\]/g, "_$1")
    .replace(/\./g, "_")
    .replace(/__+/g, "_");
}

function clampScore(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return 0;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export { clampScore };
