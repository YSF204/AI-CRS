import express from "express";
import {
    createEmployer,
    updateEmployer,
    deleteEmployer,
    getMyEmployerProfile,
    getDashboardAnalytics,
} from "../controllers/employerController.js";
import { authenticate } from "../middleware/Auth.js";
import { isEmployer } from "../middleware/roleCheck.js";

const employerRouter = express.Router();

employerRouter.use(authenticate, isEmployer);

employerRouter.post("/", createEmployer);
employerRouter.patch("/", updateEmployer);
employerRouter.delete("/", deleteEmployer);
employerRouter.get("/", getMyEmployerProfile);
employerRouter.get("/analytics", getDashboardAnalytics);

export default employerRouter;