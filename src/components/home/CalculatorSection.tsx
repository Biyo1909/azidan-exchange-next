"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calculator as CalculatorIcon, Info, Repeat2, Wallet } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { amount as formatAmount, naira } from "@/lib/format";
import type { Asset, AssetKind } from "@/lib/types";

export function CalculatorSection({ assets, onTrade }: { assets: Asset[]; onTrade: (kind: AssetKind, assetId: number) => void }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!selectedId && assets.length) setSelectedId(assets.find((a) => a.code === "USDT")?.id ?? assets[0].id);
  }, [assets, selectedId]);

  const selected = useMemo(() => assets.find((asset) => asset.id === selectedId) ?? null, [assets, selectedId]);
  const numeric = Number(value);
  const valid = value !== "" && Number.isFinite(numeric) && numeric > 0;
  const payout = valid && selected ? numeric * selected.buy_rate : 0;

  const quickAmounts = selected?.kind === "gift_card" ? [10, 25, 50, 100] : selected?.code === "BTC" ? [0.01, 0.05, 0.1, 0.5] : [10, 50, 100, 500];

  return (
    <section id="calculator" className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface)]/45 py-16 lg:py-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <span className="eyebrow"><CalculatorIcon size={13} /> Payout calculator</span>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.75rem)] font-bold tracking-[-0.035em]">
              Know your Naira before you trade.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Choose an asset, enter an amount, and see your estimated payout using the live buying rate.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[11px] text-[var(--muted)] md:self-auto">
            <span className="live-dot" /> Rate feed connected
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mt-9 grid gap-4 lg:grid-cols-[1.05fr_.95fr]"
        >
          <div className="panel p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="calc-asset">Asset</label>
                <select
                  id="calc-asset"
                  className="select"
                  value={selectedId ?? ""}
                  onChange={(event) => {
                    setSelectedId(Number(event.target.value));
                    setValue("");
                  }}
                >
                  {!assets.length && <option value="">Loading assets…</option>}
                  <optgroup label="Cryptocurrency">
                    {assets.filter((a) => a.kind === "crypto").map((asset) => (
                      <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Gift cards">
                    {assets.filter((a) => a.kind === "gift_card").map((asset) => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="calc-amount">Amount to sell</label>
                <div className="relative">
                  <input
                    id="calc-amount"
                    inputMode="decimal"
                    className="input pr-20 font-mono"
                    placeholder="0.00"
                    value={value}
                    onChange={(event) => setValue(event.target.value.replace(/[^\d.]/g, ""))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[var(--muted)]">
                    {selected?.kind === "gift_card" ? "USD" : selected?.code || "—"}
                  </span>
                </div>
                <p className="field-hint">
                  {selected ? `Minimum ${selected.min_amount} ${selected.kind === "gift_card" ? "USD face value" : selected.code}` : "Select an asset"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="field-label">Quick amounts</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setValue(String(quick))}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 font-mono text-xs text-[var(--text-soft)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {formatAmount(quick, 4)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] p-3 text-[11px] leading-relaxed text-[var(--muted)]">
              <Info size={14} className="mt-0.5 shrink-0 text-[var(--blue)]" />
              <span>Gift card amounts are entered in USD face value. The rate shown is Naira paid per $1 of card value.</span>
            </div>
          </div>

          <div className="panel relative overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">You receive</span>
              <Wallet size={18} className="text-[var(--accent)]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={payout}
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.28 }}
                className="mt-5 break-all font-mono text-[clamp(1.9rem,5vw,3rem)] font-bold tracking-[-0.05em] text-[var(--text)]"
              >
                {valid ? naira(payout) : "₦0"}
              </motion.p>
            </AnimatePresence>

            <div className="mt-7 space-y-3 border-t border-[var(--border)] pt-5 text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Asset</span>
                <span className="font-semibold">{selected?.name || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Live buying rate</span>
                <span className="font-mono font-semibold text-[var(--accent)]">
                  {selected ? naira(selected.buy_rate) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Amount</span>
                <span className="font-mono font-semibold">{valid ? formatAmount(numeric, 8) : "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Hidden charges</span>
                <span className="font-semibold text-[var(--accent)]">None</span>
              </div>
            </div>

            <button
              disabled={!selected || !valid || numeric < (selected?.min_amount ?? 0)}
              onClick={() => selected && onTrade(selected.kind, selected.id)}
              className="btn btn-primary mt-7 w-full"
            >
              Start this trade <ArrowRight size={16} />
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-[10px] text-[var(--muted)]">
              <Repeat2 size={12} /> Final rate is confirmed when your trade is submitted.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
