import { useState } from "react";
import { findDocumentByHash } from "../services/api.js";

function getVerificationState(document) {
  if (!document) {
    return null;
  }

  return document.status === "verified"
    ? { label: "Verified", icon: "✅", tone: "text-emerald-300" }
    : { label: "Not Verified", icon: "❌", tone: "text-rose-300" };
}

function shortenAddress(address) {
  if (!address) {
    return "Unknown";
  }

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function VerificationPage() {
  const [hash, setHash] = useState("");
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();

    if (!hash.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await findDocumentByHash(hash.trim());
      setDocument(result);
    } catch (requestError) {
      setDocument(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const verificationState = getVerificationState(document);

  return (
    <section style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
      <div className="glass-panel" style={{ padding: "28px 30px", animation: "fadeUp 0.5s ease both" }}>
        <div style={{ textAlign: "center" }}>
          <div className="label">Public Verification</div>
          <h2 style={{ marginTop: 12, fontSize: 38, fontWeight: 700, letterSpacing: -1.6, color: "var(--t1)" }}>
            Verify a GovChain document
          </h2>
          <p style={{ margin: "12px auto 0", maxWidth: 760, fontSize: 14, color: "var(--t2)", lineHeight: 1.7 }}>
            Enter a document hash to check its review status and view the associated wallet and
            transaction details.
          </p>
        </div>

        <form style={{ margin: "24px auto 0", maxWidth: 760, display: "flex", gap: 12 }} onSubmit={handleVerify}>
          <input
            className="input-shell"
            style={{ flex: 1 }}
            placeholder="Enter document hash"
            value={hash}
            onChange={(event) => setHash(event.target.value)}
          />
          <button className="btn-primary" style={{ minWidth: 180 }} type="submit" disabled={loading || !hash.trim()}>
            {loading ? "Verifying..." : "Verify Document"}
          </button>
        </form>

        {error ? (
          <div style={{ margin: "18px auto 0", maxWidth: 760, borderRadius: 14, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.08)", padding: "12px 14px", fontSize: 13, color: "var(--red)" }}>
            {error}
          </div>
        ) : null}

        {document ? (
          <div style={{ margin: "26px auto 0", maxWidth: 760, borderRadius: 24, border: "1px solid var(--border)", background: "var(--bg2)", padding: 28 }}>
            <div className={verificationState?.tone ?? "text-slate-200"} style={{ textAlign: "center", fontSize: 44, fontWeight: 700 }}>
              {verificationState?.icon} {verificationState?.label}
            </div>

            <div style={{ marginTop: 26, display: "grid", gap: 14, gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
              <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg3)", padding: 16 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--t3)", fontWeight: 700 }}>File Name</div>
                <div style={{ marginTop: 8, wordBreak: "break-all", fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{document.fileName || "Unknown"}</div>
              </div>
              <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg3)", padding: 16 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--t3)", fontWeight: 700 }}>Status</div>
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "var(--t1)", textTransform: "capitalize" }}>{document.status}</div>
              </div>
              <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg3)", padding: 16, gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--t3)", fontWeight: 700 }}>Wallet Address</div>
                <div style={{ marginTop: 8, wordBreak: "break-all", fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
                  {document.wallet || shortenAddress(document.submitter)}
                </div>
              </div>
              {document.txHash ? (
                <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg3)", padding: 16, gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--t3)", fontWeight: 700 }}>Transaction Hash</div>
                  <a
                    href={`https://etherscan.io/tx/${document.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginTop: 8, display: "block", wordBreak: "break-all", fontSize: 13, fontWeight: 700, color: "var(--purple)", textDecoration: "none" }}
                  >
                    {document.txHash}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
