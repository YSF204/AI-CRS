import express from "express";
import { findPotintialCandidates } from "../controllers/candidateController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployer } from "../middleware/roleCheck.js";

const CandidatesRouter = express.Router();

CandidatesRouter.use(authenticate, isEmployer);

CandidatesRouter.post("/find", findPotintialCandidates);

export default CandidatesRouter;