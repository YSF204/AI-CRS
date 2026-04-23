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
  ANALYZE_SECTION: (section, sectionData) => `
Please analyze this CV data and identify any poorly written parts.

Data provided as a flattened dictionary (Key = Field ID, Value = Text Content):
${JSON.stringify(sectionData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. DO NOT wrap the response in markdown code blocks (\`\`\`json).
3. DO NOT include any conversational text, preamble, or explanations.
4. Output must start exactly with { and end exactly with }.
5. If the provided data dictionary is completely empty or contains no meaningful text, you MUST return an empty issues array [] and state that there is no text to review. DO NOT fabricate issues for non-existent text.

Return exactly this JSON structure:
{
  "atsScore": 0-100,
  "atsFeedback": "1 sentence summarizing an overall ATS score review",
  "issues": [
    {
      "fieldId": "the exact key from the provided JSON",
      "originalText": "The exact poorly written text snippet",
      "reason": "1 sentence explaining why this is bad",
      "improvedText": "A professional, ready-to-use rewritten version of the text"
    }
  ]
}

Focus strictly on:
- Rewriting informal language into professional terminology
- Enhancing impact and achievements
- Correcting spelling and grammar
- Only return issues for fields that actually need improvement. If the text is good, do not return an issue for it.`,
};
