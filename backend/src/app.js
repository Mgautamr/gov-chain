import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { getStatus } from "./controllers/healthController.js";
import { getRecords, storeRecord } from "./controllers/recordController.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { apiRouter } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(
    pinoHttp({
      logger,
      genReqId: () => crypto.randomUUID()
    })
  );

  app.get("/", (_req, res) => {
    res.json({
      service: "gov-chain-backend",
      status: "running"
    });
  });

  app.get("/status", asyncHandler(getStatus));
  app.post("/store", asyncHandler(storeRecord));
  app.get("/records", asyncHandler(getRecords));

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
