import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { globalErrorHandler } from "./middleware/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import botRoutes from "./routes/bot.routes";
import { verifyToken, authorizeRole } from "./middleware/auth.middleware";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bots", verifyToken, authorizeRole(["user", "admin"]), botRoutes);

//Protected route example
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route" });
});

app.get("/api/admin", verifyToken, authorizeRole(["admin"]), (req, res) => {
  res.json({ message: "This is an admin-only route" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
