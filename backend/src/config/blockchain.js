import { ethers } from "ethers";
import contractMetadata from "../contracts/govChain.json" with { type: "json" };
import { env } from "./env.js";
import { logger } from "./logger.js";

function isHexPrivateKey(value) {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}

function resolveContractAddress() {
  return env.CONTRACT_ADDRESS || contractMetadata.address || "";
}

const provider = new ethers.JsonRpcProvider(env.RPC_URL);
const contractAddress = resolveContractAddress();
const contractAbi = contractMetadata.abi;

let signer = null;

if (isHexPrivateKey(env.PRIVATE_KEY)) {
  signer = new ethers.Wallet(env.PRIVATE_KEY, provider);
} else if (env.PRIVATE_KEY) {
  logger.warn("Ignoring invalid PRIVATE_KEY. Admin blockchain routes will be unavailable.");
}

export function hasSigner() {
  return Boolean(signer);
}

export function hasConfiguredContract() {
  return Boolean(contractAddress) && contractAbi.length > 0;
}

export function getSignerAddress() {
  return signer?.address ?? null;
}

export function getReadContract() {
  if (!hasConfiguredContract()) {
    return null;
  }

  return new ethers.Contract(contractAddress, contractAbi, provider);
}

export function getWriteContract() {
  if (!hasConfiguredContract() || !signer) {
    return null;
  }

  return new ethers.Contract(contractAddress, contractAbi, signer);
}

export async function getBlockchainStatus() {
  try {
    const network = await provider.getNetwork();

    logger.info(
      {
        rpcUrl: env.RPC_URL,
        chainId: Number(network.chainId),
        contractConfigured: hasConfiguredContract(),
        signerConfigured: hasSigner(),
        signerAddress: getSignerAddress(),
        contractAddress: contractAddress || null
      },
      "Blockchain connection verified"
    );

    return {
      rpcConnected: true,
      network: network.name,
      chainId: Number(network.chainId),
      contractConfigured: hasConfiguredContract(),
      signerConfigured: hasSigner(),
      signerAddress: getSignerAddress(),
      contractAddress: contractAddress || null
    };
  } catch (error) {
    logger.warn({ err: error }, "Blockchain provider health check failed");

    return {
      rpcConnected: false,
      network: null,
      chainId: null,
      contractConfigured: hasConfiguredContract(),
      signerConfigured: hasSigner(),
      signerAddress: getSignerAddress(),
      contractAddress: contractAddress || null
    };
  }
}
