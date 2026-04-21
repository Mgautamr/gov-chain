const toneClasses = {
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  error: "border-rose-400/20 bg-rose-400/10 text-rose-100"
};

export function TransactionResult({ txState }) {
  return (
    <section className="glass-panel p-6">
      <div className="label">Transaction</div>
      <h2 className="panel-title mt-2">Execution status</h2>

      {!txState ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          No transaction submitted yet.
        </div>
      ) : (
        <div className={`mt-5 space-y-4 rounded-3xl border p-5 ${toneClasses[txState.status]}`}>
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] opacity-70">Status</div>
            <div className="mt-2 text-lg font-semibold capitalize">{txState.status}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] opacity-70">Details</div>
            <div className="mt-2 text-sm">{txState.message}</div>
          </div>
          {txState.transactionHash ? (
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] opacity-70">Transaction Hash</div>
              <div className="mt-2 break-all text-sm">{txState.transactionHash}</div>
            </div>
          ) : null}
          {txState.blockNumber ? (
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] opacity-70">Block Number</div>
              <div className="mt-2 text-sm">{txState.blockNumber}</div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
