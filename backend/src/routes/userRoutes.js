import express from "express";
import { getAllUsers } from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/forgotpassword", authController.forgotPassword);
userRouter.patch("/resetpassword/:token", authController.resetPassword);

userRouter.route("/").get(getAllUsers);

export default userRouter;
