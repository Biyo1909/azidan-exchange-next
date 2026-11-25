"use client";

import { motion } from "framer-motion";
import { Calculator, ClipboardList, Send, Wallet } from "lucide-react";

const steps = [
  { number: "01", icon: ClipboardList, title: "Choose your asset", text: "Pick a supported crypto or gift card from the live rate board." },
  { number: "02", icon: Calculator, title: "Calculate your payout", text: "Enter your amount and see exactly what you'll receive in Naira." },
  { number: "03", icon: Send, title: "Submit your trade", text: "Share your contact and payout details. We review every trade personally." },
  { number: "04", icon: Wallet, title: "Get paid", text: "Track Pending → Processing → Paid and receive Naira in your account." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container-x scroll-mt-24 py-16 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
        <span className="eyebrow justify-center">Simple by design</span>
        <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.75rem)] font-bold tracking-[-0.035em]">Four steps from asset to Naira.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          No confusing forms, no hidden deductions. A clear process built for speed and accountability.
        </p>
      </motion.div>

      <div className="relative mt-12 grid gap-5 md:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-9 hidden h-px bg-[linear-gradient(90deg,transparent,var(--border),var(--border),transparent)] md:block" />
        {steps.map((step, index) => (
          <motion.article
            key={step.number}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative text-center"
          >
            <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
              <step.icon size={25} className="text-[var(--accent)]" />
            </div>
            <p className="mt-5 font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">STEP {step.number}</p>
            <h3 className="mt-2 text-[15px] font-bold">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-[220px] text-[12px] leading-relaxed text-[var(--muted)]">{step.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
