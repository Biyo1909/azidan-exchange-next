"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsUpDown, Headphones, LockKeyhole, Mail, MessageCircle, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How long does a payout take?",
    answer: "Once your trade is approved and marked processing, payouts are typically completed within 5–30 minutes, provided your payout details are correct.",
  },
  {
    question: "Are there hidden charges?",
    answer: "No. The rate shown is the rate used to calculate your payout. The calculator shows the exact Naira amount before you submit.",
  },
  {
    question: "Which gift cards do you accept?",
    answer: "We currently support Apple, Amazon, Steam, Google Play, iTunes, Walmart and eBay cards. Availability can change, so check the live rate board before trading.",
  },
  {
    question: "What if my trade is rejected?",
    answer: "A rejected trade means the details could not be verified or the asset was unavailable. Contact support with your reference and we'll help you resolve it.",
  },
];

export function TrustSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="support" className="container-x scroll-mt-24 py-16 lg:py-24">
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Transparent rates", text: "One clear buying rate per asset, updated by our desk and reflected instantly." },
          { icon: LockKeyhole, title: "Private by design", text: "Your trade details are only used to review and settle that trade." },
          { icon: TrendingUp, title: "Accountable history", text: "Every rate change is logged with who made it and when." },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="panel p-5"
          >
            <item.icon size={20} className="text-[var(--accent)]" />
            <h3 className="mt-4 text-sm font-bold">{item.title}</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--muted)]">{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_.85fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="eyebrow">Frequently asked</span>
          <h2 className="mt-3 text-[clamp(1.7rem,3.5vw,2.4rem)] font-bold tracking-[-0.035em]">Good questions, clear answers.</h2>
          <div className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {faqs.map((faq, index) => (
              <div key={faq.question}>
                <button
                  onClick={() => setOpen(open === index ? null : index)}
                  aria-expanded={open === index}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold transition hover:text-[var(--accent)]"
                >
                  {faq.question}
                  <ChevronsUpDown size={15} className={`shrink-0 text-[var(--muted)] transition-transform ${open === index ? "rotate-180 text-[var(--accent)]" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 pr-8 text-[13px] leading-relaxed text-[var(--muted)]">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          id="support-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7"
        >
          <Headphones size={24} className="text-[var(--accent)]" />
          <h3 className="mt-5 text-xl font-bold tracking-tight">Need a human?</h3>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--muted)]">
            Our support desk is ready to help with trade questions, rate checks and verification issues.
          </p>
          <div className="mt-6 space-y-2.5">
            <a href="mailto:support@azidanexchange.com" className="btn btn-secondary w-full justify-start">
              <Mail size={16} /> support@azidanexchange.com
            </a>
            <a href="https://wa.me/2348012345678" target="_blank" rel="noreferrer" className="btn btn-secondary w-full justify-start">
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>
          <p className="mt-5 text-[11px] text-[var(--muted)]">
            For trade issues, include your reference number for a faster reply.
          </p>
          <Link href="/track" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] hover:underline">
            Track an existing trade →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
