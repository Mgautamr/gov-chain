import { Fragment, useEffect, useMemo, useState } from "react";
import { verifyDocument } from "../services/api.js";
import { Toast } from "./Toast.jsx";

const badgeConfig = {
  pending: { cls: "b-pending", label: "Pending" },
  verified: { cls: "b-verified", label: "Verified" },
  rejected: { cls: "b-rejected", label: "Rejected" }
};

function StatusBadge({ status }) {
  const config = badgeConfig[status] || badgeConfig.pending;

  return (
    <span className={`badge ${config.cls}`} style={{ animation: "badgePop 0.3s cubic-bezier(.22,.68,0,1.4) both" }}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
}

function shorten(value) {
  if (!value) {
    return "Unknown";
  }

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function formatTimestamp(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
}

function AnalyticsCard({ label, value, tone, statId, barId, delay }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 18px 14px",
        transition: "border-color 0.25s,background 0.2s,transform 0.2s",
        cursor: "default",
        animation: `fadeUp 0.5s ${delay}s ease both`
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-2px)";
        event.currentTarget.style.borderColor = "rgba(0,212,255,0.25)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "none";
        event.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--t3)", fontWeight: 700, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.5, color: tone }} id={statId}>
        0
      </div>
      <div style={{ height: 1, background: "var(--border)", borderRadius: 1, marginTop: 14, overflow: "hidden" }}>
        <div
          id={barId}
          style={{
            height: "100%",
            background: tone,
            width: "0%",
            transition: "width 1s cubic-bezier(.22,.68,0,1)",
            borderRadius: 1
          }}
        />
      </div>
    </div>
  );
}

function countUp(id, target) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  let n = 0;
  element.textContent = "0";

  const interval = setInterval(() => {
    n = Math.min(n + 1, target);
    element.textContent = String(n);
    if (n >= target) {
      clearInterval(interval);
    }
  }, 40);
}

