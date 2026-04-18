/**
 * ATS Score Analyzer Prompts
 * Single responsibility: Detailed ATS scoring across multiple dimensions
 * Provides comprehensive feedback on CV optimization for ATS systems
 */

export const ATS_SCORE_PROMPTS = {
  /**
   * Comprehensive ATS score analysis
   */
  ANALYZE_ATS_SCORE: (cvData) => `
You are an ATS (Applicant Tracking System) expert and CV optimization specialist.

Analyze this CV data and provide a comprehensive ATS score report across multiple dimensions.

CV Data:
${JSON.stringify(cvData, null, 2)}

CRITICAL: Return ONLY valid JSON. NO markdown, NO code fences, NO preamble, NO explanation.
Start immediately with { and end with }

Return exactly this JSON structure with ALL fields:
{
  "overallScore": 74,
  "sections": {
    "contactInformation": {
      "score": 90,
      "strengths": ["Clear phone number", "Professional email format"],
      "weaknesses": ["Missing LinkedIn URL"]
    },
    "summary": {
      "score": 65,
      "strengths": ["Concise and professional"],
      "weaknesses": ["Could include more keywords", "Too generic for ATS"]
    },
    "workExperience": {
      "score": 80,
      "strengths": ["Clearly formatted dates", "Uses action verbs"],
      "weaknesses": ["Could quantify achievements more"]
    },
    "education": {
      "score": 70,
      "strengths": ["All institutions named", "Dates provided"],
      "weaknesses": ["Missing GPA information"]
    },
    "skills": {
      "score": 60,
      "strengths": ["Technical skills listed"],
      "weaknesses": ["Could expand skill categories", "Missing soft skills details"]
    },
    "certifications": {
      "score": 50,
      "strengths": ["Certifications included"],
      "weaknesses": ["Missing certification dates or issuing organizations"]
    },
    "languages": {
      "score": 85,
      "strengths": ["Multiple languages listed", "Proficiency levels indicated"],
      "weaknesses": []
    },
    "formatting": {
      "score": 75,
      "strengths": ["Consistent formatting", "Good use of whitespace"],
      "weaknesses": ["Some inconsistent date formats"]
    },
    "keywords": {
      "score": 55,
      "strengths": ["Industry-relevant terms present"],
      "weaknesses": ["Could include more industry keywords", "Missing power words"]
    }
  },
  "topStrengths": [
    "Clear contact information",
    "Well-organized work experience",
    "Multilingual capabilities"
  ],
  "topWeaknesses": [
    "Limited keyword density for ATS",
    "Generic professional summary",
    "Could include more quantified achievements"
  ],
  "improvementSuggestions": [
    "Add LinkedIn profile URL to contact section",
    "Rewrite summary to include 3-5 specific industry keywords",
    "Quantify achievements: use metrics, percentages, and numbers in work experience",
    "Add proficiency levels to skills (Expert, Intermediate, Beginner)",
    "Include certification expiration dates where applicable",
    "Use more action verbs in job descriptions (Led, Implemented, Designed, etc.)",
    "Ensure consistent date formatting throughout (MM/YYYY or Month Year)"
  ],
  "summary": "This CV demonstrates strong structural fundamentals with clear formatting and relevant experience. However, ATS optimization can be improved by increasing keyword density, quantifying achievements with metrics, and expanding the professional summary with industry-specific terminology. The addition of LinkedIn profile information and certification details would further enhance ATS compatibility."
}

Scoring guidelines (0-100):
- Contact Information: Does it have email, phone, location, LinkedIn?
- Summary: Does it contain keywords and professional tone?
- Work Experience: Clear dates? Action verbs? Quantified results?
- Education: Institution, degree, graduation date present?
- Skills: Well-organized? Relevant to industry?
- Certifications: Dates and issuing organizations?
- Languages: Proficiency levels indicated?
- Formatting: Consistent dates, spacing, and structure?
- Keywords: Industry-relevant terms, power words, technical terms?

For each section, provide 2-3 strengths and 1-3 weaknesses specific to ATS parsing.
Overall score is the average of all section scores.
Provide exactly 3 top strengths, 3 top weaknesses, and 7 improvement suggestions.
Summary should be 2-3 sentences explaining overall ATS compatibility and primary optimization areas.
`,
};
