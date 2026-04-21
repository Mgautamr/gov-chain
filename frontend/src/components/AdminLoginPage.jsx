import { useState } from "react";

export function AdminLoginPage({ loading, error, onLogin }) {
  const [adminKey, setAdminKeyValue] = useState("govchain-admin");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!adminKey.trim()) {
      return;
    }

    await onLogin(adminKey.trim());
  }

  return (
    <section style={{ width: "100%", maxWidth: 420, marginTop: 24, animation: "fadeUp 0.5s 0.2s ease both" }}>
      <div className="glass-panel" style={{ padding: "28px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <div className="label">Admin Access</div>
          <h2 style={{ marginTop: 12, fontSize: 28, fontWeight: 700, letterSpacing: -1.2, color: "var(--t1)" }}>Admin Login</h2>
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
            Unlock the admin dashboard by saving the existing GovChain admin key to local storage.
          </p>
        </div>

        <form style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
          <input
            className="input-shell"
            placeholder="Admin key"
            value={adminKey}
            onChange={(event) => setAdminKeyValue(event.target.value)}
          />

          {error ? (
            <div style={{ borderRadius: 14, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.08)", padding: "12px 14px", fontSize: 13, color: "var(--red)" }}>
              {error}
            </div>
          ) : null}

          <button
            className="btn-primary w-full"
            type="submit"
            disabled={loading || !adminKey.trim()}
          >
            {loading ? "Saving..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </section>
  );
}
