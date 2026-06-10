// Import from individual prompt files
import { SYSTEM_PROMPTS } from "./system-prompts.js";
import { CV_ANALYSIS_PROMPTS } from "./cv-analysis-prompts.js";
import { FORM_SUGGESTION_PROMPTS } from "./form-suggestion-prompts.js";
import { JOB_MATCHING_PROMPTS } from "./job-matching-prompts.js";
import { UTILITY_PROMPTS } from "./utility-prompts.js";
import { ATS_SCORE_PROMPTS } from "./ats-score-prompts.js";
import { SKILL_GAP_PROMPTS } from "./skill-gap-prompts.js";

// Named exports for backward compatibility
export {
  SYSTEM_PROMPTS,
  CV_ANALYSIS_PROMPTS,
  FORM_SUGGESTION_PROMPTS,
  JOB_MATCHING_PROMPTS,
  UTILITY_PROMPTS,
  ATS_SCORE_PROMPTS,
  SKILL_GAP_PROMPTS,
};

// Re-export default for backward compatibility
export default {
  SYSTEM_PROMPTS,
  CV_ANALYSIS_PROMPTS,
  FORM_SUGGESTION_PROMPTS,
  JOB_MATCHING_PROMPTS,
  UTILITY_PROMPTS,
  ATS_SCORE_PROMPTS,
  SKILL_GAP_PROMPTS,
};