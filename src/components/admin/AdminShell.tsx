"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  Coins,
  ExternalLink,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useApp } from "@/components/providers";
import { fetchJson } from "@/lib/client";
import type { AdminUser } from "@/lib/types";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/rates", label: "Rate management", icon: Coins },
  { href: "/admin/trades", label: "Trades", icon: Activity },
  { href: "/admin/history", label: "Rate history", icon: History },
  { href: "/admin/announcements", label: "Announcements", icon: BellRing },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useApp();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      setChecking(false);
      return;
    }
    let active = true;
    fetchJson<{ admin: AdminUser }>("/api/admin/me")
      .then((result) => {
        if (active) setAdmin(result.admin);
      })
      .catch(() => {
        if (active) router.replace("/admin/login");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [isLogin, pathname, router]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (isLogin) return <>{children}</>;

  const current = nav.find((item) => item.href === pathname) || nav[0];

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="text-xs tracking-[0.16em] text-[var(--muted)]">VERIFYING DESK ACCESS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
        <div className="border-b border-[var(--border)] px-5 py-5">
          <BrandMark href="/" />
          <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--accent-soft)] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            <ShieldCheck size={11} /> Admin console
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Admin navigation">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                  active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }`}
              >
                <item.icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
            <ExternalLink size={16} /> View public site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--red)_10%,transparent)] hover:text-[var(--red)]">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} className="absolute inset-y-0 left-0 w-[250px] border-r border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <BrandMark href="/" size="sm" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="text-[var(--muted)]"><X size={18} /></button>
              </div>
              <nav className="mt-6 space-y-1">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === item.href ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                    <item.icon size={16} /> {item.label}
                  </Link>
                ))}
              </nav>
              <button onClick={logout} className="mt-6 flex items-center gap-3 px-3 text-sm text-[var(--muted)]"><LogOut size={16} /> Sign out</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-soft)_85%,transparent)] px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] lg:hidden"><Menu size={17} /></button>
            <div>
              <h1 className="text-base font-bold tracking-tight">{current.label}</h1>
              <p className="hidden text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] sm:block">AZIDAN Exchange · Desk operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--text)]">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link href="/" target="_blank" className="btn btn-secondary hidden min-h-9 px-3 text-xs sm:inline-flex">Public site <ArrowUpRight size={14} /></Link>
            <div className="ml-1 hidden h-9 items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">
                {(admin?.full_name || "A").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-[11px] font-semibold">{admin?.full_name || "Administrator"}</span>
            </div>
          </div>
        </header>
        <main className="px-4 py-7 sm:px-7 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
