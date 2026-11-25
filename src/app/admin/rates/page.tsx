"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Coins, Gift, History, Loader2, Pencil, Search, X } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { useApp } from "@/components/providers";
import { fetchJson } from "@/lib/client";
import { dateTime, naira } from "@/lib/format";
import type { Asset, AssetKind } from "@/lib/types";

export default function AdminRatesPage() {
  const { toast } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AssetKind>("crypto");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Asset | null>(null);
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchJson<{ assets: Asset[] }>("/api/admin/assets");
      setAssets(result.assets);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not load rates.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () =>
      assets.filter(
        (asset) => asset.kind === tab && `${asset.name} ${asset.code}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [assets, query, tab],
  );

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setRate(String(asset.buy_rate));
    setNote("");
  };

  const save = async () => {
    if (!editing) return;
    const value = Number(rate);
    if (!Number.isFinite(value) || value <= 0) {
      toast("Enter a valid buying rate.", "error");
      return;
    }
    setSaving(true);
    try {
      await fetchJson(`/api/admin/assets/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ buy_rate: value, note }),
      });
      toast(`${editing.code} rate updated — public site synced.`, "success");
      setEditing(null);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update rate.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (asset: Asset) => {
    setToggling(asset.id);
    try {
      await fetchJson(`/api/admin/assets/${asset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: asset.is_active ? 0 : 1, note: "Availability changed from admin desk" }),
      });
      toast(`${asset.name} is now ${asset.is_active ? "deactivated" : "active"}.`, "success");
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update availability.", "error");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Rate management</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Set the buying rate.</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Changes are written to the audit log and pushed to the public site immediately.
          </p>
        </div>
        <a href="/admin/history" className="btn btn-secondary self-start text-xs"><History size={15} /> View rate history</a>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
          {(["crypto", "gift_card"] as AssetKind[]).map((kind) => (
            <button
              key={kind}
              onClick={() => setTab(kind)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${tab === kind ? "bg-[var(--surface-3)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              {kind === "crypto" ? <Coins size={14} /> : <Gift size={14} />}
              {kind === "crypto" ? "Crypto" : "Gift cards"}
              <span className="font-mono text-[10px] text-[var(--muted)]">{assets.filter((a) => a.kind === kind).length}</span>
            </button>
          ))}
        </div>
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search assets</span>
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input className="input pl-10 text-xs" placeholder="Search assets…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{tab === "crypto" ? "Cryptocurrency" : "Gift cards"}</span>
          <span className="inline-flex items-center gap-2 text-[10px] text-[var(--accent)]"><span className="live-dot" /> Live sync enabled</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[12px]">
              <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Asset</th>
                  <th className="px-3 py-3 font-semibold">Buying rate (NGN)</th>
                  <th className="px-3 py-3 font-semibold">Unit</th>
                  <th className="px-3 py-3 font-semibold">Minimum</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {visible.map((asset) => (
                  <tr key={asset.id} className="transition hover:bg-[var(--surface-2)]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <AssetIcon code={asset.code} size={34} />
                        <div>
                          <p className="font-bold">{asset.name}</p>
                          <p className="text-[10px] text-[var(--muted)]">{asset.code} · {asset.network}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-[var(--accent)]">{naira(asset.buy_rate)}</td>
                    <td className="px-3 py-3 text-[var(--muted)]">{asset.unit_label}</td>
                    <td className="px-3 py-3 font-mono">{asset.min_amount}</td>
                    <td className="px-3 py-3 text-[var(--muted)]">{dateTime(asset.updated_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggle(asset)}
                          disabled={toggling === asset.id}
                          aria-label={`${asset.is_active ? "Deactivate" : "Activate"} ${asset.name}`}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                            asset.is_active
                              ? "border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
                          }`}
                        >
                          {toggling === asset.id ? <Loader2 size={11} className="animate-spin" /> : asset.is_active ? <Check size={11} /> : <X size={11} />}
                          {asset.is_active ? "Active" : "Off"}
                        </button>
                        <button onClick={() => openEdit(asset)} className="btn btn-secondary min-h-8 px-2.5 text-[11px]"><Pencil size={13} /> Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center text-[13px] text-[var(--muted)]">No assets match your search.</div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/65 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Edit ${editing.name} rate`}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="panel relative z-10 w-full max-w-md p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AssetIcon code={editing.code} size={42} />
                  <div>
                    <h3 className="text-base font-bold">{editing.name}</h3>
                    <p className="text-[11px] text-[var(--muted)]">{editing.code} · {editing.unit_label}</p>
                  </div>
                </div>
                <button onClick={() => setEditing(null)} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]"><X size={18} /></button>
              </div>

              <div className="mt-6">
                <label className="field-label" htmlFor="new-rate">New buying rate (NGN per unit)</label>
                <input id="new-rate" inputMode="decimal" className="input font-mono text-lg" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} />
                <p className="field-hint">Previous: {naira(editing.buy_rate)}</p>
              </div>
              <div className="mt-4">
                <label className="field-label" htmlFor="rate-note">Audit note (optional)</label>
                <textarea id="rate-note" className="textarea" placeholder="Reason for this change…" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div className="mt-6 flex gap-2">
                <button onClick={() => setEditing(null)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary flex-1">
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Check size={15} /> Save rate</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
