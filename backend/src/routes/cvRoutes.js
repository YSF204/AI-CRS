import express from "express";
import {
  createCV,
  getMyCVs,
  getCVById,
  updateCV,
  deleteCV,
  analyzeCVFile,
  getCVAnalyses,
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
cvRouter.get("/:id/analyses", getCVAnalyses);

// PDF Upload + Analysis
cvRouter.post("/upload/analyze", uploadCV, analyzeCVFile);

export default cvRouter;
