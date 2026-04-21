import { ethers } from "ethers";

const suspiciousTerms = [
  "urgent",
  "wire transfer",
  "confidential",
  "override",
  "password",
  "delete",
  "invoice mismatch",
  "manual approval",
  "exception"
];

function computeSignals(content) {
  const normalized = content.toLowerCase();

  return suspiciousTerms.filter((term) => normalized.includes(term));
}

function buildSummary(title, content, signals) {
  const preview = content.trim().replace(/\s+/g, " ").slice(0, 180);
  const signalSummary = signals.length
    ? ` Flagged signals: ${signals.join(", ")}.`
    : " No suspicious signal clusters detected.";

  return `${title || "Untitled document"} analyzed.${signalSummary} Preview: ${preview}`;
}

export function analyzeDocument({ title, content, metadataURI }) {
  const trimmedContent = content.trim();
  const signals = computeSignals(trimmedContent);
  const baseScore = Math.min(1500 + trimmedContent.length * 2 + signals.length * 900, 9500);
  const riskScoreBps = Math.min(baseScore, 10000);
  const riskLevel =
    riskScoreBps >= 7000 ? "high" : riskScoreBps >= 4000 ? "medium" : "low";

  const analysis = {
    title: title?.trim() || "Untitled document",
    metadataURI: metadataURI?.trim() || null,
    summary: buildSummary(title, trimmedContent, signals),
    extractedSignals: signals,
    riskScoreBps,
    riskLevel
  };

  const documentHash = ethers.keccak256(ethers.toUtf8Bytes(trimmedContent));
  const reportHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(analysis)));

  return {
    documentHash,
    reportHash,
    analysis
  };
}
