/**
 * CV Analysis Prompts
 * Single responsibility: Prompts for analyzing and improving CVs
 * Handles uploaded CV parsing, database CV analysis, and section-level analysis
 */

export const CV_ANALYSIS_PROMPTS = {
  /**
   * Analyze uploaded CV file
   */
  ANALYZE_UPLOADED_CV: (jobDescription = '') => `
Please analyze this CV content and provide a comprehensive assessment${jobDescription ? ` for a ${jobDescription} position` : ''}.

Return a JSON object with this exact structure:
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
${jobDescription ? `- Comparing with job requirements for: ${jobDescription}` : ''}
`,

  /**
   * Analyze CV from database
   */
  ANALYZE_DATABASE_CV: (jobDescription = '') => `
Please analyze this CV and provide ATS score and improvement suggestions${jobDescription ? ` for a ${jobDescription} position` : ''}.

Return a JSON object:
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

Return ONLY a JSON object exactly matching this structure. Do NOT include markdown blocks:
{
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
- Rewriting informal language into professional terminology.
- Enhancing impact and achievements.
- Correcting spelling and grammar.
- Only return issues for fields that actually need improvement. If the text is good, do not return an issue for it.`
};
