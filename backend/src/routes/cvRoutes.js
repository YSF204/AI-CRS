import express from "express";
import {
  createCV,
  getMyCVs,
  getCVById,
  updateCV,
  deleteCV,
  analyzeCV,
  analyzeCVFile,
  getCVAnalyses,
  downloadPDF,
  analyzeSection,
  skillGapAnalysis,
} from "../controllers/cvController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";
import { uploadCV } from "../middleware/upload.js";
import { recommendJobs } from "../controllers/matchController.js";

const cvRouter = express.Router();

// All CV routes require authentication + employee role
cvRouter.use(authenticate, isEmployee);

cvRouter.post("/", createCV);
cvRouter.get("/", getMyCVs);
// PDF Upload + Analysis
cvRouter.post("/upload/analyze", uploadCV, analyzeCVFile);

cvRouter.get("/:id", getCVById);
cvRouter.patch("/:id", updateCV);
cvRouter.delete("/:id", deleteCV);

// AI Analysis
cvRouter.post("/:id/analyze", analyzeCV);
cvRouter.get("/:id/analyses", getCVAnalyses);

// PDF Download 
cvRouter.post("/:id/download-pdf", downloadPDF);

// job Reccomendation
cvRouter.post("/:id/recommend-jobs", recommendJobs);

// CV Section Analysis
cvRouter.post("/analyze-section", analyzeSection);

// Skill Gap Analysis
cvRouter.post("/skill-gap", skillGapAnalysis);

export default cvRouter;
