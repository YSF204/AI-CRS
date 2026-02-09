import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./src/config/dbConnect.js";
import authRoutes from "./src/routes/authRoutes.js";
import errorHandler from "./src/controllers/errorController.js";
import userRouter from "./src/routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRouter);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
