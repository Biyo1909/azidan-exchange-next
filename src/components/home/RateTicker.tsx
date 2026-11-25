"use client";

import { AssetIcon } from "@/components/AssetIcon";
import { naira } from "@/lib/format";
import type { Asset } from "@/lib/types";

export function RateTicker({ assets }: { assets: Asset[] }) {
  const items = assets.filter((asset) => asset.is_active);
  if (!items.length) return null;
  const repeated = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--surface)]/70 py-3.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--bg)] to-transparent" />
      <div className="ticker-track items-center gap-10 px-5" aria-label="Live buying rates">
        {repeated.map((asset, index) => (
          <div key={`${asset.code}-${index}`} className="flex items-center gap-2.5 whitespace-nowrap">
            <AssetIcon code={asset.code} size={24} />
            <span className="text-xs font-semibold">{asset.code}</span>
            <span className="font-mono text-xs font-semibold text-[var(--accent)]">{naira(asset.buy_rate)}</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">/ {asset.kind === "crypto" ? asset.code : "unit"}</span>
            <span className="ml-3 h-3 w-px bg-[var(--border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
