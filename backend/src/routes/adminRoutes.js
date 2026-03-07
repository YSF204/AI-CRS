import express from "express";
import { authenticate } from "../middleware/Auth.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
    getStats,
    updateUserStatus,
    getAllUsers,
} from "../controllers/analyticsController.js";

const adminRouter = express.Router();

// All admin routes require authentication + ADMIN role
adminRouter.use(authenticate, isAdmin);

adminRouter.get("/stats", getStats);
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/status", updateUserStatus);

export default adminRouter;
