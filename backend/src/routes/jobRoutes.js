import express from "express";
import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployer } from "../middleware/roleCheck.js";

const jobRouter = express.Router();

// any one can access
jobRouter.get("/", getAllJobs);

// Employer only !!!
jobRouter.post("/create", authenticate, isEmployer, createJob);
jobRouter.patch("/:id", authenticate, isEmployer, updateJob);
jobRouter.delete("/:id", authenticate, isEmployer, deleteJob);

export default jobRouter;