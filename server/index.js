
import express from "express";

// const app = express();
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
dotenv.config({ quiet: true });
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();
const normalizeEnvValue = (value) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const requiredEnvKeys = [
  "MONGODB_URL",
  "JWT_SECRET",
  "OPENROUTER_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const validateEnvironment = () => {
  const missingKeys = requiredEnvKeys.filter(
    (key) => !normalizeEnvValue(process.env[key]),
  );

  if (missingKeys.length > 0) {
    console.error(
      `Missing required environment variables: ${missingKeys.join(", ")}`,
    );
    console.error(
      "Set these in Render Dashboard -> Service -> Environment, then redeploy.",
    );
    process.exit(1);
  }

  const normalizedMongoUrl = normalizeEnvValue(process.env.MONGODB_URL);
  if (
    !(
      normalizedMongoUrl.startsWith("mongodb://") ||
      normalizedMongoUrl.startsWith("mongodb+srv://")
    )
  ) {
    console.error(
      "Invalid MONGODB_URL format. It must start with mongodb:// or mongodb+srv://",
    );
    process.exit(1);
  }

  const normalizedJwtSecret = normalizeEnvValue(process.env.JWT_SECRET);
  if (
    normalizedJwtSecret === "replace_with_a_strong_random_secret" ||
    normalizedJwtSecret === "replace_with_strong_random_secret"
  ) {
    console.warn(
      "Warning: JWT_SECRET is still a placeholder. Replace it in production.",
    );
  }

  if (process.env.RENDER && !process.env.CLIENT_URL) {
    console.warn(
      "Warning: CLIENT_URL is not set. Cross-site auth/CORS may fail from frontend.",
    );
  }
};

validateEnvironment();

const configuredClientOrigins = [
  normalizeEnvValue(process.env.CLIENT_URL),
  ...normalizeEnvValue(process.env.CLIENT_URLS)
    .split(",")
    .map((origin) => normalizeEnvValue(origin))
    .filter(Boolean),
];

const allowedOrigins = [
  ...configuredClientOrigins,
  "https://ai-interview-server-chi.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      console.log("Incoming Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      const isLocalhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
        origin || "",
      );

      // Allow non-browser clients (Render health checks, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost and production frontend
      if (allowedOrigins.includes(origin) || isLocalhostOrigin) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Interview backend is running",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

const PORT = process.env.PORT || 6000;

const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
