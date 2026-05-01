/**
 * CV Analysis Prompts
 * Single responsibility: Prompts for analyzing and improving CVs
 * Handles uploaded CV parsing, database CV analysis, and section-level analysis
 */

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
      "email": "extracted email or empty string"
    },
    "address": {
      "city": "extracted city or empty string",
      "street": "extracted street or empty string"
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
      return `You are a professional CV coach and ATS expert. Analyze the CV data provided and do ALL of the following in one response:

1) Check each standard section — Contact Information, Summary, Work Experience, Education, Technical Skills, Soft Skills, Languages. Also check any custom sections present in the data (e.g. Certifications, Projects, Publications, Volunteer Work, etc.). Flag each section as "Empty", "Needs Attention", or "Good" with specific advice.

2) Calculate an overall completeness score (0–100). Deduct 10–15 points per empty major section. A fully empty CV must score below 20.

3) Identify specific text fields that can be concretely improved. For each, provide a ready-to-use professional rewrite. Use ONLY these exact fieldId formats:
   - "summary" for the professional summary
   - "experience_0_summary", "experience_1_summary" etc. for experience descriptions (0-indexed)
   - "education_0_summary", "education_1_summary" etc. for education descriptions (0-indexed)
   - "customSections_0_items_0_description", "customSections_0_items_1_description" etc. for custom section item descriptions (both indices 0-indexed, first index = which custom section, second = which item within it)

CRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO preamble. Start with { end with }

Return exactly this structure:
{
  "overallScore": <number 0-100>,
  "sections": [
    {
      "name": "Contact Information",
      "status": "Good",
      "suggestions": ["suggestion1"]
    },
    {
      "name": "Summary",
      "status": "Needs Attention",
      "suggestions": ["suggestion1", "suggestion2"]
    },
    {
      "name": "Work Experience",
      "status": "Good",
      "suggestions": []
    },
    {
      "name": "Education",
      "status": "Good",
      "suggestions": []
    },
    {
      "name": "Technical Skills",
      "status": "Empty",
      "suggestions": ["Add relevant technical skills"]
    },
    {
      "name": "Soft Skills",
      "status": "Good",
      "suggestions": []
    },
    {
      "name": "Languages",
      "status": "Good",
      "suggestions": []
    }
  ],
  "generalAdvice": ["overall advice 1", "overall advice 2", "overall advice 3"],
  "issues": [
    {
      "fieldId": "summary",
      "originalText": "current text or empty string if missing",
      "reason": "1 sentence explaining what is weak or missing",
      "improvedText": "polished, professional, ready-to-use rewrite"
    }
  ]
}

Notes:
- Include custom sections in the "sections" array using their actual title as the "name".
- Only add entries to "issues" for fields with improvable or empty text. Skip fields that are already professional and complete.
- For custom section items, use the correct 0-based indices matching the order they appear in the customSections array.

CV Data:
${JSON.stringify(sectionData, null, 2)}`;
    }

    // For individual sections, use the original prompt
    return `
Please analyze this CV data and identify any missing, poorly written, or incomplete parts.

Data provided as a flattened dictionary (Key = Field ID, Value = Text Content):
${JSON.stringify(sectionData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. DO NOT wrap the response in markdown code blocks (\`\`\`json).
3. DO NOT include any conversational text, preamble, or explanations.
4. Output must start exactly with { and end exactly with }.
5. IMPORTANT: If a field is completely empty, missing, or contains no meaningful text, you MUST flag it as an issue. Set the 'reason' to "CRITICAL: This field is empty and must be filled out for a complete CV." and provide a placeholder or suggestion in 'improvedText'. DO NOT say "Great job" or return an empty issues array for empty fields.

Return exactly this JSON structure:
{
  "atsScore": 0-100,
  "atsFeedback": "1 sentence summarizing an overall ATS score review. If fields are empty, give a low score.",
  "issues": [
    {
      "fieldId": "the exact key from the provided JSON",
      "originalText": "The exact poorly written text snippet, or an empty string if missing",
      "reason": "1 sentence explaining why this is bad or missing",
      "improvedText": "A professional, ready-to-use rewritten version of the text or a strong suggestion"
    }
  ]
}

Focus strictly on:
- Flagging empty or missing fields as CRITICAL issues.
- Rewriting informal language into professional terminology.
- Enhancing impact and achievements.
- Correcting spelling and grammar.
- Only return issues for fields that actually need improvement or are missing. If the text is professional and complete, do not return an issue for it.`;
  },
};
