export function Topbar() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: 52,
        borderBottom: "1px solid var(--border)",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        animation: "topIn 0.4s ease both"
      }}
    >
      <span style={{ fontSize: 13, color: "var(--t2)" }}>GovChain › Dashboard</span>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            padding: "5px 12px",
            borderRadius: 20,
            border: "1px solid var(--border)",
            color: "var(--t3)",
            background: "var(--bg2)"
          }}
        >
          ETH Sepolia
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--green)",
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 20,
            border: "1px solid rgba(34,197,94,0.15)",
            background: "rgba(34,197,94,0.06)"
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--green)",
              animation: "livePulse 1.5s infinite"
            }}
          />
          Live
        </div>
      </div>
    </header>
  );
}
