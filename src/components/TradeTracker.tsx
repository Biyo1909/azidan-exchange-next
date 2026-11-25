"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, Clock3, Loader2, Search, Wallet } from "lucide-react";
import { fetchJson } from "@/lib/client";
import { amount as formatAmount, dateTime, naira } from "@/lib/format";
import type { TradeStatus } from "@/lib/types";

type TrackedTrade = {
  reference: string;
  asset_code: string;
  asset_name: string;
  amount: number;
  rate_snapshot: number;
  payout_naira: number;
  status: TradeStatus;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

const stages = [
  { key: "pending", label: "Pending", description: "Trade received and queued for review", icon: Clock3 },
  { key: "processing", label: "Processing", description: "Our desk is verifying and preparing payment", icon: Loader2 },
  { key: "paid", label: "Paid", description: "Naira has been sent to your payout account", icon: Wallet },
] as const;

export function TradeTracker({ initialReference = "" }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [trade, setTrade] = useState<TrackedTrade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const lookup = async (value: string) => {
    const clean = value.trim().toUpperCase();
    if (!clean) {
      setError("Enter your trade reference.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    setTrade(null);
    try {
      const result = await fetchJson<{ trade: TrackedTrade }>(`/api/trades?reference=${encodeURIComponent(clean)}`);
      setTrade(result.trade);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find that trade.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference) void lookup(initialReference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference]);

  const activeIndex = trade ? stages.findIndex((stage) => stage.key === trade.status) : -1;

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void lookup(reference);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value.toUpperCase())}
            placeholder="AZD-YYYYMMDD-XXXXXX"
            aria-label="Trade reference"
            className="input pl-10 font-mono tracking-wide"
          />
        </div>
        <button className="btn btn-primary px-6" disabled={loading} type="submit">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Checking…</> : <>Track trade <Search size={15} /></>}
        </button>
      </form>

      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--red)_24%,transparent)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)] px-4 py-3 text-[13px] text-[var(--red)]" role="alert">
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}

      {searched && !loading && !error && !trade && (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">No result yet. Check the reference and try again.</p>
      )}

      {trade && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="panel mt-6 overflow-hidden"
        >
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Trade reference</p>
              <p className="mt-1 font-mono text-sm font-bold">{trade.reference}</p>
            </div>
            <span
              className={`badge self-start ${
                trade.status === "paid"
                  ? "badge-success"
                  : trade.status === "rejected"
                    ? "badge-danger"
                    : trade.status === "processing"
                      ? "badge-warning"
                      : "badge-info"
              }`}
            >
              {trade.status === "paid" && <CheckCircle2 size={12} />}
              {trade.status}
            </span>
          </div>

          <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Asset</p>
              <p className="mt-1 text-sm font-semibold">{trade.asset_name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Amount</p>
              <p className="mt-1 font-mono text-sm font-semibold">{formatAmount(trade.amount, 8)} {trade.asset_code}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Payout</p>
              <p className="mt-1 font-mono text-sm font-bold text-[var(--accent)]">{naira(trade.payout_naira)}</p>
            </div>
          </div>

          {trade.status === "rejected" ? (
            <div className="mx-5 mb-5 flex items-start gap-3 rounded-lg border border-[color-mix(in_srgb,var(--red)_25%,transparent)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)] p-4 text-[13px] text-[var(--red)]">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>This trade was not approved. Contact support if you believe this is a mistake.</span>
            </div>
          ) : (
            <div className="mx-5 mb-5 border-t border-[var(--border)] pt-5">
              <div className="relative flex justify-between">
                <div className="absolute left-[12%] right-[12%] top-4 h-px bg-[var(--border)]" />
                <motion.div
                  className="absolute left-[12%] top-4 h-px bg-[var(--accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, activeIndex) * 38}%` }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                {stages.map((stage, index) => {
                  const complete = index < activeIndex;
                  const active = index === activeIndex;
                  const Icon = stage.icon;
                  return (
                    <div key={stage.key} className="relative z-10 flex w-1/3 flex-col items-center text-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                          complete || active
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                        }`}
                      >
                        {complete ? <Check size={15} /> : <Icon size={14} />}
                      </div>
                      <p className={`mt-2.5 text-[11px] font-bold ${active ? "text-[var(--accent)]" : complete ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                        {stage.label}
                      </p>
                      <p className="mt-1 hidden text-[10px] leading-tight text-[var(--muted)] sm:block">{stage.description}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-[11px] text-[var(--muted)]">
                Submitted {dateTime(trade.created_at)} · Last update {dateTime(trade.updated_at)}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
