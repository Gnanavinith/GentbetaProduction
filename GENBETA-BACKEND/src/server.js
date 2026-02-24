console.log("Starting backend server...");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, checkDBHealth, getDBStats } from "./config/db.js";
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
import notificationRoutes from "./routes/notification.routes.js";
import { seedSuperAdmin } from "./utils/seedSuperAdmin.js";

dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://your-frontend.com",
  "https://admin.your-frontend.com",
  "https://login.matapangtech.com",
  "http://login.matapangtech.com",
  "https://product.matapangtech.com",
  "https://admin.matapangtech.com",
  "https://matapang.matapangtech.com",
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

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Detailed health check with dependencies
app.get("/api/health/detailed", async (req, res) => {
  try {
    const dbHealth = await checkDBHealth();
    
    const healthStatus = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      dependencies: {
        database: dbHealth
      },
      system: {
        cpu: process.cpuUsage(),
        pid: process.pid,
        platform: process.platform
      }
    };
    
    res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database statistics endpoint
app.get("/api/stats/database", async (req, res) => {
  try {
    const dbStats = await getDBStats();
    if (dbStats) {
      res.json({
        success: true,
        data: dbStats
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve database statistics'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database statistics error',
      error: error.message
    });
  }
});

// Application metrics
app.get("/api/metrics", (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    },
    versions: process.versions
  };
  
  res.json({
    success: true,
    data: metrics
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
app.use("/api/notifications", notificationRoutes);
await connectDB();
await seedSuperAdmin();

const PORT = process.env.PORT || 5000;
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
