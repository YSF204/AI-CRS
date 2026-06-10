import {
  getSummarySuggestionsRequest,
} from "../services/suggestions/requests/getSummarySuggestionsRequest.js";
import {
  getSingleSummarySuggestionRequest,
} from "../services/suggestions/requests/getSingleSummarySuggestionRequest.js";
import {
  clearSuggestionsCacheRequest,
} from "../services/suggestions/requests/clearSuggestionsCacheRequest.js";
import catchAsync from "../utils/catchAsync.js";

// ==========================================
// SUGGESTION ENDPOINTS
// ==========================================

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
 * Clear suggestion cache
 */
export const clearSuggestionsCache = catchAsync(async (req, res, next) => {
  clearSuggestionsCacheRequest();

  res.status(200).json({
    success: true,
    message: "Suggestion cache cleared",
  });
});

