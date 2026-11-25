"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, History, SlidersHorizontal } from "lucide-react";
import { fetchJson } from "@/lib/client";
import { dateTime, naira } from "@/lib/format";
import type { Asset, RateHistory } from "@/lib/types";

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<RateHistory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [historyResult, assetResult] = await Promise.all([
        fetchJson<{ history: RateHistory[] }>(`/api/admin/rate-history${assetId ? `?assetId=${assetId}` : ""}`),
        fetchJson<{ assets: Asset[] }>("/api/admin/assets"),
      ]);
      setHistory(historyResult.history);
      setAssets(assetResult.assets);
    } catch {
      /* keep previous view */
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Audit trail</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Rate change history.</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Every rate and availability change, with the administrator responsible.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <SlidersHorizontal size={14} />
          <span className="sr-only">Filter by asset</span>
          <select className="select min-h-9 w-full py-1.5 text-xs sm:w-56" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
            <option value="">All assets</option>
            {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
          </select>
        </label>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-[12px]">
              <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Asset</th>
                  <th className="px-3 py-3 font-semibold">Change</th>
                  <th className="px-3 py-3 font-semibold">Previous</th>
                  <th className="px-3 py-3 font-semibold">New</th>
                  <th className="px-3 py-3 font-semibold">Changed by</th>
                  <th className="px-3 py-3 font-semibold">Note</th>
                  <th className="px-5 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {history.map((entry) => {
                  const increased = entry.new_rate >= entry.previous_rate;
                  return (
                    <tr key={entry.id} className="transition hover:bg-[var(--surface-2)]">
                      <td className="px-5 py-3 font-bold">{entry.asset_code}</td>
                      <td className="px-3 py-3">
                        <span className={`badge ${entry.change_type === "status_change" ? "badge-info" : increased ? "badge-success" : "badge-warning"}`}>
                          {entry.change_type === "status_change"
                            ? entry.new_active ? "Activated" : "Deactivated"
                            : <>{increased ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} Rate</>}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[var(--muted)]">{naira(entry.previous_rate)}</td>
                      <td className="px-3 py-3 font-mono font-semibold text-[var(--accent)]">{naira(entry.new_rate)}</td>
                      <td className="px-3 py-3">{entry.changed_by}</td>
                      <td className="max-w-[220px] truncate px-3 py-3 text-[var(--muted)]">{entry.note || "—"}</td>
                      <td className="px-5 py-3 text-[var(--muted)]">{dateTime(entry.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <History size={24} className="text-[var(--muted)]" />
            <p className="mt-3 text-sm font-bold">No changes recorded</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">Rate updates and availability changes will be logged here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
