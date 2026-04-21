import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),

  RPC_URL: z.string().url().default("http://127.0.0.1:8545"),

  PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid private key")
    .optional(),

  CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .optional(),

  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

console.log("🌍 Environment Loaded:", {
  PORT: env.PORT,
  RPC_URL: env.RPC_URL,
  CONTRACT_ADDRESS: env.CONTRACT_ADDRESS ? "✅ Set" : "❌ Missing",
  PRIVATE_KEY: env.PRIVATE_KEY ? "✅ Set" : "❌ Missing"
});
