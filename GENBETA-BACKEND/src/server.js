console.log("Starting backend server...");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import plantRoutes from "./routes/plant.routes.js";
import userRoutes from "./routes/user.routes.js";
import formRoutes from "./routes/form.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import formTaskRoutes from "./routes/formTask.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import templateRoutes from "./routes/template.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import { seedSuperAdmin } from "./utils/seedSuperAdmin.js";

dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://your-frontend.com",
  "https://admin.your-frontend.com",
  "https://login.matapangtech.com",
  "http://login.matapangtech.com",
  "https://product.matapangtech.com",
  "https://admin.matapangtech.com",
  "https://genbeta.matapangtech.com",
];


const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);


// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root route
app.get("/", (req, res) => {
  res.send("Dynamic Form Approval SaaS API is running 🚀");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/company", companyRoutes); // Add singular alias
app.use("/api/plants", plantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/form-task", formTaskRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/approve", approvalRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/subscription", subscriptionRoutes);
await connectDB();
await seedSuperAdmin();

const PORT = process.env.PORT || 5000;
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
