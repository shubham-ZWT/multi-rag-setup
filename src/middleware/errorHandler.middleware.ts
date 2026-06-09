import AppError from "../utils/appError";
import { Prisma } from "@prisma/client";

export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {
  console.error(err?.stack || err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Resource already exists" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Resource not found" });
    }
    return res.status(400).json({ error: "Database error" });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.status(500).json({ error: "Internal server error" });
};
