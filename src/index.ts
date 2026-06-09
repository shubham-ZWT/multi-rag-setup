import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { globalErrorHandler } from "./middleware/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import botRoutes from "./routes/bot.routes";
import knowledgeRoutes from "./routes/knowledge.routes";
import chatRoutes from "./routes/chat.routes";
import analyticsRoutes from "./routes/analytics.routes";
import widgetRoutes from "./routes/widget";

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Widget static file
app.get("/widget.js", (req, res) => {
  const widgetPath = path.join(process.cwd(), "src", "public", "widget.js");
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile(widgetPath);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/knowledge-sources", knowledgeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/widget", widgetRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
