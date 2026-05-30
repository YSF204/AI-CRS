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
import { getAllowedOrigins } from "./src/config/security.js";

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
const allowedOrigins = getAllowedOrigins();

// Render sits behind a proxy, so trust one hop for correct client IPs.
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": ["'self'", ...allowedOrigins],
      },
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"), {
    dotfiles: "ignore",
    fallthrough: false,
    index: false,
  }),
);

// FIX: Default body limit is 1 MB — sufficient for all auth/API payloads.
// The old 50 MB limit on public auth routes was a DoS vector (memory exhaustion).
// CV/file upload routes override this with their own multer limits.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.use(mongoSanitize());
app.use(hpp());

// ── Rate Limiting ──────────────────────────────────────────────────────────
// General API traffic: 500 req / hour
app.use("/api", regularLimiter);

// FIX: Auth endpoints that are brute-force / abuse targets must use the
// strict limiter (50 req/hr) rather than the loose one (500 req/hr).
// Previously login and register were re-applying regularLimiter (no effect),
// and resend-verification + verify-email had NO specific limiter at all.
app.use("/api/auth/login", sensitiveLimiter);
app.use("/api/auth/register", sensitiveLimiter);
app.use("/api/auth/forgotPassword", sensitiveLimiter);
app.use("/api/auth/resend-verification-email", sensitiveLimiter);
app.use("/api/auth/verify-email", sensitiveLimiter);
app.use("/api/auth/google", sensitiveLimiter);
// ──────────────────────────────────────────────────────────────────────────

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
