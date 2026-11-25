import Link from "next/link";

export function BrandMark({
  size = "md",
  showText = true,
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string | null;
}) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-xl" : "h-10 w-10 rounded-[10px]";
  const icon = size === "sm" ? 16 : size === "lg" ? 24 : 20;
  const title = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";

  const content = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`${box} relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[color-mix(in_srgb,var(--accent)_32%,transparent)] bg-[linear-gradient(145deg,var(--accent-soft),transparent)]`}
      >
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2.5 19.5 20l-3.3-1.1L12 11.1 7.8 18.9 4.5 20 12 2.5Z" fill="var(--accent)" />
          <path d="m12 11.1 3.3 7.8-3.3-2-3.3 2 3.3-7.8Z" fill="var(--bg)" opacity="0.75" />
        </svg>
      </span>
      {showText && (
        <span className={`${title} flex flex-col leading-none tracking-tight`}>
          <span className="font-extrabold">AZIDAN</span>
          <span className="text-[0.62em] font-semibold tracking-[0.3em] text-[var(--muted)]">EXCHANGE</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="AZIDAN EXCHANGE home" className="inline-flex rounded-lg transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
