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
`,

  /**
   * Analyze specific CV section or Full CV
   */
  ANALYZE_SECTION: (section, sectionData) => {
    if (section === "fullCv") {
      return `You are an expert career coach and CV reviewer with deep knowledge of ATS systems and modern hiring standards.

Your task: Analyze the CV data provided below and produce a professional, accurate evaluation with ready-to-apply improvements.

The CV data may contain these fields (some may be missing or empty):
- summary, jobTitle
- contact (email, phone, etc.)
- address
- experience (array of work history items)
- education (array of education items)
- technicalSkills (array)
- softSkills (array)
- language (array)
- customSections

STEP 1 — DETERMINE IF CV IS EMPTY:
A CV is considered EMPTY ONLY if ALL of the following are true at the same time:
- experience array has 0 items (or all items have no position AND no summary)
- education array has 0 items (or all items have no certification AND no institutionName)
- technicalSkills array has fewer than 2 items
- summary is missing OR shorter than 20 characters

If even ONE of these has meaningful content, the CV is NOT empty — proceed with normal analysis.

IF AND ONLY IF ALL FOUR conditions above are true, return EXACTLY this JSON:
{
  "overallScore": 15,
  "isEmpty": true,
  "sections": [
    {
      "name": "Overall CV",
      "status": "Empty",
      "suggestions": [
        "Your CV does not contain enough information to perform a meaningful analysis.",
        "Please add work experience, education, technical skills, and a professional summary."
      ]
    }
  ],
  "generalAdvice": [
    "Add at least one work experience entry with detailed responsibilities.",
    "List your educational background.",
    "Include relevant technical skills.",
    "Write a professional summary."
  ],
  "issues": []
}

STEP 2 — IF NOT EMPTY, perform normal analysis and return:
{
  "overallScore": <number 0-100>,
  "isEmpty": false,
  "sections": [
    {
      "name": "Contact Information",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    {
      "name": "Summary",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["..."]
    },
    {
      "name": "Work Experience",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["..."]
    },
    {
      "name": "Education",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["..."]
    },
    {
      "name": "Technical Skills",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["..."]
    },
    {
      "name": "Soft Skills",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["..."]
    },
    {
      "name": "Languages",
      "status": "Good" | "Needs Attention" | "Empty",
      "suggestions": ["..."]
    }
  ],
  "generalAdvice": [
    "specific advice 1",
    "specific advice 2",
    "specific advice 3"
  ],
  "issues": [
    {
      "fieldId": "summary",
      "originalText": "current summary text",
      "reason": "why this needs improvement (1 sentence)",
      "improvedText": "FULL professional rewrite, ready to replace the original. Be specific, use action verbs, quantify achievements where possible."
    },
    {
      "fieldId": "experience_0_summary",
      "originalText": "current experience description",
      "reason": "why this needs improvement",
      "improvedText": "FULL professional rewrite using STAR method, action verbs, and metrics."
    }
  ]
}

CRITICAL RULES FOR ISSUES:
- Generate "issues" ONLY for fields that genuinely need improvement (weak wording, missing metrics, vague statements).
- The "improvedText" MUST be a COMPLETE, ready-to-paste replacement — not a suggestion or a hint.
- Use professional language with action verbs (Led, Engineered, Optimized, Delivered, Implemented).
- Add quantifiable achievements when context allows (e.g., "increased by 40%", "managed team of 5").
- Maintain the original meaning — don't invent experience the user doesn't have.
- Valid fieldId formats:
  * "summary" for the professional summary
  * "jobTitle" for the job title
  * "experience_0_summary", "experience_1_summary", etc. for experience descriptions
  * "education_0_summary", "education_1_summary", etc. for education descriptions
  * "customSections_0_items_0_description" for custom section items

SCORING GUIDELINES:
- CV with all major sections filled with strong content: 80-95
- CV with most sections filled but could be improved: 65-80
- CV with several sections weak or short: 45-65
- CV with major sections missing: 25-45
- Truly empty CV: 10-20

STATUS RULES:
- "Good" = section has solid, detailed content
- "Needs Attention" = section exists but could be improved
- "Empty" = section is missing or has only placeholder text

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON, no markdown, no code fences, no preamble
- Be honest and constructive — don't be overly negative if the CV has good content
- Don't mark a CV as empty just because one or two sections are weak
- Generate at least 1-3 useful issues with full improvedText for any "Needs Attention" section

CV Data to analyze:
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
  "atsFeedback": "1 sentence summarizing an overall ATS score review.",
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
- Only return issues for fields that actually need improvement.`;
  },
};