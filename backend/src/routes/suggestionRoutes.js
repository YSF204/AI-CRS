import express from "express";
import {
  getSummarySuggestions,
  getSingleSummarySuggestion,
  clearSuggestionsCache,
} from "../controllers/suggestionController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";

const router = express.Router();

// All suggestion routes require authentication and employee role
router.use(authenticate, isEmployee);

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
 * Clear suggestion cache
 * POST /api/suggestions/clear-cache
 */
router.post('/clear-cache', clearSuggestionsCache);

export default router;

