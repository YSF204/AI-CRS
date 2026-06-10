export const FORM_SUGGESTION_PROMPTS = {
  /**
   * Suggest job title based on experience
   */
  SUGGEST_JOB_TITLE: (experience, skills) => `
Based on user's experience and skills, suggest an optimized job title.

Experience: ${JSON.stringify(experience)}
Skills: ${JSON.stringify(skills)}

Return a JSON object:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "recommended": "best fit job title"
}

Consider:
- Industry-standard terminology
- Experience level alignment
- Skills match and relevance
- Marketability and ATS optimization
`,

  /**
   * Suggest professional summary
   */
  SUGGEST_SUMMARY: (jobTitle, experience, skills) => `
Generate a compelling professional summary based on user's profile.

Job Title: ${jobTitle || 'Not specified'}
Experience: ${JSON.stringify(experience)}
Skills: ${JSON.stringify(skills)}

Return a JSON object:
{
  "suggestions": [
    "Concise 2-3 sentence summary highlighting key achievements",
    "Detailed 3-4 sentence summary covering experience and skills",
    "Impact-focused summary emphasizing results"
  ],
  "recommended": "most effective summary"
}

Keep summaries:
- Professional and polished
- Action-oriented with strong verbs
- Quantified with specific achievements where possible
- Tailored to job title and industry
`,

  /**
   * Suggest experience entry
   */
  SUGGEST_EXPERIENCE: (jobTitle, company) => `
Suggest a well-structured experience entry for this position.

Job Title: ${jobTitle}
Company: ${company}

Return a JSON object:
{
  "position": "optimized position title",
  "summary": "3-5 bullet points highlighting achievements",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Focus on:
- Specific, quantified achievements
- Strong action verbs (Led, Developed, Implemented)
- Measurable results and impact
- Industry-relevant keywords
- ATS-optimized formatting
`,

  /**
   * Suggest skills based on context
   */
  SUGGEST_SKILLS: (jobTitle, experience, industry = 'general') => `
Suggest relevant technical and soft skills for this profile.

Job Title: ${jobTitle}
Experience: ${JSON.stringify(experience)}
Industry: ${industry}

Return a JSON object:
{
  "technicalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "softSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "recommendedCombination": "most effective skill set"
}

Consider:
- Current industry standards
- Experience level alignment
- Complementary skill combinations
- High-value, in-demand skills
- Balance between technical and soft skills
`,

  /**
   * Suggest education entry
   */
  SUGGEST_EDUCATION: (degree, institution) => `
Suggest an optimized education entry.

Degree: ${degree}
Institution: ${institution}

Return a JSON object:
{
  "certification": "optimized degree/certification title",
  "summary": "honors, awards, GPA, achievements (2-3 bullets)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Focus on:
- Professional terminology
- Notable achievements and honors
- Academic performance indicators
- Relevant coursework or projects
- ATS-optimized formatting
`,

  /**
   * Suggest project or custom section item
   */
  SUGGEST_CUSTOM_SECTION_ITEM: (sectionTitle, context) => `
Suggest a compelling entry for "${sectionTitle}" section.

Section: ${sectionTitle}
Context: ${JSON.stringify(context)}

Return a JSON object:
{
  "name": "optimized title/name",
  "description": "2-3 sentences highlighting impact and results",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "achievements": ["achievement1", "achievement2"]
}

Make entries:
- Specific and impactful
- Quantified with metrics where possible
- Action-oriented with strong verbs
- Tailored to section purpose
- Keyword-rich for ATS optimization
`,

  /**
   * Improve existing content
   */
  IMPROVE_CONTENT: (content, contentType, context = '') => `
Review and improve this ${contentType} content.

Content: ${content}
Context: ${context}

Return a JSON object:
{
  "original": "original content",
  "improved": "improved version",
  "changes": ["change1", "change2", "change3"],
  "why": "rationale for improvements"
}

Focus improvements on:
- Clarity and conciseness
- Impact and achievements
- Stronger action verbs
- Better keyword usage
- ATS optimization
- Professional tone
`
};
