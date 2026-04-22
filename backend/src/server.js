const documents = [];
import { createApp } from "./app.js";
import { getBlockchainStatus } from "./config/blockchain.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "GovChain backend is listening");

  getBlockchainStatus().catch((error) => {
    logger.warn({ err: error }, "Initial blockchain status check failed");
  });
});
// ===== DOCUMENT ROUTES (for frontend) =====

// GET all documents
app.get("/documents", (req, res) => {
  res.json(documents);
});

// Upload document
app.post("/documents/upload", (req, res) => {
  const { fileName, data, wallet } = req.body;

 import crypto from "crypto";
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  const newDoc = {
    id: Date.now(),
    fileName,
    hash,
    wallet,
    status: "pending"
  };

  documents.push(newDoc);

  res.json(newDoc);
});

// Verify document
app.post("/documents/verify", (req, res) => {
  const { id } = req.body;

  const doc = documents.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  doc.status = "verified";

  res.json({ message: "Verified", doc });
});

// Reject document
app.post("/documents/reject", (req, res) => {
  const { id } = req.body;

  const doc = documents.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  doc.status = "rejected";

  res.json({ message: "Rejected", doc });
});