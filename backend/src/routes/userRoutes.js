import express from "express";
import {
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
} from "../controllers/authController.js";
import { getAllUsers } from "../controllers/userController.js";
import { authenticate } from "../middleware/Auth.js";
import { isAdmin } from "../middleware/roleCheck.js";

const userRouter = express.Router();

userRouter.post("/forgotpassword", forgotPassword);
userRouter.patch("/resetpassword/:token", resetPassword);
userRouter.patch("/updatepassword", authenticate, updatePassword);
userRouter.patch("/updateMe", authenticate, updateMe);

userRouter.get("/", authenticate, isAdmin, getAllUsers);

export default userRouter;
