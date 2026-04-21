import { useEffect } from "react";

export function Toast({ type, title, msg, onDone }) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 3500);
    return () => clearTimeout(timeout);
  }, [onDone]);

  const icons = { verify: "✅", reject: "❌", upload: "⬆" };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: "var(--bg3)",
        border: "1px solid var(--border2)",
        borderRadius: 11,
        padding: "13px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 11,
        minWidth: 250,
        boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
        animation: "toastIn 0.4s cubic-bezier(.22,.68,0,1.2) both"
      }}
    >
      <span style={{ fontSize: 16 }}>{icons[type]}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace" }}>{msg}</div>
      </div>
    </div>
  );
}
