export const CV_ANALYSIS_PROMPTS = {
  /**
   * Analyze uploaded CV file
   */
  ANALYZE_UPLOADED_CV: (jobDescription = "") => `
You are an expert ATS (Applicant Tracking System) and recruitment analyst.

Analyze this CV content and provide a comprehensive assessment${jobDescription ? ` for a ${jobDescription} position` : ""}.

CRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO preamble, NO explanation.
Start immediately with { and end with }

Return exactly this JSON structure:
{
  "cvData": {
    "jobTitle": "extracted or inferred job title",
    "summary": "extracted or suggested professional summary",
    "contact": {
      "phone": "extracted phone or empty string",
      "email": "extracted email or empty string",
      "linkedin": "extracted LinkedIn URL or empty string",
      "github": "extracted GitHub URL or empty string"
    },
    "address": {
      "city": "extracted city or empty string",
      "country": "extracted country or empty string"
    },
    "experience": [
      {
        "institutionName": "company name",
        "position": "job title",
        "durationFrom": "start date or empty",
        "durationTo": "end date or empty",
        "summary": "responsibilities and achievements"
      }
    ],
    "education": [
      {
        "institutionName": "school/university name",
        "certification": "degree/certification",
        "durationFrom": "start date or empty",
        "durationTo": "end date or empty",
        "summary": "honors, GPA, or relevant details"
      }
    ],
    "technicalSkills": ["skill1", "skill2", "skill3"],
    "softSkills": ["skill1", "skill2", "skill3"],
    "language": ["language1", "language2"],
    "certifications": ["cert1", "cert2"]
  },
  "analysis": {
    "score": 0-100,
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
  }
}

Focus on:
- Extracting accurate contact information
- Identifying job titles and companies
- Understanding education details
- Recognizing technical and soft skills
- Noticing certifications and achievements
${jobDescription ? `- Comparing with job requirements for: ${jobDescription}` : ""}
`,

  /**
   * Analyze CV from database
   */
  ANALYZE_DATABASE_CV: (jobDescription = "") => `
You are an expert ATS analyst.

Analyze this CV and provide ATS score and improvement suggestions${jobDescription ? ` for a ${jobDescription} position` : ""}.

CRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO preamble.

Return exactly this JSON structure:
{
  "analysis": {
    "score": 0-100,
    "strengths": ["3-5 key strengths"],
    "weaknesses": ["3-5 areas needing improvement"],
    "suggestions": ["3-5 specific, actionable improvements"]
  }
}

Scoring Criteria:
- Keywords match with job requirements
- Formatting and structure
- Content quality and impact
- Skills alignment
- Overall ATS compatibility
`,

  /**
   * Analyze specific CV section or Full CV
   */
  ANALYZE_SECTION: (section, sectionData) => {
    if (section === "fullCv") {
      return `You are an expert ATS judge. Evaluate this CV holistically — reward what IS there, only flag what is genuinely missing or broken.

CV Data:
${JSON.stringify(sectionData, null, 2)}

=== FIELD MAPPING ===
- "fullName", "jobTitle": identity fields
- "summary": professional summary paragraph
- "contact": { phone, email, linkedin, github }
- "address": { city, country }
- "experience[]": { position, institutionName, durationFrom, durationTo, summary }
- "education[]": { institutionName, certification, durationFrom, durationTo, summary }
- "technicalSkills": string array
- "softSkills": string array
- "language": array of strings or objects
- "customSections[]": { title, sectionType, items[{name, description}] }

=== HOW TO SCORE (0-100) ===
Think like a recruiter scanning this CV for 10 seconds. How complete and professional does it look?

Key principles:
- REWARD completeness: filled fields, relevant details, professional language, action verbs
- REWARD extras: LinkedIn, GitHub, languages, certifications, custom sections with real content
- Custom sections can be MORE valuable than standard ones if they add relevant projects, certifications, or achievements
- PENALIZE only real problems: empty fields, actual typos, missing information, first-person writing, passive/weak verbs
- DO NOT penalize "could be better" — if text is professional and uses action verbs, that's good enough
- More content and more completeness = higher score. Always.

Score guidelines:
- 90-100: Complete CV with rich details, multiple experiences, strong skills, extras like LinkedIn/languages/custom sections
- 75-89: Good CV, well-filled, maybe missing one minor thing
- 60-74: Decent start, some sections clearly filled but others empty or thin
- 40-59: Partial CV, several sections empty or very thin
- 20-39: Mostly empty, just basic info
- 0-19: Nearly blank CV

=== WHAT TO FLAG AS AN ISSUE ===
ONLY create issues for these REAL problems:
1. EMPTY fields that should have content (no summary, no experience, no education, no skills)
2. ACTUAL typos or misspelled words (real spelling errors, not style preferences)
3. GRAMMAR errors (wrong tense, subject-verb disagreement, missing words)
4. First-person writing ("I am", "I have", "I did")
5. Weak passive verbs ("responsible for", "helped with", "was involved in") that should be action verbs
6. Clearly incomplete entries (experience with position but no summary at all)

DO NOT flag for:
- "Could add more metrics/quantification" — not everyone has quantified data
- "Sentence is too long" or "could be more concise" — style preferences
- "Could include more keywords" — if keywords are already present, don't ask for more
- Minor rephrasing of already-professional text
- Any text that already uses action verbs and professional language

If the text is professional, uses action verbs, and has no errors, LEAVE IT ALONE.
An EMPTY issues array is perfectly fine and expected for a well-written CV.

=== FIELD ID FORMATS FOR ISSUES ===
- "summary" for professional summary
- "experience_0_summary", "experience_1_summary" etc (0-indexed)
- "experience_0" to DELETE entire entry (set improvedText to "")
- "education_0_summary", "education_1_summary" etc
- "education_0" to DELETE entire entry (set improvedText to "")
- "customSections_0_items_0_description" etc for custom section items
- "customSections_0_items_0" to DELETE entire item
- "technicalSkills_0", "softSkills_0", "language_0" to DELETE items

=== OUTPUT (JSON only, no markdown) ===
{
  "overallScore": <0-100 based on your holistic judgment>,
  "sections": [
    { "name": "Contact Information", "status": "Good|Needs Attention|Empty", "suggestions": [] },
    { "name": "Summary", "status": "...", "suggestions": [] },
    { "name": "Work Experience", "status": "...", "suggestions": [] },
    { "name": "Education", "status": "...", "suggestions": [] },
    { "name": "Technical Skills", "status": "...", "suggestions": [] },
    { "name": "Soft Skills", "status": "...", "suggestions": [] },
    { "name": "Languages", "status": "...", "suggestions": [] }
  ],
  "generalAdvice": [],
  "issues": []
}

RULES:
- sections array MUST always have all 7 entries above plus one for each customSection
- suggestions in each section: only add if status is not "Good"
- generalAdvice: max 3 items, only actionable advice for things NOT already done
- issues: ONLY real problems from the list above. Empty array is OK and common for good CVs.
- More content = higher score. Always.`;
    }

    return `You are an expert ATS judge. Analyze this CV section data and flag ONLY genuine problems.

Data (Key = Field ID, Value = Text Content):
${JSON.stringify(sectionData, null, 2)}

Return ONLY valid JSON. No markdown, no code fences, no preamble. Start with { end with }

=== WHAT TO FLAG ===
ONLY flag fields that have REAL objective problems:
1. EMPTY or missing text that should have content
2. ACTUAL typos, misspellings, grammar errors
3. First-person writing ("I am", "I have", "I did")
4. Weak passive verbs ("responsible for", "helped with") that should be action verbs
5. Clearly incomplete entries

DO NOT flag:
- Professional text that already uses action verbs — leave it alone
- Style preferences ("could be more concise", "could add metrics")
- Rewording already-good text

If all fields are well-written, return an empty issues array. That's perfectly fine.

=== SCORING ===
Score 0-100 based on how complete and professional the content is:
- 90-100: Complete, professional, rich with detail
- 70-89: Good content, maybe one minor gap
- 50-69: Partial, clearly missing some content
- Below 50: Mostly empty or has real problems

Return exactly:
{
  "atsScore": 0-100,
  "atsFeedback": "1 sentence summary",
  "issues": [
    {
      "fieldId": "exact key from the data",
      "originalText": "the problematic text, or empty string if missing",
      "reason": "why this is a problem",
      "improvedText": "professional replacement"
    }
  ]
}`;
  },
};
