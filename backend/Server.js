import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./src/config/dbConnect.js";
import { initRedis } from "./src/config/redis.js";

const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
  dotenv.config({ path: rootEnvPath });
}

import authRoutes from "./src/routes/authRoutes.js";
import errorHandler from "./src/controllers/errorController.js";
import userRouter from "./src/routes/userRoutes.js";
import jobRouter from "./src/routes/jobRoutes.js";
import cvRouter from "./src/routes/cvRoutes.js";
import candidatesRouter from "./src/routes/PotentialCandedatesRoutes.js";
import { regularLimiter, sensitiveLimiter } from "./src/middleware/limiter.js";
import employerRouter from "./src/routes/employerRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
import applicationRouter from "./src/routes/applicationRoutes.js";
import chatRouter from "./src/routes/chatRoutes.js";
import suggestionRouter from "./src/routes/suggestionRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": [
          "'self'",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ],
      },
    },
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(mongoSanitize());
app.use(hpp());


app.use("/api", regularLimiter);
app.use("/api/auth/login", regularLimiter);
app.use("/api/auth/register", regularLimiter);
app.use("/api/auth/forgotPassword", regularLimiter);
app.use("/api/auth/google", sensitiveLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/cvs", cvRouter);
app.use("/api/employers", employerRouter);
app.use("/api/candidates", candidatesRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/suggestions", suggestionRouter);

app.use(errorHandler);

const uploadDir = path.join(process.cwd(), "src", "uploads", "profile");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const startServer = async () => {
  await connectDB();
  await initRedis();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();