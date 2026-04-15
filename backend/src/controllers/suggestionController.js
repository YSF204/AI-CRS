import {
  getJobTitleSuggestions as getJobTitleSuggestionsService,
  getSummarySuggestions as getSummarySuggestionsService,
  getExperienceSuggestions,
  getSkillsSuggestions as getSkillsSuggestionsService,
  getEducationSuggestions as getEducationSuggestionsService,
  getLanguageSuggestions as getLanguageSuggestionsService,
  getCustomSectionSuggestions as getCustomSectionSuggestionsService,
  clearSuggestionCache
} from '../services/suggestionService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

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
  const { experience = [], skills = [], industry = 'general', jobTitle = '', currentInput = '' } = req.body;

  const context = {
    jobTitle,
    experience,
    skills,
    industry,
    currentInput
  };

  try {
    const suggestions = await getJobTitleSuggestionsService(context);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate job title suggestions', 500));
  }
});

/**
 * Get professional summary suggestions
 */
export const getSummarySuggestions = catchAsync(async (req, res, next) => {
  const { jobTitle = '', experience = [], skills = [], currentInput = '' } = req.body;

  const context = {
    jobTitle,
    experience,
    skills,
    currentInput
  };

  try {
    const suggestions = await getSummarySuggestionsService(context);

    // Return multiple summary suggestions for auto-triggered behavior
    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate summary suggestions', 500));
  }
});

/**
 * Get single professional summary suggestion (for manual trigger)
 */
export const getSingleSummarySuggestion = catchAsync(async (req, res, next) => {
  const { jobTitle = '', experience = [], skills = [], currentInput = '' } = req.body;

  const context = {
    jobTitle,
    experience,
    skills,
    currentInput
  };

  try {
    const suggestion = await getSummarySuggestionsService(context);

    // Return single summary suggestion for manual trigger
    res.status(200).json({
      success: true,
      data: { suggestion } // Single suggestion
    });
  } catch (error) {
    next(new AppError('Failed to generate single summary suggestion', 500));
  }
});

/**
 * Get experience entry suggestions
 */
export const getExperienceEntrySuggestions = catchAsync(async (req, res, next) => {
  const { position = '', company = '', summary = '', currentInput = '' } = req.body;

  const context = {
    position,
    company,
    summary,
    currentInput
  };

  try {
    const suggestions = await getExperienceSuggestions(context);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate experience suggestions', 500));
  }
});

/**
 * Get skills suggestions based on user profile
 */
export const getSkillsSuggestions = catchAsync(async (req, res, next) => {
  const { jobTitle = '', experience = [], skills = [], industry = 'general', currentInput = '' } = req.body;

  const context = {
    jobTitle,
    experience,
    skills,
    industry,
    currentInput
  };

  try {
    const suggestions = await getSkillsSuggestionsService(context);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate skills suggestions', 500));
  }
});

/**
 * Get education suggestions
 */
export const getEducationSuggestions = catchAsync(async (req, res, next) => {
  const { certification = '', institution = '', summary = '', currentInput = '' } = req.body;

  const context = {
    certification,
    institution,
    summary,
    currentInput
  };

  try {
    const suggestions = await getEducationSuggestionsService(context);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate education suggestions', 201));
  }
});

/**
 * Clear suggestion cache
 */
export const clearSuggestionsCache = catchAsync(async (req, res, next) => {
  try {
    clearSuggestionCache();

    res.status(200).json({
      success: true,
      message: 'Suggestion cache cleared'
    });
  } catch (error) {
    next(new AppError('Failed to clear suggestion cache', 500));
  }
});

/**
 * Get language suggestions
 */
export const getLanguageSuggestions = catchAsync(async (req, res, next) => {
  const { jobTitle = '', industry = 'general', skills = [], currentInput = '' } = req.body;

  const context = {
    jobTitle,
    skills,
    industry,
    currentInput
  };

  try {
    const suggestions = await getLanguageSuggestionsService(context);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate language suggestions', 500));
  }
});

/**
 * Get custom section suggestions
 */
export const getCustomSectionSuggestions = catchAsync(async (req, res, next) => {
  const { sectionTitle = '', currentContent = '', jobTitle = '', currentInput = '' } = req.body;

  const context = {
    sectionTitle,
    currentContent,
    jobTitle,
    currentInput
  };

  try {
    const suggestions = await getCustomSectionSuggestionsService(context);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(new AppError('Failed to generate custom section suggestions', 500));
  }
});
