import express from "express";
import { findPotintialCandidates, getEmployerSearchHistory, aiShortlist } from "../controllers/candidateController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployer } from "../middleware/roleCheck.js";

const CandidatesRouter = express.Router();

CandidatesRouter.use(authenticate, isEmployer);

CandidatesRouter.post("/find", findPotintialCandidates);
CandidatesRouter.post("/ai-shortlist", aiShortlist);
CandidatesRouter.get("/history", getEmployerSearchHistory);

export default CandidatesRouter;