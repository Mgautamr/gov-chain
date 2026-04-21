import { getBlockchainStatus } from "../config/blockchain.js";

export async function getHealth(_req, res) {
  const blockchain = await getBlockchainStatus();

  res.json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    blockchain
  });
}

export async function getStatus(_req, res) {
  const blockchain = await getBlockchainStatus();

  res.json(blockchain);
}
