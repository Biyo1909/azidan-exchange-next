"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useApp } from "@/components/providers";
import { fetchJson } from "@/lib/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson("/api/admin/me").then(() => router.replace("/admin")).catch(() => {});
  }, [router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetchJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      toast("Welcome back to the desk.", "success");
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <div className="hidden border-r border-[var(--border)] bg-[var(--bg-soft)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <BrandMark size="lg" href={null} />
        </div>
        <div className="max-w-md">
          <span className="badge badge-info"><ShieldCheck size={12} /> Restricted access</span>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.045em] text-[var(--text)]">
            The desk behind every rate.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            Manage live buying rates, review trades and keep a complete audit trail of every change from one secure console.
          </p>
          <div className="mt-9 space-y-3">
            {["Live rate propagation to the public site", "Full rate-change accountability", "Trade approval and payout control"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-[13px] text-[var(--text-soft)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
                  <ShieldCheck size={12} className="text-[var(--accent)]" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">AZIDAN Exchange · Operations</p>
      </div>

      <div className="flex flex-col bg-[var(--bg)] px-5 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><BrandMark href="/" /></div>
          <Link href="/" className="btn btn-ghost px-2 text-xs"><ArrowLeft size={14} /> Back to site</Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[400px]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <LockKeyhole size={20} className="text-[var(--accent)]" />
            </span>
            <h1 className="mt-6 text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-[-0.04em]">Sign in to the desk</h1>
            <p className="mt-2 text-[13px] text-[var(--muted)]">Use your administrator credentials to continue.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <label className="field-label" htmlFor="admin-username">Username</label>
                <div className="relative">
                  <UserRound size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="admin-username" autoComplete="username" className="input pl-10" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="admin-password">Password</label>
                <div className="relative">
                  <KeyRound size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input id="admin-password" type="password" autoComplete="current-password" className="input pl-10" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-lg border border-[color-mix(in_srgb,var(--red)_24%,transparent)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)] px-3 py-2.5 text-[12px] text-[var(--red)]">
                  {error}
                </motion.p>
              )}
              <button className="btn btn-primary w-full" disabled={loading} type="submit">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : <>Sign in securely <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Default seeded access</p>
              <p className="mt-2 font-mono text-[12px] text-[var(--text-soft)]">admin / Azidan@2026</p>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                Change this via <code className="font-mono text-[var(--accent)]">ADMIN_PASSWORD</code> before deployment.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
