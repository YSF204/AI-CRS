import { getClient, getSystemPromptForSuggestions } from '../integrations/ai/openai.js';

/**
 * Suggestion Service
 * Single responsibility: AI-powered form field suggestions
 * Smart caching to avoid API exhaustion
 * Context-aware suggestions based on user data
 */

// ==========================================
// SUGGESTION CACHE
// ==========================================

// Cache for storing suggestions to avoid repeated API calls
const suggestionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get cached suggestion or fetch new one
 * @param {string} type - Type of suggestion
 * @param {object} context - Context for the suggestion
 * @returns {Promise<string|null>} Suggestion or null
 */
const getCachedOrFetchSuggestion = async (type, context) => {
  const cacheKey = `${type}:${JSON.stringify(context)}`;

  // Check cache
  if (suggestionCache.has(cacheKey)) {
    const cached = suggestionCache.get(cacheKey);
    const isRecent = (Date.now() - cached.timestamp) < CACHE_DURATION;
    if (isRecent) {
      return cached.suggestion;
    }
  }

  try {
    // Fetch new suggestion
    const prompt = buildSuggestionPrompt(type, context);
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getSystemPromptForSuggestions(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100, // Reduce from 150 to 100 for shorter responses
      temperature: 0.5, // Lower from 0.7 to 0.5 for more concise, focused suggestions
    });

    // Clean the response - remove markdown code blocks and extra formatting
    let suggestion = response.choices[0]?.message?.content?.trim() || '';

    // Remove markdown code blocks if present
    suggestion = suggestion.replace(/```json\s*/g, '');
    suggestion = suggestion.replace(/```\s*/g, '');
    suggestion = suggestion.trim();

    // Cache the result
    suggestionCache.set(cacheKey, {
      suggestion,
      timestamp: Date.now(),
    });

    return suggestion || null;
  } catch (error) {
    console.error('Suggestion fetch error:', error);
    return null;
  }
};

/**
 * Build suggestion prompt based on type and context
 * @param {string} type - Type of suggestion
 * @param {object} context - Context data
 * @returns {string} Suggestion prompt
 */
