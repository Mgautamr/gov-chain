import { z } from "zod";
import { fetchRecords, storeRecordOnChain } from "../services/govChainService.js";

const storeRecordSchema = z.object({
  data: z
    .string()
    .trim()
    .min(1, "data is required.")
    .max(2048, "data must be 2048 characters or fewer.")
});

export async function storeRecord(req, res) {
  const payload = storeRecordSchema.parse(req.body);
  const result = await storeRecordOnChain(payload.data);

  res.status(201).json(result);
}

export async function getRecords(_req, res) {
  const records = await fetchRecords();

  res.json({
    count: records.length,
    records
  });
}
