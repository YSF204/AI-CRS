import express from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";
import { clerkAuth, clerkCompleteProfile } from "../controllers/clerkOAuthController.js";
import { authenticate } from "../middleware/Auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", authenticate, updatePassword);

// Email verification routes
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);

// Clerk social sign-in routes. Tokens are verified by the scoped Clerk middleware.
router.post("/clerk", clerkAuth);
router.post("/clerk/complete-profile", clerkCompleteProfile);

export default router;
