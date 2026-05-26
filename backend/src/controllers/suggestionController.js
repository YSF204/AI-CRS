import {
  getJobTitleSuggestionsRequest,
} from "../services/suggestions/requests/getJobTitleSuggestionsRequest.js";
import {
  getSummarySuggestionsRequest,
} from "../services/suggestions/requests/getSummarySuggestionsRequest.js";
import {
  getSingleSummarySuggestionRequest,
} from "../services/suggestions/requests/getSingleSummarySuggestionRequest.js";
import {
  getExperienceEntrySuggestionsRequest,
} from "../services/suggestions/requests/getExperienceEntrySuggestionsRequest.js";
import {
  getSkillsSuggestionsRequest,
} from "../services/suggestions/requests/getSkillsSuggestionsRequest.js";
import {
  getEducationSuggestionsRequest,
} from "../services/suggestions/requests/getEducationSuggestionsRequest.js";
import {
  getLanguageSuggestionsRequest,
} from "../services/suggestions/requests/getLanguageSuggestionsRequest.js";
import {
  getCustomSectionSuggestionsRequest,
} from "../services/suggestions/requests/getCustomSectionSuggestionsRequest.js";
import {
  clearSuggestionsCacheRequest,
} from "../services/suggestions/requests/clearSuggestionsCacheRequest.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Suggestion Controller
 * Single responsibility: Handle AI-powered form field suggestions
 * Organized API endpoints for different suggestion types
 */

// ==========================================
// SUGGESTION ENDPOINTS
// ==========================================

/**
 * Get job title suggestions based on user experience and skills
 */
export const getJobTitleSuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getJobTitleSuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

/**
 * Get professional summary suggestions
 */
export const getSummarySuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getSummarySuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

/**
 * Get single professional summary suggestion (for manual trigger)
 */
export const getSingleSummarySuggestion = catchAsync(async (req, res, next) => {
  const suggestion = await getSingleSummarySuggestionRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestion },
  });
});

/**
 * Get experience entry suggestions
 */
export const getExperienceEntrySuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getExperienceEntrySuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

/**
 * Get skills suggestions based on user profile
 */
export const getSkillsSuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getSkillsSuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

/**
 * Get education suggestions
 */
export const getEducationSuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getEducationSuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

/**
 * Clear suggestion cache
 */
export const clearSuggestionsCache = catchAsync(async (req, res, next) => {
  clearSuggestionsCacheRequest();

  res.status(200).json({
    success: true,
    message: "Suggestion cache cleared",
  });
});

/**
 * Get language suggestions
 */
export const getLanguageSuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getLanguageSuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

/**
 * Get custom section suggestions
 */
export const getCustomSectionSuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await getCustomSectionSuggestionsRequest(req.body);

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});
