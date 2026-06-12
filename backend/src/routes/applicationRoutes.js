import express from "express";
import {
  analyzeCv,
  analyzeAtsScore,
  applyForJob,
  getMyApplications,
  getEmployerApplications,
  getApplicationsByJob,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  togglePotential,
  deleteApplication,
} from "../controllers/applicationController.js";
import { streamApplicationCv } from "../controllers/cvProxyController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";
import { isEmployer } from "../middleware/roleCheck.js";
import { uploadCV } from "../middleware/upload.js";

const applicationRouter = express.Router();

// All routes require authentication
applicationRouter.use(authenticate);

// Employee routes
applicationRouter.post("/analyze-cv", isEmployee, uploadCV, analyzeCv);
applicationRouter.post("/analyze-ats", isEmployee, analyzeAtsScore);
applicationRouter.post("/", isEmployee, uploadCV, applyForJob);
applicationRouter.get("/my-applications", getMyApplications);

// Employer routes
applicationRouter.get("/employer/all", isEmployer, getEmployerApplications);
applicationRouter.get("/employer/job/:jobId", isEmployer, getApplicationsByJob);
applicationRouter.patch("/:id/status", isEmployer, updateApplicationStatus);
applicationRouter.patch("/:id/potential", isEmployer, togglePotential);

// Shared routes (after specific prefixes)
applicationRouter.get("/:id", getApplicationById);
applicationRouter.get("/:id/cv", streamApplicationCv);
applicationRouter.patch("/:id", isEmployee, uploadCV, updateApplication);
applicationRouter.delete("/:id", deleteApplication);

export default applicationRouter;
