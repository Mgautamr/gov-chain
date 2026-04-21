import { useState } from "react";

export function StoreForm({ onSubmit, loading, error, walletAddress }) {
  const [value, setValue] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!value.trim() || !walletAddress) {
      return;
    }

    await onSubmit(value.trim());
    setValue("");
  }

  return (
    <section className="glass-panel p-6">
      <div className="label">Submit Record</div>
      <h2 className="panel-title mt-2">Sign and store governance data</h2>
      <p className="mt-2 text-sm text-slate-300">
        Submit a record directly to the GovChain contract from MetaMask. The transaction status
        panel updates automatically after confirmation.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <textarea
          className="input-shell min-h-[180px]"
          rows="7"
          placeholder="Enter governance data, proposal text, audit note, or compliance checkpoint..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />

        {!walletAddress ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            Connect MetaMask before sending a transaction.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button className="btn-primary w-full sm:w-auto" type="submit" disabled={loading || !walletAddress || !value.trim()}>
          {loading ? "Submitting..." : "Submit To Blockchain"}
        </button>
      </form>
    </section>
  );
}
