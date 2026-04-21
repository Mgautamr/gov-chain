function StatCard({ label, value }) {
  return (
    <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg2)", padding: 14 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--t3)", fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 8, wordBreak: "break-all", fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{value}</div>
    </div>
  );
}

export function WalletPanel({ walletAddress, walletError, onConnect, walletLoading }) {
  return (
    <section className="glass-panel" style={{ padding: 22, animation: "fadeUp 0.5s 0.18s ease both" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div className="label">Wallet Access</div>
          <h2 className="panel-title" style={{ marginTop: 10 }}>MetaMask connection</h2>
          <p style={{ marginTop: 10, fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
            The connected wallet is attached to document uploads. If MetaMask is missing, uploads
            remain disabled and the dashboard stays read-only.
          </p>
        </div>
        <button className="btn-secondary" onClick={onConnect} disabled={walletLoading}>
          {walletLoading ? "Connecting..." : "Reconnect"}
        </button>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 14, gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
        <StatCard label="Connection" value={walletAddress ? "Wallet connected" : "Wallet not connected"} />
        <StatCard label="Address" value={walletAddress || "Connect MetaMask to continue"} />
      </div>

      {walletError ? <p style={{ marginTop: 14, fontSize: 13, color: "var(--red)" }}>{walletError}</p> : null}
    </section>
  );
}
