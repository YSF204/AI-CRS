import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/dbConnect.js";
import authRoutes from "./src/routes/authRoutes.js";
import errorHandler from "./src/controllers/errorController.js";
import userRouter from "./src/routes/userRoutes.js";
import jobRouter from "./src/routes/jobRoutes.js";
import cvRouter from "./src/routes/cvRoutes.js";
import { regularLimiter, sensitiveLimiter } from "./src/middleware/limiter.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", sensitiveLimiter);
app.use("/api", regularLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/cvs", cvRouter);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
