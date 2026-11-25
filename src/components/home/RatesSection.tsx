"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Coins, Gift, Search, SlidersHorizontal } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { naira } from "@/lib/format";
import type { Asset, AssetKind } from "@/lib/types";

function RateSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="panel h-[168px] animate-pulse p-5">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton mt-4 h-4 w-28" />
          <div className="skeleton mt-3 h-6 w-40" />
          <div className="skeleton mt-4 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export function RatesSection({
  assets,
  loading,
  onTrade,
}: {
  assets: Asset[];
  loading: boolean;
  onTrade: (kind: AssetKind, assetId: number) => void;
}) {
  const [tab, setTab] = useState<AssetKind>("crypto");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      assets.filter((asset) => {
        const matchTab = asset.kind === tab;
        const matchQuery = `${asset.name} ${asset.code} ${asset.network}`.toLowerCase().includes(query.toLowerCase());
        return matchTab && matchQuery;
      }),
    [assets, query, tab],
  );

  const tabs: Array<{ key: AssetKind; label: string; icon: typeof Coins; count: number }> = [
    { key: "crypto", label: "Cryptocurrency", icon: Coins, count: assets.filter((a) => a.kind === "crypto").length },
    { key: "gift_card", label: "Gift cards", icon: Gift, count: assets.filter((a) => a.kind === "gift_card").length },
  ];

  return (
    <section id="rates" className="container-x scroll-mt-24 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
      >
        <div>
          <span className="eyebrow"><span className="live-dot" /> Live exchange desk</span>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.75rem)] font-bold tracking-[-0.035em]">
            Rates that move with the market.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Transparent buying rates for every supported asset. What you see is the rate used when you submit your trade.
          </p>
        </div>
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Search assets</span>
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search an asset…"
            className="input pl-10"
          />
        </label>
      </motion.div>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1" role="tablist" aria-label="Asset category">
          {tabs.map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={`relative inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                tab === item.key ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab === item.key && (
                <motion.span
                  layoutId="rate-tab-active"
                  className="absolute inset-0 rounded-lg border border-[var(--border)] bg-[var(--surface-3)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon size={15} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
              <span className="relative z-10 rounded-md bg-[var(--bg-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]">
                {item.count}
              </span>
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
          <SlidersHorizontal size={14} /> All rates in NGN
        </span>
      </div>

      <div className="mt-6">
        {loading ? (
          <RateSkeleton />
        ) : filtered.length ? (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((asset, index) => (
              <motion.article
                key={asset.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.28) }}
                whileHover={{ y: -4 }}
                className="panel group flex flex-col p-5 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)]"
              >
                <div className="flex items-start justify-between">
                  <AssetIcon code={asset.code} />
                  <span className="badge badge-success"><span className="live-dot" /> Live</span>
                </div>
                <h3 className="mt-4 text-[15px] font-bold">{asset.name}</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">{asset.network || asset.unit_label}</p>
                <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-[var(--border)] pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Buying rate</p>
                    <p className="mt-1 font-mono text-lg font-bold tracking-tight text-[var(--accent)]">
                      {naira(asset.buy_rate)}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--muted)]">/ {asset.unit_label}</span>
                </div>
                <button
                  onClick={() => onTrade(asset.kind, asset.id)}
                  className="btn btn-secondary mt-4 w-full justify-between text-xs group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]"
                >
                  <span>Min. {asset.min_amount} {asset.kind === "crypto" ? asset.code : "USD"}</span>
                  <ArrowUpRight size={15} />
                </button>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
            <Search size={24} className="text-[var(--muted)]" />
            <p className="mt-4 text-sm font-semibold">No matching assets</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Try another name or switch categories.</p>
            <button onClick={() => setQuery("")} className="btn btn-ghost mt-4 text-xs">Clear search</button>
          </div>
        )}
      </div>
    </section>
  );
}
