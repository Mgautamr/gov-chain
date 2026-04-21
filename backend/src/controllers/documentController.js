import { z } from "zod";
import { ethers } from "ethers";
import { analyzeDocument } from "../services/aiAnalysisService.js";
import { fetchDocument, normalizeDocumentHash } from "../services/govChainService.js";
import { getWriteContract } from "../config/blockchain.js";
import ipfs from "../utils/ipfsClient.js";
import { documents } from "../data/documents.js";

const verifySchema = z
  .object({
    documentHash: z.string().optional(),
    content: z.string().optional()
  })
  .refine((value) => value.documentHash || value.content, {
    message: "Provide either documentHash or content."
  });

export async function getDocument(req, res) {
  const documentHash = normalizeDocumentHash(req.params.documentHash);
  const result = await fetchDocument(documentHash);

  res.json(result);
}

export async function verifyDocument(req, res) {
  const payload = verifySchema.parse(req.body);
  const hash = normalizeDocumentHash(
    payload.documentHash || ethers.keccak256(ethers.toUtf8Bytes(payload.content.trim()))
  );
  const contract = getWriteContract();
  const tx = await contract.updateDocumentStatus(hash, 1);
  await tx.wait();
  return res.json({ message: "Document verified", txHash: tx.hash });
}

export const prepareDocument = async (req, res) => {
  const { fileName, data, wallet } = req.body;

  if (!fileName || !data || !wallet) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const hash = crypto.createHash("sha256").update(data).digest("hex");

  const newDoc = {
    id: documents.length,
    fileName,
    hash,
    wallet,
    status: "pending"
  };

  documents.push(newDoc);

  res.status(201).json(newDoc);
};

export const uploadDocument = async (req, res) => {
  if (!req.file || !req.body.wallet) {
    return res.status(400).json({ message: "Missing file or wallet" });
  }

  const fileBuffer = req.file.buffer;
  const result = await ipfs.add(fileBuffer);
  const cid = result.cid.toString();
  const hash = ethers.keccak256(ethers.toUtf8Bytes(cid));

  const newDoc = {
    id: Date.now().toString(),
    fileName: req.file.originalname,
    cid,
    hash,
    wallet: req.body.wallet,
    status: "pending"
  };

  documents.push(newDoc);
  return res.json(newDoc);
};

export const rejectDocument = async (req, res) => {
  const { id } = req.body;

  const doc = documents.find(d => d.id === id);

  if (!doc) {
    return res.status(404).json({ message: "Document not found" });
  }

  doc.status = "rejected";

  res.json({ message: "Document rejected", doc });
};
