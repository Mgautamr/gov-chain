import { useState } from "react";

export function DocumentUploadForm({ walletAddress, loading, error, onSubmit }) {
  const [file, setFile] = useState(null);
  const [hovered, setHovered] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!walletAddress || !file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("wallet", walletAddress);

    await onSubmit(formData);

    setFile(null);
    event.target.reset();
  }

  return (
    <section className="glass-panel" style={{ padding: 22, animation: "fadeUp 0.5s 0.35s ease both" }}>
      <div className="label">User Upload</div>
      <h2 className="panel-title" style={{ marginTop: 10 }}>Upload document metadata</h2>
      <p style={{ marginTop: 10, fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
        Connect MetaMask, then pick a real file for IPFS upload. The backend stores the wallet,
        CID, derived hash, and pending review status.
      </p>

      <form style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
        <div
          onClick={() => document.getElementById("govchain-upload-input")?.click()}
          style={{
            marginTop: 2,
            border: hovered ? "1px dashed rgba(255,255,255,0.16)" : "1px dashed rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: hovered ? "var(--bg3)" : "var(--bg2)",
            transition: "all 0.25s",
            animation: "fadeUp 0.5s 0.35s ease both"
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <input
            id="govchain-upload-input"
            type="file"
            style={{ display: "none" }}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: 18,
              animation: "ringBreath 3s ease-in-out infinite"
            }}
          >
            +
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 5 }}>
            Drop file or click to upload
          </h3>
          <p style={{ fontSize: 12, color: "var(--t3)" }}>
            PDF · PNG · JPG · max 10 MB · <span style={{ color: "var(--cyan)" }}>IPFS</span> storage · on-chain hash
          </p>
          {file ? (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--t2)", fontFamily: "monospace" }}>{file.name}</div>
          ) : null}
        </div>

        <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg2)", padding: "12px 14px", fontSize: 13, color: "var(--t2)" }}>
          Upload wallet: <span style={{ fontWeight: 700, color: "var(--t1)" }}>{walletAddress || "MetaMask not connected"}</span>
        </div>

        {!walletAddress ? (
          <div style={{ borderRadius: 14, border: "1px solid rgba(245,158,11,0.18)", background: "rgba(245,158,11,0.08)", padding: "12px 14px", fontSize: 13, color: "var(--amber)" }}>
            Connect MetaMask before uploading a document.
          </div>
        ) : null}

        {error ? (
          <div style={{ borderRadius: 14, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.08)", padding: "12px 14px", fontSize: 13, color: "var(--red)" }}>
            {error}
          </div>
        ) : null}

        <button
          className="btn-primary"
          style={{ width: "100%" }}
          type="submit"
          disabled={loading || !walletAddress || !file}
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </section>
  );
}
