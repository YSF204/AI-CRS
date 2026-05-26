import express from "express";
import { authenticate } from "../middleware/Auth.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
  getStats,
  getTrends,
  getPendingEmployersList,
  updateUserStatus,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/analyticsController.js";

const adminRouter = express.Router();

// All admin routes require authentication + ADMIN role
adminRouter.use(authenticate, isAdmin);

adminRouter.get("/stats", getStats);
adminRouter.get("/stats/trends", getTrends);
adminRouter.get("/users/pending-employers", getPendingEmployersList);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/:id", getUserById);
adminRouter.post("/users", createUser);
adminRouter.patch("/users/:id", updateUser);
adminRouter.patch("/users/:id/status", updateUserStatus);
adminRouter.delete("/users/:id", deleteUser);

export default adminRouter;