export function DocumentsPanel({
  documents,
  loading,
  error,
  onRefresh,
  onReject,
  actionLoadingId
}) {
  const [txHashes, setTxHashes] = useState({});
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [toast, setToast] = useState(null);

  const analytics = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter((document) => document.status === "verified").length;
    const pending = documents.filter((document) => document.status === "pending").length;
    const rejected = documents.filter((document) => document.status === "rejected").length;

    return { total, verified, pending, rejected };
  }, [documents]);

  useEffect(() => {
    countUp("stat-total", analytics.total);
    countUp("stat-verified", analytics.verified);
    countUp("stat-pending", analytics.pending);
    countUp("stat-rejected", analytics.rejected);

    setTimeout(() => {
      const totalBase = analytics.total || 1;
      const verifiedBar = document.getElementById("bar-verified");
      const pendingBar = document.getElementById("bar-pending");
      const rejectedBar = document.getElementById("bar-rejected");
      const totalBar = document.getElementById("bar-total");

      if (totalBar) totalBar.style.width = "100%";
      if (verifiedBar) verifiedBar.style.width = `${Math.round((analytics.verified / totalBase) * 100)}%`;
      if (pendingBar) pendingBar.style.width = `${Math.round((analytics.pending / totalBase) * 100)}%`;
      if (rejectedBar) rejectedBar.style.width = `${Math.round((analytics.rejected / totalBase) * 100)}%`;
    }, 200);
  }, [analytics]);

  async function handleVerify(id) {
    setVerifyingId(id);

    try {
      const response = await verifyDocument(id);
      const txHash = response?.data?.txHash || response?.txHash;

      if (txHash) {
        setTxHashes((current) => ({
          ...current,
          [id]: txHash
        }));
        setToast({
          type: "verify",
          title: "Verified on Blockchain",
          msg: `Tx: ${txHash.slice(0, 12)}...`
        });
      }

      await onRefresh();
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleReject(id) {
    setRejectingId(id);

    try {
      await onReject(id);
      setToast({
        type: "reject",
        title: "Document Rejected",
        msg: "Status updated"
      });
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <section className="glass-panel" style={{ padding: 22, animation: "fadeUp 0.5s 0.22s ease both" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 }}>
        <div className="label">Admin Review</div>
        <h2 className="panel-title" style={{ marginTop: 4 }}>Document management dashboard</h2>
        <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, maxWidth: 780 }}>
          Premium review surface for on-chain verification, IPFS-backed files, and full audit visibility.
        </p>
      </div>

      {error ? (
        <div style={{ borderRadius: 12, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.08)", padding: "12px 14px", fontSize: 13, color: "var(--red)", marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 }}>
        <AnalyticsCard label="Total Documents" value={analytics.total} tone="var(--cyan)" statId="stat-total" barId="bar-total" delay={0.1} />
        <AnalyticsCard label="Verified" value={analytics.verified} tone="var(--green)" statId="stat-verified" barId="bar-verified" delay={0.16} />
        <AnalyticsCard label="Pending" value={analytics.pending} tone="var(--amber)" statId="stat-pending" barId="bar-pending" delay={0.22} />
        <AnalyticsCard label="Rejected" value={analytics.rejected} tone="var(--red)" statId="stat-rejected" barId="bar-rejected" delay={0.28} />
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "var(--bg2)"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: "100%", textAlign: "left", fontSize: 13, borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--bg3)", color: "var(--t2)" }}>
              <tr>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>ID</th>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>Document</th>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>Hash</th>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>Wallet</th>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>Proof</th>
                <th style={{ padding: "14px 16px", fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td style={{ padding: "24px 16px", color: "var(--t2)" }} colSpan="7">
                    Loading documents...
                  </td>
                </tr>
              ) : null}

              {!loading && documents.length === 0 ? (
                <tr>
                  <td style={{ padding: "24px 16px", color: "var(--t2)" }} colSpan="7">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? documents.map((document, index) => {
                    const disabled =
                      actionLoadingId === document.id ||
                      verifyingId === document.id ||
                      rejectingId === document.id;
                    const txHash = txHashes[document.id] || document.txHash;

                    return (
                      <Fragment key={document.id}>
                        <tr key={document.id} style={{ animationDelay: `${index * 0.055}s` }} className="doc-row">
                          <td style={{ padding: "16px", color: "var(--cyan)", fontFamily: "monospace" }}>{document.id}</td>
                          <td style={{ padding: "16px", color: "var(--t1)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <span style={{ fontWeight: 700 }}>{document.fileName}</span>
                              {document.cid ? (
                                <a
                                  href={`https://ipfs.io/ipfs/${document.cid}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: "inline-block",
                                    width: "fit-content",
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    color: "var(--cyan)",
                                    background: "rgba(0,212,255,0.06)",
                                    border: "1px solid rgba(0,212,255,0.15)",
                                    padding: "3px 8px",
                                    borderRadius: 5,
                                    textDecoration: "none"
                                  }}
                                >
                                  IPFS {document.cid.slice(0, 10)}…{document.cid.slice(-6)}
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td style={{ padding: "16px", color: "var(--t2)", fontFamily: "monospace" }}>{shorten(document.hash)}</td>
                          <td style={{ padding: "16px", color: "var(--t2)", fontFamily: "monospace" }}>{shorten(document.wallet)}</td>
                          <td style={{ padding: "16px" }}>
                            <StatusBadge status={document.status} />
                          </td>
                          <td style={{ padding: "16px" }}>
                            {txHash ? (
                              <a
                                href={`https://etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 11,
                                  color: "rgba(139,92,246,0.9)",
                                  background: "rgba(139,92,246,0.07)",
                                  border: "1px solid rgba(139,92,246,0.15)",
                                  padding: "3px 8px",
                                  borderRadius: 5,
                                  textDecoration: "none",
                                  display: "inline-block",
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(event) => {
                                  event.currentTarget.style.background = "rgba(139,92,246,0.14)";
                                  event.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                                }}
                                onMouseLeave={(event) => {
                                  event.currentTarget.style.background = "rgba(139,92,246,0.07)";
                                  event.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
                                }}
                                title={txHash}
                              >
                                {txHash.slice(0, 10)}…{txHash.slice(-6)}
                              </a>
                            ) : (
                              <span style={{ color: "var(--t4)" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={() => handleVerify(document.id)}
                                disabled={disabled || document.status === "verified"}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  background: "rgba(34,197,94,0.08)",
                                  color: "#22c55e",
                                  border: "1px solid rgba(34,197,94,0.18)",
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(event) => {
                                  event.currentTarget.style.background = "rgba(34,197,94,0.16)";
                                  event.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(event) => {
                                  event.currentTarget.style.background = "rgba(34,197,94,0.08)";
                                  event.currentTarget.style.transform = "none";
                                }}
                              >
                                {disabled && verifyingId === document.id ? "Working..." : "Verify"}
                              </button>
                              <button
                                onClick={() => handleReject(document.id)}
                                disabled={disabled || document.status === "rejected"}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  background: "rgba(239,68,68,0.06)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239,68,68,0.16)",
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(event) => {
                                  event.currentTarget.style.background = "rgba(239,68,68,0.14)";
                                  event.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(event) => {
                                  event.currentTarget.style.background = "rgba(239,68,68,0.06)";
                                  event.currentTarget.style.transform = "none";
                                }}
                              >
                                {disabled && rejectingId === document.id ? "Working..." : "Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {document.auditTrail?.length ? (
                          <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                            <td style={{ padding: "0 16px 16px" }} colSpan="7">
                              <div style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg3)", padding: 14 }}>
                                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.1, color: "var(--t3)", fontWeight: 700 }}>
                                  Audit Trail
                                </div>
                                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                  {document.auditTrail
                                    .slice()
                                    .reverse()
                                    .map((entry, auditIndex) => (
                                      <div
                                        key={`${entry.timestamp}-${entry.action}-${auditIndex}`}
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                                          gap: 12,
                                          borderRadius: 10,
                                          border: "1px solid rgba(255,255,255,0.04)",
                                          background: "rgba(255,255,255,0.025)",
                                          padding: "10px 12px",
                                          fontSize: 12,
                                          color: "var(--t2)"
                                        }}
                                      >
                                        <span style={{ color: "var(--t1)", fontWeight: 700 }}>
                                          {entry.action} by {entry.admin}
                                        </span>
                                        <span>{formatTimestamp(entry.timestamp)}</span>
                                        <span style={{ fontFamily: "monospace" }}>{shorten(entry.txHash)}</span>
                                        <span style={{ color: "var(--t3)" }}>doc #{entry.documentId}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </div>

      {toast ? <Toast {...toast} onDone={() => setToast(null)} /> : null}
    </section>
  );
}
