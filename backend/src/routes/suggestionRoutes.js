import express from "express";
import {
  getSummarySuggestions,
  getSingleSummarySuggestion,
  clearSuggestionsCache,
} from "../controllers/suggestionController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";

const router = express.Router();

router.use(authenticate, isEmployee);

router.post('/summary', getSummarySuggestions);

router.post('/summary-single', getSingleSummarySuggestion);
router.post('/clear-cache', clearSuggestionsCache);

export default router;

