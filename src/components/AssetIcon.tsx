const palette: Record<string, { bg: string; color: string; label: string }> = {
  BTC: { bg: "rgba(247,147,26,.14)", color: "#f7931a", label: "₿" },
  ETH: { bg: "rgba(98,126,234,.14)", color: "#8ba4ff", label: "Ξ" },
  USDT: { bg: "rgba(38,194,166,.14)", color: "#26c2a6", label: "₮" },
  BNB: { bg: "rgba(243,186,47,.14)", color: "#f3ba2f", label: "◆" },
  SOL: { bg: "rgba(153,69,236,.14)", color: "#b57bff", label: "S" },
  XRP: { bg: "rgba(148,163,184,.16)", color: "#cbd5e1", label: "X" },
  LTC: { bg: "rgba(155,163,180,.16)", color: "#c3ccdb", label: "Ł" },
  DOGE: { bg: "rgba(199,154,42,.14)", color: "#d9ac45", label: "Ð" },
  ADA: { bg: "rgba(51,144,236,.14)", color: "#5baaf5", label: "A" },
  AVAX: { bg: "rgba(232,65,66,.14)", color: "#f27173", label: "A" },
  APPLE: { bg: "rgba(226,232,240,.12)", color: "#dbe4ef", label: "" },
  ITUNES: { bg: "rgba(240,97,122,.14)", color: "#f4798d", label: "" },
  AMAZON: { bg: "rgba(255,153,0,.14)", color: "#ffad33", label: "a" },
  STEAM: { bg: "rgba(102,192,244,.14)", color: "#7ccaf5", label: "◉" },
  GOOGLEPLAY: { bg: "rgba(66,133,244,.14)", color: "#7aa5f7", label: "▶" },
  WALMART: { bg: "rgba(253,206,40,.14)", color: "#f2ce4b", label: "✳" },
  EBAY: { bg: "rgba(231,63,104,.14)", color: "#ec6b8c", label: "e" },
  NORDSTROM: { bg: "rgba(171,144,192,.14)", color: "#c3a6d6", label: "N" },
};

export function AssetIcon({ code, size = 42 }: { code: string; size?: number }) {
  const style = palette[code] || { bg: "var(--accent-soft)", color: "var(--accent)", label: code.slice(0, 1) };
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl font-mono font-bold"
      style={{
        width: size,
        height: size,
        background: style.bg,
        color: style.color,
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {code === "APPLE" || code === "ITUNES" ? (
        <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.2 1.2-2.4 1.3-2.5-.1 0-2.4-.9-2.4-3.6ZM14.2 6.1c.6-.8 1-1.9.9-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 3-1.4Z" />
        </svg>
      ) : (
        style.label
      )}
    </span>
  );
}
