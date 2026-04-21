import { ethers } from "ethers";
import { z } from "zod";
import { getReadContract, getWriteContract } from "../config/blockchain.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/apiError.js";

const bytes32Schema = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Expected a bytes32 hex string.");
const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Expected a valid wallet address.");

function ensureReadContract() {
  const contract = getReadContract();

  if (!contract) {
    throw new ApiError(503, "Contract is not configured. Deploy the contract and update backend metadata.");
  }

  return contract;
}

function ensureWriteContract() {
  const contract = getWriteContract();

  if (!contract) {
    throw new ApiError(
      503,
      "Admin signer is not configured. Set a valid PRIVATE_KEY and deployed contract address."
    );
  }

  return contract;
}

function mapDocument(documentHash, record) {
  const statuses = ["pending", "accepted", "rejected"];

  return {
    documentHash,
    submitter: record.submitter,
    createdAt: Number(record.createdAt),
    riskScoreBps: Number(record.riskScoreBps),
    status: statuses[Number(record.status)] ?? "unknown",
    metadataURI: record.metadataURI,
    aiReportHash: record.aiReportHash
  };
}

function mapRecord(record, index) {
  return {
    id: index,
    createdAt: Number(record.createdAt),
    submitter: record.submitter,
    data: record.data
  };
}

export function normalizeDocumentHash(value) {
  return bytes32Schema.parse(value);
}

export function normalizeAddress(value) {
  return ethers.getAddress(addressSchema.parse(value));
}

export async function fetchDocument(documentHash) {
  const normalizedHash = normalizeDocumentHash(documentHash);
  const contract = ensureReadContract();
  const exists = await contract.documentExists(normalizedHash);

  if (!exists) {
    return { exists: false, document: null };
  }

  const record = await contract.getDocument(normalizedHash);

  return {
    exists: true,
    document: mapDocument(normalizedHash, record)
  };
}

export async function setUserRegistration(walletAddress, registered) {
  const contract = ensureWriteContract();
  const normalizedAddress = normalizeAddress(walletAddress);
  const tx = await contract.setUserRegistration(normalizedAddress, registered);

  logger.info(
    {
      txHash: tx.hash,
      walletAddress: normalizedAddress,
      registered
    },
    "Submitting user registration transaction"
  );

  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    walletAddress: normalizedAddress,
    registered
  };
}

export async function storeRecordOnChain(data) {
  const contract = ensureWriteContract();
  const tx = await contract.storeRecord(data);

  logger.info(
    {
      txHash: tx.hash,
      dataLength: data.length
    },
    "Submitting record storage transaction"
  );

  const receipt = await tx.wait();

  logger.info(
    {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    },
    "Record storage transaction confirmed"
  );

  return {
    success: receipt.status === 1,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
}

export async function fetchRecords() {
  const contract = ensureReadContract();
  const records = await contract.getRecords();

  return records.map((record, index) => mapRecord(record, index));
}
