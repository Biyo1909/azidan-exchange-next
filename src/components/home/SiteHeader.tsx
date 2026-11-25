"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useApp } from "@/components/providers";
import type { AssetKind } from "@/lib/types";

const links = [
  { label: "Rates", href: "#rates" },
  { label: "Calculator", href: "#calculator" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Track trade", href: "#track" },
  { label: "Support", href: "#support" },
];

export function SiteHeader({ onStartTrade }: { onStartTrade: (kind?: AssetKind) => void }) {
  const { theme, toggleTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <BrandMark />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => onStartTrade()} className="btn btn-primary hidden min-h-9 px-4 text-xs sm:inline-flex">
            Start trade <ArrowRight size={15} />
          </button>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] lg:hidden"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] lg:hidden"
          >
            <nav className="container-x flex flex-col gap-1 py-4" aria-label="Mobile navigation">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-[var(--text-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onStartTrade();
                }}
                className="btn btn-primary mt-2 w-full"
              >
                Start trade <ArrowRight size={15} />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
