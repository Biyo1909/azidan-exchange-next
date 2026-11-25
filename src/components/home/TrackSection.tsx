"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TradeTracker } from "@/components/TradeTracker";

export function TrackSection() {
  return (
    <section id="track" className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface)]/45 py-16 lg:py-24">
      <div className="container-x grid gap-9 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="eyebrow"><Activity size={13} /> Trade tracking</span>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.75rem)] font-bold tracking-[-0.035em]">
            Always know where your trade stands.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Every trade moves through a visible status pipeline. Enter the reference from your confirmation screen to see
            the latest update — no account required.
          </p>
          <div className="mt-6 space-y-3">
            {[
              ["Pending", "Received and awaiting desk review"],
              ["Processing", "Verification and payout preparation"],
              ["Paid", "Naira sent to your payout details"],
            ].map(([label, text]) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                <p className="text-[13px]"><strong className="font-bold">{label}</strong> <span className="text-[var(--muted)]">— {text}</span></p>
              </div>
            ))}
          </div>
          <Link href="/track" className="btn btn-ghost mt-6 px-0 text-xs">
            Open full tracker <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="panel p-5 sm:p-7">
          <TradeTracker />
        </motion.div>
      </div>
    </section>
  );
}
