import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export function errorHandler(error, req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed.",
      issues: error.issues
    });
  }

  const statusCode = error.statusCode || 500;

  logger.error(
    {
      err: error,
      requestId: req.id
    },
    "Request failed"
  );

  return res.status(statusCode).json({
    message: error.message || "Internal server error.",
    details: error.details || null
  });
}
