import express from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/Auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;