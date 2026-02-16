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
} from "../controllers/cvController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";
import { uploadCV } from "../middleware/upload.js";

const cvRouter = express.Router();

// All CV routes require authentication + employee role
cvRouter.use(authenticate, isEmployee);

cvRouter.post("/", createCV);
cvRouter.get("/", getMyCVs);
cvRouter.get("/:id", getCVById);
cvRouter.patch("/:id", updateCV);
cvRouter.delete("/:id", deleteCV);

// AI Analysis
cvRouter.post("/:id/analyze", analyzeCV);
cvRouter.get("/:id/analyses", getCVAnalyses);

// PDF Download (generates on-the-fly)
cvRouter.post("/:id/download-pdf", downloadPDF);

// PDF Upload + Analysis
cvRouter.post("/upload/analyze", uploadCV, analyzeCVFile);

export default cvRouter;
