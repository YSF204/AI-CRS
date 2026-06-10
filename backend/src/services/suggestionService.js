import { getClient, getSystemPromptForSuggestions } from '../integrations/ai/openai.js';

// ==========================================
// SUGGESTION CACHE
// ==========================================

// Cache for storing suggestions to avoid repeated API calls
const suggestionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

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
    const response = await getClient().responses.create({
      model: 'gpt-5.4-nano',
      input: [
        {
          role: "system",
          content: getSystemPromptForSuggestions(),
        },
        {
          role: "user",
          content: prompt,
        }
      ],
    });

    // Clean the response - remove markdown code blocks and extra formatting
    let suggestion = response.output_text?.trim() || '';

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

const buildSuggestionPrompt = (type, context) => {
  const { jobTitle, experience, skills, currentInput, fullName, education, language } = context;

  switch (type) {
    case 'summary':
      return `Generate a professional, high-impact summary for a CV that stands out to recruiters. 
Generate 2-3 variations that differ in tone (e.g., one results-driven, one visionary, one technical).

Context:
Name: ${fullName || 'Not specified'}
Target Position: ${jobTitle || 'Not specified'}
Work Experience: ${JSON.stringify(experience)}
Top Skills: ${skills?.join(', ') || 'Not specified'}
Education: ${JSON.stringify(education) || 'Not specified'}
Languages: ${language?.join(', ') || 'Not specified'}

${currentInput ? `The user has already started writing: "${currentInput}". Provide a natural, sophisticated continuation that completes the narrative brilliantly.` : ''}

GUIDELINES:
- Each summary should be 3-5 sentences long.
- Use powerful action verbs and include specific metrics or achievements if found in the experience.
- Focus on the "Unique Selling Proposition" of the candidate.
- NO markdown code blocks - return ONLY a plain JSON array of strings.
- Avoid generic cliches; be specific and professional.

Return ONLY a plain JSON array like: ["Dynamic Software Engineer with 5+ years experience... [3-5 sentences]", "Visionary Technical Lead specializing in... [3-5 sentences]"]`;

    default:
      return 'Please provide a helpful suggestion based on context.';
  }
};

// ==========================================
// SUGGESTION TYPES
// ==========================================

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

// ==========================================
// CACHE MANAGEMENT
// ==========================================

export const clearSuggestionCache = () => {
  suggestionCache.clear();
};

export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      suggestionCache.delete(key);
    }
  }
};

setInterval(clearExpiredCache, 60 * 1000); // Every minute

// ==========================================
// EXPORTS
// ==========================================

export default {
  // Suggestion functions
  getSummarySuggestions,

  // Cache management
  clearSuggestionCache,
  clearExpiredCache,
};