const buildSuggestionPrompt = (type, context) => {
  const { jobTitle, experience, skills, industry = 'general', currentInput, fullName, education, technicalSkills, softSkills, language, contact, address } = context;

  switch (type) {
    case 'jobTitle':
      return `Based on this experience and skills, suggest 3-5 optimized job titles${currentInput ? ` that relate to or complete: "${currentInput}"` : ''}.

Experience: ${JSON.stringify(experience)}
Skills: ${skills.join(', ')}

${currentInput ? `User is typing: "${currentInput}" - provide titles that are related to or complete this input. Start suggestions with "${currentInput}" if possible.` : ''}

IMPORTANT:
- Keep each title under 15 characters
- Use only 2-4 words per title
- NO markdown code blocks - return plain JSON array only
- NO descriptions, just the title strings

Return ONLY a plain JSON array like: ["Senior Developer", "Full Stack Engineer", "Frontend Specialist"]`;

    case 'summary':
      return `Generate a compelling professional summary for this position${currentInput ? ` that continues from: "${currentInput}"` : ''}.

Name: ${fullName || 'Not specified'}
Position: ${jobTitle || 'Not specified'}
Experience: ${JSON.stringify(experience)}
Skills: ${skills?.join(', ') || 'Not specified'}
Education: ${JSON.stringify(education) || 'Not specified'}
Languages: ${language?.join(', ') || 'Not specified'}
Contact: ${contact?.email ? contact.email : 'Not specified'}${contact?.phone ? `, ${contact.phone}` : ''}
Location: ${address?.city ? address.city : 'Not specified'}${address?.street ? `, ${address.street}` : ''}

${currentInput ? `User has started writing: "${currentInput}" - provide a natural continuation that flows seamlessly from this starting point. If the input is a complete thought, provide an alternative version.` : ''}

IMPORTANT:
- Keep each summary under 120 characters (2-3 sentences max)
- NO markdown code blocks - return plain JSON array only
- Use strong action verbs and quantify results where possible
- Be concise and impactful

Return ONLY a plain JSON array like: ["Experienced developer with 3+ years building scalable web applications", "Results-driven professional with proven track record of delivering innovative solutions"]`;

    case 'experience_entry':
      return `Suggest 3-5 bullet points for this experience entry${currentInput ? ` continuing from: "${currentInput}"` : ''}.

Position: ${context.position || 'Not specified'}
Company: ${context.company || 'Not specified'}

${currentInput ? `User is typing: "${currentInput}" - complete this bullet point naturally.` : ''}

IMPORTANT:
- Keep each bullet under 80 characters
- Use strong action verbs (Led, Developed, Implemented)
- Include specific metrics when possible
- NO markdown code blocks - return plain JSON array only
- Focus on achievements and impact

Return ONLY a plain JSON array like: ["Led cross-functional team to deliver key project milestones", "Developed and implemented innovative solutions"]`;

    case 'skills':
      return `Based on this profile and role, suggest 5-8 relevant technical and soft skills${currentInput ? ` that start with or relate to: "${currentInput}"` : ''}.

Position: ${jobTitle || 'Not specified'}
Industry: ${industry}
Current Skills: ${skills?.join(', ') || 'Not specified'}
Experience: ${JSON.stringify(experience)}

${currentInput ? `User is typing a skill: "${currentInput}" - provide skills that start with this prefix or are closely related to it. Prioritize skills starting with "${currentInput}".` : ''}

IMPORTANT:
- Keep each skill under 20 characters
- Use single words or short phrases only
- NO markdown code blocks - return plain JSON array only
- Mix of high-value technical and soft skills
- NO descriptions, just skill names

Return ONLY a plain JSON array like: ["JavaScript", "React", "Python", "Node.js", "TypeScript"]`;

    case 'education':
      return `Suggest honors, awards, or notable achievements for this education entry${currentInput ? ` continuing from: "${currentInput}"` : ''}.

Degree: ${context.certification || 'Not specified'}
Institution: ${context.institution || 'Not specified'}

Focus on:
- GPA (if above 3.5/4.0)
- Dean's List (if applicable)
- Relevant coursework or projects
- Awards or recognition
- Leadership roles
- Research or publications

${currentInput ? `User is typing: "${currentInput}" - complete this naturally.` : ''}

IMPORTANT:
- Keep each point under 60 characters
- NO markdown code blocks - return plain JSON array only
- Return empty array [] if nothing notable

Return ONLY a plain JSON array like: ["Graduated with honors", "Dean's List", "Capstone project: e-commerce platform"] or []`;

    case 'language':
      return `Suggest relevant languages based on this profile${currentInput ? ` that start with or relate to: "${currentInput}"` : ''}.

Position: ${jobTitle || 'Not specified'}
Industry: ${industry}
Current Languages: ${skills?.join(', ') || 'Not specified'}

${currentInput ? `User is typing a language: "${currentInput}" - provide languages that start with this prefix or are closely related to it.` : ''}

IMPORTANT:
- Keep each language under 15 characters
- NO markdown code blocks - return plain JSON array only
- NO descriptions, just language names

Return ONLY a plain JSON array like: ["English", "Spanish", "French", "German", "Mandarin"]`;

    case 'custom_section':
      return `Suggest content for a custom section item${currentInput ? ` continuing from: "${currentInput}"` : ''}.

Section: ${context.sectionTitle || 'Not specified'}
Current content: ${context.currentContent || 'Not specified'}
Position: ${jobTitle || 'Not specified'}

Focus on:
- Specific achievements and impact
- Quantifiable results when possible
- Relevant skills and technologies
- Professional presentation

${currentInput ? `User is typing: "${currentInput}" - complete this naturally in context of the section.` : ''}

IMPORTANT:
- Keep each suggestion under 80 characters
- NO markdown code blocks - return plain JSON array only
- Focus on achievements and impact

Return ONLY a plain JSON array like: ["Delivered high-quality results within tight deadlines", "Demonstrated strong analytical and problem-solving skills"]`;

    default:
      return 'Please provide a helpful suggestion based on context.';
  }
};

// ==========================================
// SUGGESTION TYPES
// ==========================================

/**
 * Get job title suggestions
 * @param {object} context - User context
 * @returns {Promise<Array>} Suggestions
 */
export const getJobTitleSuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestions
  const suggestion = await getCachedOrFetchSuggestion('jobTitle', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        suggestions.push(suggestion);
      }
    } catch {
      // If not JSON, treat as single suggestion
      suggestions.push(suggestion);
    }
  }

  // Add a few variations for more options if needed
  if (suggestions.length < 3) {
    suggestions.push(
      `${context.jobTitle || 'Professional'} ${context.industry || 'Developer'}`,
      `${context.jobTitle || 'Senior'} ${context.industry || 'Engineer'}`
    );
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 5);
};

