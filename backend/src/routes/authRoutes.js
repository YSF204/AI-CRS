import express from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { googleAuth, googleRegister } from "../controllers/OauthController.js";
import { authenticate } from "../middleware/Auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", authenticate, updatePassword);

// Google OAuth routes
router.post("/google", googleAuth);
router.post("/google/register", googleRegister);

export default router;