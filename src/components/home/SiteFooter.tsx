import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-soft)]">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <BrandMark />
            <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-[var(--muted)]">
              A professional exchange desk for Nigerians selling crypto and gift cards for Naira.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <LockKeyhole size={13} className="text-[var(--accent)]" /> Private, transparent, accountable.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Trade</p>
            <ul className="mt-4 space-y-2.5 text-[12px] text-[var(--muted)]">
              <li><a href="#rates" className="hover:text-[var(--accent)]">Live rates</a></li>
              <li><a href="#calculator" className="hover:text-[var(--accent)]">Payout calculator</a></li>
              <li><a href="#how-it-works" className="hover:text-[var(--accent)]">How it works</a></li>
              <li><Link href="/track" className="hover:text-[var(--accent)]">Track trade</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Support</p>
            <ul className="mt-4 space-y-2.5 text-[12px] text-[var(--muted)]">
              <li><a href="#support" className="hover:text-[var(--accent)]">Contact us</a></li>
              <li><a href="#support" className="hover:text-[var(--accent)]">FAQs</a></li>
              <li><a href="mailto:support@azidanexchange.com" className="hover:text-[var(--accent)]">Email support</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Desk access</p>
            <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)]">Authorised personnel only.</p>
            <Link href="/admin" className="btn btn-secondary mt-4 px-3.5 py-2 text-[11px]">
              Admin console <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[var(--border)] pt-6 text-[11px] text-[var(--muted)] sm:flex-row">
          <span>© {new Date().getFullYear()} AZIDAN EXCHANGE. All rights reserved.</span>
          <span className="font-mono">Rocket Speed Exchange · Nigeria</span>
        </div>
      </div>
    </footer>
  );
}
