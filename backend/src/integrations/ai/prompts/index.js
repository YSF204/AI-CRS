/**
 * AI Prompts - Centralized Entry Point
 * Single responsibility: Re-export all prompt types from individual modules
 * Provides backward compatibility with existing imports
 */

// Import from individual prompt files
import { SYSTEM_PROMPTS } from "./system-prompts.js";
import { CV_ANALYSIS_PROMPTS } from "./cv-analysis-prompts.js";
import { FORM_SUGGESTION_PROMPTS } from "./form-suggestion-prompts.js";
import { JOB_MATCHING_PROMPTS } from "./job-matching-prompts.js";
import { UTILITY_PROMPTS } from "./utility-prompts.js";
import { ATS_SCORE_PROMPTS } from "./ats-score-prompts.js";

// Named exports for backward compatibility
export {
  SYSTEM_PROMPTS,
  CV_ANALYSIS_PROMPTS,
  FORM_SUGGESTION_PROMPTS,
  JOB_MATCHING_PROMPTS,
  UTILITY_PROMPTS,
  ATS_SCORE_PROMPTS,
};

// Re-export default for backward compatibility
export default {
  SYSTEM_PROMPTS,
  CV_ANALYSIS_PROMPTS,
  FORM_SUGGESTION_PROMPTS,
  JOB_MATCHING_PROMPTS,
  UTILITY_PROMPTS,
  ATS_SCORE_PROMPTS,
};
