function formatAddress(address) {
  if (!address) {
    return "Unknown";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function RecordsPanel({ records, loading, error, onRefresh }) {
  return (
    <section className="glass-panel p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label">Records Feed</div>
          <h2 className="panel-title mt-2">Latest on-chain records</h2>
        </div>
        <button className="btn-secondary" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-4 font-medium">ID</th>
                <th className="px-4 py-4 font-medium">Data</th>
                <th className="px-4 py-4 font-medium">Submitter</th>
                <th className="px-4 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-slate-400" colSpan="4">
                    Loading records...
                  </td>
                </tr>
              ) : null}

              {!loading && records.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-400" colSpan="4">
                    No records available yet.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? records.map((record) => (
                    <tr key={record.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-4 py-4 text-cyan-200">{record.id}</td>
                      <td className="max-w-[420px] px-4 py-4 text-slate-100">{record.data}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                        {formatAddress(record.submitter)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                        {formatTimestamp(record.createdAt)}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
