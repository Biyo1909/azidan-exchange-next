"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, BadgeCheck, CheckCircle2, ClipboardCopy, Loader2, Search, X, XCircle } from "lucide-react";
import { useApp } from "@/components/providers";
import { fetchJson } from "@/lib/client";
import { dateTime, naira } from "@/lib/format";
import type { Trade, TradeStatus } from "@/lib/types";

const filters: Array<{ key: TradeStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "paid", label: "Paid" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminTradesPage() {
  const { toast } = useApp();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState<TradeStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Trade | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await fetchJson<{ trades: Trade[] }>(`/api/admin/trades${filter !== "all" ? `?status=${filter}` : ""}`);
      setTrades(result.trades);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not load trades.", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const visible = trades.filter((trade) =>
    `${trade.reference} ${trade.customer_name} ${trade.asset_code}`.toLowerCase().includes(query.toLowerCase()),
  );

  const update = async (status: TradeStatus) => {
    if (!selected) return;
    setBusy(status);
    try {
      const result = await fetchJson<{ trade: Trade }>(`/api/admin/trades/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, admin_note: note }),
      });
      setSelected(result.trade);
      toast(`Trade marked ${status}.`, "success");
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update trade.", "error");
    } finally {
      setBusy("");
    }
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast("Copied to clipboard.", "success");
    } catch {
      toast("Copy is unavailable in this browser.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Trade management</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Review and settle trades.</h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">Approve, mark as paid, or reject with a clear audit trail.</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                filter === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
              <span className="ml-2 font-mono text-[10px] opacity-70">
                {item.key === "all" ? trades.length : trades.filter((t) => t.status === item.key).length}
              </span>
            </button>
          ))}
        </div>
        <label className="relative w-full lg:max-w-xs">
          <span className="sr-only">Search trades</span>
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input className="input pl-10 text-xs" placeholder="Reference, name or asset…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[12px]">
              <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Asset</th>
                  <th className="px-3 py-3 font-semibold">Payout</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {visible.map((trade) => (
                  <tr
                    key={trade.id}
                    tabIndex={0}
                    onClick={() => { setSelected(trade); setNote(trade.admin_note || ""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setSelected(trade); setNote(trade.admin_note || ""); } }}
                    className="cursor-pointer transition hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-5 py-3 font-mono text-[11px] font-semibold">{trade.reference}</td>
                    <td className="px-3 py-3">
                      <span className="block font-semibold">{trade.customer_name}</span>
                      <span className="block text-[10px] text-[var(--muted)]">{trade.customer_email}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block font-semibold">{trade.asset_code}</span>
                      <span className="block font-mono text-[10px] text-[var(--muted)]">{trade.amount}</span>
                    </td>
                    <td className="px-3 py-3 font-mono font-semibold text-[var(--accent)]">{naira(trade.payout_naira)}</td>
                    <td className="px-3 py-3"><StatusBadge status={trade.status} /></td>
                    <td className="px-5 py-3 text-[var(--muted)]">{dateTime(trade.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Activity size={24} className="text-[var(--muted)]" />
            <p className="mt-3 text-sm font-bold">No trades here</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">New submissions will appear as soon as they arrive.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div className="absolute inset-0 bg-black/65 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Trade ${selected.reference}`}
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative z-10 flex h-full w-full max-w-[520px] flex-col border-l border-[var(--border)] bg-[var(--bg)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Trade details</p>
                  <h3 className="mt-1 font-mono text-base font-bold">{selected.reference}</h3>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]"><X size={19} /></button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">Current status</span>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="panel-soft p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Trade summary</p>
                  <div className="mt-3 space-y-2.5 text-[12px]">
                    <Row label="Asset" value={`${selected.asset_name} (${selected.asset_code})`} />
                    <Row label="Amount" value={`${selected.amount} ${selected.asset_code}`} />
                    <Row label="Rate at submission" value={naira(selected.rate_snapshot)} />
                    <Row label="Payout" value={naira(selected.payout_naira)} accent />
                    <Row label="Submitted" value={dateTime(selected.created_at)} />
                    {selected.paid_at && <Row label="Paid at" value={dateTime(selected.paid_at)} />}
                  </div>
                </div>

                <div className="panel-soft p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Customer</p>
                  <div className="mt-3 space-y-2.5 text-[12px]">
                    <Row label="Name" value={selected.customer_name} />
                    <Row label="Email" value={selected.customer_email} />
                    <Row label="Phone" value={selected.customer_phone} />
                    {selected.note && <Row label="Customer note" value={selected.note} />}
                  </div>
                </div>

                <div className="panel-soft p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Payout destination</p>
                    <button onClick={() => copy(selected.account_number)} aria-label="Copy account number" className="text-[var(--muted)] hover:text-[var(--accent)]"><ClipboardCopy size={14} /></button>
                  </div>
                  <div className="mt-3 space-y-2.5 text-[12px]">
                    <Row label="Method" value={selected.payout_method} />
                    <Row label="Account" value={selected.account_number} />
                    <Row label="Account name" value={selected.account_name} />
                    {selected.bank_name && <Row label="Bank" value={selected.bank_name} />}
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="admin-trade-note">Admin note</label>
                  <textarea id="admin-trade-note" className="textarea" placeholder="Internal note or rejection reason…" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
                {selected.status === "pending" && (
                  <button onClick={() => update("processing")} disabled={!!busy} className="btn btn-primary flex-1 text-xs">
                    {busy === "processing" ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />} Approve
                  </button>
                )}
                {(selected.status === "pending" || selected.status === "processing") && (
                  <button onClick={() => update("paid")} disabled={!!busy} className="btn btn-secondary flex-1 text-xs">
                    {busy === "paid" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Mark paid
                  </button>
                )}
                {selected.status !== "paid" && selected.status !== "rejected" && (
                  <button onClick={() => update("rejected")} disabled={!!busy} className="btn btn-danger text-xs">
                    {busy === "rejected" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                  </button>
                )}
                {selected.status === "rejected" && (
                  <button onClick={() => update("pending")} disabled={!!busy} className="btn btn-secondary w-full text-xs">Reopen as pending</button>
                )}
                {selected.status === "paid" && (
                  <p className="w-full text-center text-[11px] text-[var(--accent)]">This trade has been settled.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: TradeStatus }) {
  const tone = status === "paid" ? "badge-success" : status === "rejected" ? "badge-danger" : status === "processing" ? "badge-warning" : "badge-info";
  return <span className={`badge ${tone}`}>{status}</span>;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`max-w-[62%] break-words text-right font-medium ${accent ? "font-mono text-[var(--accent)]" : ""}`}>{value}</span>
    </div>
  );
}
