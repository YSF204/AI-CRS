import express from "express";
import { authenticate } from "../middleware/Auth.js";
import { isEmployee } from "../middleware/roleCheck.js";
import { chat } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.use(authenticate, isEmployee);
chatRouter.post("/", chat);

export default chatRouter;