/**
 * Get summary suggestions
 * @param {object} context - User context
 * @returns {Promise<Array>} Suggestions
 */
export const getSummarySuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestion
  const suggestion = await getCachedOrFetchSuggestion('summary', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        suggestions.push(suggestion);
      }
    } catch {
      // If not JSON, treat as single suggestion
      suggestions.push(suggestion);
    }
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 3);
};

/**
 * Get experience entry suggestions
 * @param {object} context - Entry context
 * @returns {Promise<Array>} Suggestions
 */
export const getExperienceSuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestion
  const suggestion = await getCachedOrFetchSuggestion('experience_entry', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        // Split by newlines if it's a list
        const lines = suggestion.split('\n').filter(line => line.trim());
        suggestions.push(...lines);
      }
    } catch {
      // If not JSON, split by newlines
      const lines = suggestion.split('\n').filter(line => line.trim());
      suggestions.push(...lines);
    }
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 5);
};

/**
 * Get skills suggestions
 * @param {object} context - User context
 * @returns {Promise<Array>} Suggestions
 */
export const getSkillsSuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestion
  const suggestion = await getCachedOrFetchSuggestion('skills', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        // Split by commas if it's a comma-separated list
        const skills = suggestion.split(',').filter(s => s.trim());
        suggestions.push(...skills);
      }
    } catch {
      // If not JSON, split by commas or newlines
      const skills = suggestion.split(/[\n,]/).filter(s => s.trim());
      suggestions.push(...skills);
    }
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 8);
};

/**
 * Get education suggestions
 * @param {object} context - Entry context
 * @returns {Promise<Array>} Suggestions
 */
export const getEducationSuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestion
  const suggestion = await getCachedOrFetchSuggestion('education', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        // Split by newlines if it's a list
        const lines = suggestion.split('\n').filter(line => line.trim());
        suggestions.push(...lines);
      }
    } catch {
      // If not JSON, split by newlines
      const lines = suggestion.split('\n').filter(line => line.trim());
      suggestions.push(...lines);
    }
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 3);
};

/**
 * Get language suggestions
 */
export const getLanguageSuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestion
  const suggestion = await getCachedOrFetchSuggestion('language', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        // Split by commas or newlines
        const langs = suggestion.split(/[\n,]/).filter(s => s.trim());
        suggestions.push(...langs);
      }
    } catch {
      // If not JSON, split by commas or newlines
      const langs = suggestion.split(/[\n,]/).filter(s => s.trim());
      suggestions.push(...langs);
    }
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 5);
};

/**
 * Get custom section suggestions
 */
export const getCustomSectionSuggestions = async (context) => {
  const suggestions = [];

  // Get cached or fetch suggestion
  const suggestion = await getCachedOrFetchSuggestion('custom_section', context);
  if (suggestion) {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(suggestion);
      if (Array.isArray(parsed)) {
        suggestions.push(...parsed);
      } else {
        // Split by newlines
        const lines = suggestion.split('\n').filter(line => line.trim());
        suggestions.push(...lines);
      }
    } catch {
      // If not JSON, split by newlines
      const lines = suggestion.split('\n').filter(line => line.trim());
      suggestions.push(...lines);
    }
  }

  return suggestions.filter(s => s && s.trim()).slice(0, 3);
};

// ==========================================
// CACHE MANAGEMENT
// ==========================================

/**
 * Clear suggestion cache
 * Call this when user data changes significantly
 */
export const clearSuggestionCache = () => {
  suggestionCache.clear();
};

/**
 * Clear expired cache entries
 * Call this periodically to free up memory
 */
export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      suggestionCache.delete(key);
    }
  }
};

/**
 * Clear cache periodically (auto-cleanup)
 * Call this on app initialization
 */
setInterval(clearExpiredCache, 60 * 1000); // Every minute

// ==========================================
// EXPORTS
// ==========================================

export default {
  // Suggestion functions
  getJobTitleSuggestions,
  getSummarySuggestions,
  getExperienceSuggestions,
  getSkillsSuggestions,
  getEducationSuggestions,
  getLanguageSuggestions,
  getCustomSectionSuggestions,

  // Cache management
  clearSuggestionCache,
  clearExpiredCache,
};
