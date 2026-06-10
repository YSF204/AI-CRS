export const ATS_SCORE_PROMPTS = {
  ANALYZE_ATS_SCORE: (cvData) => `
You are an expert ATS (Applicant Tracking System) judge. Evaluate this CV holistically like a smart recruiter would — reward what IS there, only flag what is genuinely missing or broken.

CV Data:
${JSON.stringify(cvData, null, 2)}

CRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO preamble. Start with { end with }

=== HOW TO SCORE ===
Think like a recruiter scanning this CV for 10 seconds. Score based on how complete and professional it looks.

Give each section a 0-100 score using YOUR best judgment as an ATS expert. Key principles:
- REWARD completeness: filled fields, relevant details, professional language
- REWARD extras: LinkedIn, GitHub, languages, certifications, custom sections with real content
  - PENALIZE only real problems: empty fields, actual typos, missing information, first-person writing
  - DO NOT penalize "could be better" — if text is professional and uses action verbs, that's good enough
  - Custom sections (projects, hobbies, other) can be MORE valuable than standard ones if they add relevant certifications, projects, or achievements
  - Each custom section in the "customSections" array MUST be individually analyzed and scored

Approximate guidelines for each section score:
- 90-100: Complete, professional, rich with relevant details and keywords
- 70-89: Good content, maybe missing one minor thing
- 50-69: Partial — some content but clearly incomplete
- 30-49: Mostly empty or very thin
- 0-29: Empty or has serious problems (typos, unprofessional language)

=== OVERALL SCORE ===
Calculate overallScore as a WEIGHTED average:
- contactInformation: weight 1
- summary: weight 1.5
- workExperience: weight 2
- education: weight 1
- skills: weight 1.5
- certifications: weight 0.5
- languages: weight 0.5
- formatting: weight 1
- keywords: weight 1.5
- Each custom section (projects, hobbies, other): weight 0.5 each (up to 2 points total)
Total base weight = 10. Add 0.5 per custom section (max 4 custom sections counted). Recalculate denominator accordingly. Round to integer.

=== WHAT COUNTS AS A REAL WEAKNESS ===
ONLY include in weaknesses/suggestions things that are OBJECTIVELY missing or wrong:
- Empty or missing fields
- Actual spelling errors, typos, grammar mistakes
- No LinkedIn when the candidate has technical skills
- Experience entries with no description at all
- Using "responsible for" / "helped with" instead of action verbs
- First-person pronouns ("I did", "I am")

DO NOT count as a weakness:
- "Could add more metrics" — not everyone has quantified data
- "Sentence could be shorter" — style preference
- "Could add more keywords" — if keywords already exist
- Rewording professional text that already works fine

=== SUGGESTIONS ===
Each suggestion must be:
1. Specific to a section or field
2. Immediately actionable
3. Something that would actually improve the score if done
4. NOT a rewording of already-professional text

If no genuine improvements are needed, provide fewer suggestions. Quality over quantity.

=== RESPONSE STRUCTURE ===
Return exactly this JSON:
{
  "overallScore": <0-100>,
  "sections": {
    "contactInformation": {
      "score": <0-100>,
      "strengths": ["what's good", "..."],
      "weaknesses": ["what's missing/wrong", "..."]
    },
    "summary": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "workExperience": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "education": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "skills": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "certifications": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "languages": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "formatting": { "score": <0-100>, "strengths": [], "weaknesses": [] },
    "keywords": { "score": <0-100>, "strengths": [], "weaknesses": [] }
  },
  "customSections": [
    {
      "title": "<section title from CV data>",
      "type": "<projects | hobbies | other>",
      "score": <0-100>,
      "strengths": ["what makes this section stand out"],
      "weaknesses": ["what's weak or missing in this section"]
    }
  ],
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "topWeaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improvementSuggestions": ["<suggestion 1>", "..."],
  "summary": "<2-3 sentence overview>"
}

IMPORTANT: If the CV data contains a "customSections" array, you MUST produce one entry per section in the "customSections" response field. If there are no custom sections, return an empty array [].

Provide 3 topStrengths, 3 topWeaknesses, and 5-7 improvementSuggestions (fewer if the CV is already strong).
Each section: 1-3 strengths, 1-3 weaknesses. Use empty arrays if nothing applies.
`,
};
