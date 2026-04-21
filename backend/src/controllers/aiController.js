import { z } from "zod";
import { analyzeDocument } from "../services/aiAnalysisService.js";

const analyzeSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(20, "Document content must be at least 20 characters."),
  metadataURI: z.string().min(1).max(2048).optional()
});

export function analyze(req, res) {
  const payload = analyzeSchema.parse(req.body);
  const result = analyzeDocument(payload);

  res.json(result);
}
