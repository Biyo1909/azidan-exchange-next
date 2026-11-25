"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, LockKeyhole, Radio, ShieldCheck } from "lucide-react";
import type { AssetKind } from "@/lib/types";

const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero({ onStartTrade, assetCount }: { onStartTrade: (kind?: AssetKind) => void; assetCount: number }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, var(--accent-soft) 0%, transparent 42%)" }}
      />
      <div className="container-x grid gap-12 pb-20 pt-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:pb-28 lg:pt-24">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}>
          <motion.div variants={rise} transition={{ duration: 0.6 }} className="mb-6">
            <span className="badge badge-success">
              <Radio size={12} /> Live rates · Updated instantly
            </span>
          </motion.div>

          <motion.h1
            variants={rise}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl text-[clamp(2.45rem,6vw,4.4rem)] font-black leading-[1.04] tracking-[-0.045em]"
          >
            Sell crypto &amp; gift cards at{" "}
            <span className="text-[var(--accent)]">rocket speed.</span>
          </motion.h1>

          <motion.p
            variants={rise}
            transition={{ duration: 0.7 }}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] sm:text-base"
          >
            AZIDAN EXCHANGE gives Nigerians a clean, transparent desk for converting Bitcoin, USDT, Ethereum and popular
            gift cards into Naira. See the live rate, calculate your payout, and start your trade in under a minute.
          </motion.p>

          <motion.div variants={rise} transition={{ duration: 0.7 }} className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={() => onStartTrade("crypto")} className="btn btn-primary px-6">
              Trade crypto <ArrowRight size={16} />
            </button>
            <button onClick={() => onStartTrade("gift_card")} className="btn btn-secondary px-6">
              Sell a gift card
            </button>
          </motion.div>

          <motion.div variants={rise} transition={{ duration: 0.7 }} className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {[
              { icon: ShieldCheck, text: "Verified payout desk" },
              { icon: LockKeyhole, text: "Private by design" },
              { icon: Clock3, text: "Minutes, not days" },
            ].map((item) => (
              <span key={item.text} className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
                <item.icon size={15} className="text-[var(--accent)]" /> {item.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-[440px]"
        >
          <div className="panel overflow-hidden p-1">
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-[var(--accent)]" />
                  <span className="text-xs font-bold tracking-wide">DESK STATUS</span>
                </div>
                <span className="badge badge-success"><span className="live-dot" /> Online</span>
              </div>
            </div>

            <div className="space-y-1 p-5">
              {[
                { label: "USDT / NGN", rate: "₦1,520", change: "+0.4%" },
                { label: "BTC / NGN", rate: "₦14,850,000", change: "+1.2%" },
                { label: "Apple Gift Card", rate: "₦1,480", change: "Live" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-lg px-2 py-3 transition hover:bg-[var(--surface-2)]">
                  <span className="text-[13px] font-medium text-[var(--text-soft)]">{row.label}</span>
                  <span className="text-right">
                    <span className="block font-mono text-[13px] font-bold">{row.rate}</span>
                    <span className="block text-[10px] text-[var(--accent)]">{row.change}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mx-5 mb-5 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Supported assets</span>
                <span className="font-mono text-[var(--text)]">{assetCount}</span>
              </div>
              <div className="mt-3 flex gap-1.5">
                {Array.from({ length: 18 }, (_, index) => (
                  <motion.span
                    key={index}
                    className="h-1.5 flex-1 rounded-full bg-[var(--accent)]"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.25 + (index % 4) * 0.2 }}
                    transition={{ delay: 0.45 + index * 0.035, duration: 0.4 }}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Settlement window</span>
                <span className="font-semibold text-[var(--accent)]">5–30 minutes</span>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 -left-4 hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow)] sm:block"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Rate feed</p>
            <p className="mt-1 flex items-center gap-2 text-xs font-bold">
              <span className="live-dot" /> Synchronised
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
