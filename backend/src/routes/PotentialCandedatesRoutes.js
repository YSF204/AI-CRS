import express from "express";
import { findPotintialCandidates, getEmployerSearchHistory } from "../controllers/candidateController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployer } from "../middleware/roleCheck.js";

const CandidatesRouter = express.Router();

CandidatesRouter.use(authenticate, isEmployer);

CandidatesRouter.post("/find", findPotintialCandidates);
CandidatesRouter.get("/history", getEmployerSearchHistory);

export default CandidatesRouter;