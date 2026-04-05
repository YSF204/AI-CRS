import express from "express";
import {
  analyzeCv,
  applyForJob,
  getMyApplications,
  getEmployerApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";
import { isEmployer } from "../middleware/roleCheck.js";
import { uploadCV } from "../middleware/upload.js";

const applicationRouter = express.Router();

// All routes require authentication
applicationRouter.use(authenticate);

// Employee routes
applicationRouter.post("/analyze-cv", isEmployee, uploadCV, analyzeCv);
applicationRouter.post("/", isEmployee, applyForJob);
applicationRouter.get("/my-applications", getMyApplications);
applicationRouter.get("/:id", getApplicationById);
applicationRouter.patch("/:id", isEmployee, updateApplication);
applicationRouter.delete("/:id", deleteApplication);

// Employer routes
applicationRouter.get("/employer/all", isEmployer, getEmployerApplications);
applicationRouter.patch("/:id/status", isEmployer, updateApplicationStatus);

export default applicationRouter;
