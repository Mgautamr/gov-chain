function shortenAddress(address) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header({ walletAddress, onConnect, walletLoading, adminAuthenticated, onLogout }) {
  return (
    <header
      className="glass-panel"
      style={{ padding: "24px 24px 22px", position: "relative", overflow: "hidden", animation: "fadeUp 0.45s ease both" }}
    >
      <div
        style={{
          position: "absolute",
          right: -40,
          top: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 72%)"
        }}
      />
      <div style={{ position: "relative", display: "flex", gap: 18, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ maxWidth: 760 }}>
          <div className="label">GovChain Dashboard</div>
          <h1 style={{ marginTop: 14, fontSize: 36, fontWeight: 700, letterSpacing: -1.8, color: "var(--t1)" }}>
            Premium black-chain document command center
          </h1>
          <p style={{ marginTop: 12, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: "var(--t2)" }}>
            DigiLocker stops at storage. GovChain proves document state with Ethereum transaction traces,
            persistent IPFS records, and an admin console built for audit clarity.
          </p>
        </div>

        <div
          style={{
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 16,
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--bg2)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--t2)" }}>
            <span>Wallet Session</span>
            <span style={{ color: "var(--green)", fontWeight: 700 }}>Connected</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--t1)" }}>{shortenAddress(walletAddress)}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={onConnect} disabled={walletLoading}>
              {walletLoading ? "Connecting..." : "Connect Wallet"}
            </button>
            {adminAuthenticated ? (
              <button className="btn-secondary" onClick={onLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
