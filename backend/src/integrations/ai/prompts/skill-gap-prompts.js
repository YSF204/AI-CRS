export const SKILL_GAP_PROMPTS = {
  ANALYZE_SKILL_GAP: ({ cvData, targetRole, additionalInfo }) => {
    const cvText = [
      `Job Title: ${cvData.jobTitle || "N/A"}`,
      `Summary: ${cvData.summary || "N/A"}`,
      `Technical Skills: ${cvData.technicalSkills?.filter(Boolean).join(", ") || "None"}`,
      `Soft Skills: ${cvData.softSkills?.filter(Boolean).join(", ") || "None"}`,
      `Languages: ${cvData.language?.map(l => typeof l === "string" ? l : `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", ") || "None"}`,
      cvData.experience?.length > 0
        ? `Experience:\n${cvData.experience.map((e, i) => `  ${i + 1}. ${e.position || "Untitled"} at ${e.institutionName || "Unknown"} (${e.durationFrom || "?"} - ${e.durationTo || "?"})\n     Summary: ${e.summary || "N/A"}`).join("\n")}`
        : "Experience: None",
      cvData.education?.length > 0
        ? `Education:\n${cvData.education.map((e, i) => `  ${i + 1}. ${e.certification || "Untitled"} at ${e.institutionName || "Unknown"} (${e.durationFrom || "?"} - ${e.durationTo || "?"})`).join("\n")}`
        : "Education: None",
    ].join("\n");

    return `You are a Senior Technical Recruiter and Career Coach specializing in skill gap analysis.

CANDIDATE'S CURRENT CV:
${cvText}

TARGET POSITION: ${targetRole}
${additionalInfo ? `ADDITIONAL CONTEXT FROM CANDIDATE:\n${additionalInfo}` : ""}

Analyze this candidate's CV against the requirements for the target position of "${targetRole}". Identify specific skill gaps, missing qualifications, and areas for improvement.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overallMatch": <number 0-100 representing how well the CV matches the target role>,
  "summary": "<2-3 sentence overview of the candidate's readiness for this role>",
  "sections": [
    {
      "title": "<section name e.g. 'Technical Skills', 'Frameworks & Libraries', 'Soft Skills', 'Experience', 'Education', 'Certifications'>",
      "severity": "<'critical' | 'moderate' | 'good'>",
      "matchPercent": <number 0-100>,
      "details": "<1-2 sentence explanation of the gap or strength>",
      "missingItems": ["<specific missing skill/tool/framework>"],
      "recommendations": ["<specific actionable recommendation>"]
    }
  ],
  "actionPlan": [
    "<numbered specific action steps to close the gaps, ordered by priority>"
  ]
}

Be very specific. Instead of "missing programming languages", say "missing Python, TypeScript". Instead of "missing frameworks", say "missing React, Next.js, Tailwind CSS". If the candidate has relevant skills, acknowledge them and rate that section higher.`;
  },
};
