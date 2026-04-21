function StatusItem({ label, value }) {
  return (
    <div className="stat-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function StatusPanel({ status, loading, error, onRefresh }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Network</p>
          <h2>Backend status</h2>
        </div>
        <button className="ghost-button" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="stats-grid">
        <StatusItem label="RPC" value={loading ? "Loading..." : status?.rpcConnected ? "Connected" : "Offline"} />
        <StatusItem label="Network" value={loading ? "Loading..." : status?.network ?? "Unknown"} />
        <StatusItem label="Chain ID" value={loading ? "Loading..." : status?.chainId ?? "Unknown"} />
        <StatusItem
          label="Contract"
          value={loading ? "Loading..." : status?.contractAddress ?? "Not configured"}
        />
      </div>
    </section>
  );
}
