import express from "express";
import {
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import {
  updateMe,
  deleteMe,
  confirmDelete,
  uploadProfilePic,
  uploadProfilePicture,
} from "../controllers/userController.js";
import { getAllUsers } from "../controllers/userController.js";
import { authenticate } from "../middleware/Auth.js";
import { isAdmin } from "../middleware/roleCheck.js";

const userRouter = express.Router();

userRouter.post("/forgotpassword", forgotPassword);
userRouter.patch("/resetpassword/:token", resetPassword);
userRouter.patch("/updatepassword", authenticate, updatePassword);
userRouter.patch("/updateMe", authenticate, updateMe);
userRouter.delete("/deleteMe", authenticate, deleteMe);
userRouter.get("/confirmDelete/:token", confirmDelete);
userRouter.post("/profile-picture", authenticate, uploadProfilePic, uploadProfilePicture);

userRouter.get("/", authenticate, isAdmin, getAllUsers);

export default userRouter;
