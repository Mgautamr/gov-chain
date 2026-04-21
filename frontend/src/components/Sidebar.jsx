const navItems = [
  { label: "Dashboard", active: true },
  { label: "Verification", active: false },
  { label: "Uploads", active: false },
  { label: "Audit Trail", active: false }
];

function shortenAddress(address) {
  if (!address) {
    return "0x0000...0000";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Sidebar({ walletAddress }) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "rgba(0,0,0,0.92)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        animation: "sideIn 0.5s cubic-bezier(.22,.68,0,1.2) both"
      }}
    >
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: "var(--t3)", textTransform: "uppercase" }}>
          GovChain
        </div>
        <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700, color: "var(--t1)", letterSpacing: -0.8 }}>
          Black Ledger
        </div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6, color: "var(--t2)" }}>
          Decentralized document review with on-chain proof and IPFS traceability.
        </div>
      </div>

      <nav style={{ padding: "18px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`sb-item${item.active ? " active" : ""}`}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              border: "1px solid transparent",
              background: item.active ? "var(--bg2)" : "transparent",
              color: item.active ? "var(--t1)" : "var(--t2)",
              fontSize: 13,
              fontWeight: item.active ? 700 : 500,
              textAlign: "left",
              transition: "background 0.2s, border-color 0.2s, color 0.2s"
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: item.active ? "var(--cyan)" : "var(--t4)"
              }}
            />
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "14px 10px", borderTop: "1px solid var(--border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 11px",
            borderRadius: 8,
            background: "var(--bg2)",
            border: "1px solid var(--border)"
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--green)",
              animation: "chainPulse 2.5s infinite"
            }}
          />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)" }}>Sepolia Testnet</div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--t3)" }}>
              {shortenAddress(walletAddress)}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
