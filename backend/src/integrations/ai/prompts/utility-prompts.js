export const UTILITY_PROMPTS = {
  /**
   * Extract text from CV for analysis
   */
  EXTRACT_CV_TEXT: (cvData) => `
Extract and format this CV data as plain text for analysis.

CV Data: ${JSON.stringify(cvData)}

Return clean, readable text with clear section headers.
`,

  /**
   * Validate CV completeness
   */
  VALIDATE_CV_COMPLETENESS: (cvData) => `
Check this CV data for completeness and identify missing critical elements.

CV Data: ${JSON.stringify(cvData)}

Return a JSON object:
{
  "isComplete": true/false,
  "completenessScore": 0-100,
  "missingSections": ["section1", "section2"],
  "criticalMissing": ["item1", "item2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Critical elements to check:
- Contact information completeness
- Work experience relevance and detail
- Education details and qualifications
- Skills breadth and relevance
- Professional summary presence
- Overall ATS readiness
`,

  /**
   * Generate CV summary
   */
  GENERATE_CV_SUMMARY: (cvData) => `
Create a concise summary of this CV.

CV Data: ${JSON.stringify(cvData)}

Return a JSON object:
{
  "professionalSummary": "2-3 sentence professional summary",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "experienceHighlights": ["highlight1", "highlight2", "highlight3"],
  "skillsOverview": "brief skills overview",
  "overallRating": "strong / good / needs improvement"
}

Focus on:
- Professional presentation
- Key achievements and impact
- Core competencies
- Marketability
`
};
