import express from "express";
import {
  getJobTitleSuggestions,
  getSummarySuggestions,
  getExperienceEntrySuggestions,
  getSkillsSuggestions,
  getEducationSuggestions,
  getLanguageSuggestions,
  getCustomSectionSuggestions,
  getSingleSummarySuggestion,
  clearSuggestionsCache,
} from "../controllers/suggestionController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";

const router = express.Router();

// All suggestion routes require authentication and employee role
router.use(authenticate, isEmployee);

/**
 * Get job title suggestions
 * POST /api/suggestions/job-title
 */
router.post('/job-title', getJobTitleSuggestions);

/**
 * Get professional summary suggestions
 * POST /api/suggestions/summary
 */
router.post('/summary', getSummarySuggestions);

/**
 * Get single professional summary suggestion (for manual trigger)
 * POST /api/suggestions/summary-single
 */
router.post('/summary-single', getSingleSummarySuggestion);

/**
 * Get experience entry suggestions
 * POST /api/suggestions/experience
 */
router.post('/experience', getExperienceEntrySuggestions);

/**
 * Get skills suggestions
 * POST /api/suggestions/skills
 */
router.post('/skills', getSkillsSuggestions);

/**
 * Get soft skills suggestions (alias for skills)
 * POST /api/suggestions/soft-skills
 */
router.post('/soft-skills', getSkillsSuggestions);

/**
 * Get education suggestions
 * POST /api/suggestions/education
 */
router.post('/education', getEducationSuggestions);

/**
 * Get language suggestions
 * POST /api/suggestions/languages
 */
router.post('/languages', getLanguageSuggestions);

/**
 * Get custom section suggestions
 * POST /api/suggestions/custom-section
 */
router.post('/custom-section', getCustomSectionSuggestions);

/**
 * Clear suggestion cache
 * POST /api/suggestions/clear-cache
 */
router.post('/clear-cache', clearSuggestionsCache);

export default router;
