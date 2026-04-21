import { z } from "zod";
import { setUserRegistration } from "../services/govChainService.js";

const registrationSchema = z.object({
  walletAddress: z.string(),
  registered: z.boolean().default(true)
});

export async function updateUserRegistration(req, res) {
  const payload = registrationSchema.parse(req.body);
  const result = await setUserRegistration(payload.walletAddress, payload.registered);

  res.status(201).json(result);
}
