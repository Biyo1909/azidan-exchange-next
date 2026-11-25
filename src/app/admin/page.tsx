"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ArrowUpRight, Banknote, BellRing, CheckCircle2, Clock3, Coins, TrendingUp } from "lucide-react";
import { fetchJson } from "@/lib/client";
import { compactNaira, dateTime, naira, timeAgo } from "@/lib/format";
import type { Overview } from "@/lib/types";

const cards = [
  { key: "pending", label: "Pending trades", icon: Clock3, tone: "text-[var(--amber)]" },
  { key: "processing", label: "Processing", icon: Activity, tone: "text-[var(--blue)]" },
  { key: "paid", label: "Paid trades", icon: CheckCircle2, tone: "text-[var(--accent)]" },
  { key: "volume_naira", label: "Settled volume", icon: TrendingUp, tone: "text-[var(--accent)]" },
] as const;

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<{ overview: Overview }>("/api/admin/overview")
      .then((result) => setOverview(result.overview))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load overview."));
  }, []);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Desk summary</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Good to see you.</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">A live view of trades, rates and announcements.</p>
        </div>
        <Link href="/admin/trades" className="btn btn-primary self-start">Review trades <ArrowUpRight size={15} /></Link>
      </div>

      {error && <p className="text-sm text-[var(--red)]">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="panel p-5"
          >
            <div className="flex items-start justify-between">
              <span className="text-[12px] text-[var(--muted)]">{card.label}</span>
              <card.icon size={18} className={card.tone} />
            </div>
            <p className="mt-5 font-mono text-2xl font-bold tracking-tight">
              {overview ? (card.key === "volume_naira" ? compactNaira(overview.volume_naira) : overview[card.key]) : "—"}
            </p>
            <p className="mt-2 text-[10px] text-[var(--muted)]">
              {card.key === "volume_naira" ? "Paid + processing trades" : "Live from the trade ledger"}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-sm font-bold">Recent trades</h3>
            <Link href="/admin/trades" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">View all</Link>
          </div>
          {!overview ? (
            <div className="space-y-2 p-5">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-12" />)}</div>
          ) : overview.recent_trades.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[12px]">
                <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-3 py-3 font-semibold">Asset</th>
                    <th className="px-3 py-3 font-semibold">Amount</th>
                    <th className="px-3 py-3 font-semibold">Payout</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {overview.recent_trades.map((trade) => (
                    <tr key={trade.id} className="transition hover:bg-[var(--surface-2)]">
                      <td className="px-5 py-3 font-mono text-[11px] font-semibold">{trade.reference}</td>
                      <td className="px-3 py-3">{trade.asset_code}</td>
                      <td className="px-3 py-3 font-mono">{trade.amount}</td>
                      <td className="px-3 py-3 font-mono font-semibold text-[var(--accent)]">{naira(trade.payout_naira)}</td>
                      <td className="px-3 py-3"><StatusBadge status={trade.status} /></td>
                      <td className="px-5 py-3 text-[var(--muted)]">{timeAgo(trade.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Banknote} title="No trades yet" text="Submitted trades will appear here in real time." />
          )}
        </section>

        <div className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Desk health</h3>
              <Coins size={17} className="text-[var(--accent)]" />
            </div>
            <div className="mt-5 space-y-4">
              <HealthRow label="Active assets" value={overview ? `${overview.active_assets} / ${overview.total_assets}` : "—"} percent={overview ? (overview.active_assets / Math.max(1, overview.total_assets)) * 100 : 0} />
              <HealthRow label="Announcements live" value={overview ? String(overview.published_announcements) : "—"} percent={overview ? Math.min(100, overview.published_announcements * 30) : 0} />
              <HealthRow label="Rejected trades" value={overview ? String(overview.rejected) : "—"} percent={overview ? Math.min(100, overview.rejected * 15) : 0} />
            </div>
            <Link href="/admin/rates" className="btn btn-secondary mt-6 w-full text-xs">Manage rates <ArrowUpRight size={14} /></Link>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Latest rate changes</h3>
              <BellRing size={16} className="text-[var(--muted)]" />
            </div>
            <div className="mt-4 space-y-3">
              {!overview ? (
                <div className="skeleton h-16" />
              ) : overview.recent_changes.length ? (
                overview.recent_changes.slice(0, 4).map((change) => (
                  <div key={change.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
                    <p className="flex items-center justify-between text-[12px]">
                      <span className="font-bold">{change.asset_code}</span>
                      <span className="font-mono text-[var(--accent)]">{naira(change.new_rate)}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">{change.changed_by} · {timeAgo(change.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[var(--muted)]">No rate changes recorded yet.</p>
              )}
            </div>
            <Link href="/admin/history" className="btn btn-ghost mt-4 px-0 text-xs">Open audit history →</Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "paid" ? "badge-success" : status === "rejected" ? "badge-danger" : status === "processing" ? "badge-warning" : "badge-info";
  return <span className={`badge ${tone}`}>{status}</span>;
}

function HealthRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-[12px]">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
        <motion.div className="h-full rounded-full bg-[var(--accent)]" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.6 }} />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof AlertTriangle; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Icon size={24} className="text-[var(--muted)]" />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-[12px] text-[var(--muted)]">{text}</p>
    </div>
  );
}
