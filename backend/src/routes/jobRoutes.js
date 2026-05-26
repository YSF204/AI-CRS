import express from "express";
import {
  getAllJobs,
  getJobById,
  getEmployerJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployer } from "../middleware/roleCheck.js";

const jobRouter = express.Router();

// any one can access
jobRouter.get("/", getAllJobs);
jobRouter.get("/:id", getJobById);

// Employer only !!!
jobRouter.get("/employer/me", authenticate, isEmployer, getEmployerJobs);
jobRouter.post("/create", authenticate, isEmployer, createJob);
jobRouter.patch("/:id", authenticate, isEmployer, updateJob);
jobRouter.delete("/:id", authenticate, isEmployer, deleteJob);

export default jobRouter;