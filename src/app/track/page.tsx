"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { SiteFooter } from "@/components/home/SiteFooter";
import { TradeTracker } from "@/components/TradeTracker";
import { useApp } from "@/components/providers";

function TrackerContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";
  const { theme, toggleTheme } = useApp();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-xl">
        <div className="container-x flex h-[68px] items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--text)]"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <Link href="/" className="btn btn-secondary px-3.5 text-xs">
              <ArrowLeft size={14} /> Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container-x flex-1 py-14 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mx-auto max-w-3xl">
          <span className="eyebrow"><Activity size={13} /> Trade status</span>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.04em]">Track your trade.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Enter the reference from your confirmation screen to see where your trade is in the pipeline.
          </p>
          <div className="panel mt-9 p-5 sm:p-7">
            <TradeTracker initialReference={reference} />
          </div>
          <p className="mt-6 flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <ShieldCheck size={14} className="text-[var(--accent)]" /> Tracking is public but shows no personal or payout details.
          </p>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <TrackerContent />
    </Suspense>
  );
}
