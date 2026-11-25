"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Gift,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { useApp } from "@/components/providers";
import { fetchJson } from "@/lib/client";
import { amount as formatAmount, naira } from "@/lib/format";
import type { Asset, AssetKind } from "@/lib/types";

type Step = 0 | 1 | 2 | 3;
type Success = { reference: string; assetName: string; amount: number; payoutNaira: number };
type FieldErrors = Record<string, string>;

const stepLabels = ["Asset & amount", "Your details", "Payout details", "Review"];

export function TradeDrawer({
  open,
  assets,
  initialKind,
  initialAssetId,
  onClose,
}: {
  open: boolean;
  assets: Asset[];
  initialKind?: AssetKind;
  initialAssetId?: number;
  onClose: () => void;
}) {
  const { toast } = useApp();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
  const [kind, setKind] = useState<AssetKind>(initialKind || "crypto");
  const [assetId, setAssetId] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Bank transfer");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setKind(initialKind || "crypto");
    setAssetId(initialAssetId ?? null);
    setValue("");
    setName("");
    setEmail("");
    setPhone("");
    setPayoutMethod("Bank transfer");
    setAccountNumber("");
    setAccountName("");
    setBankName("");
    setNote("");
    setErrors({});
    setStep(0);
    setDirection(1);
    setSubmitting(false);
    setSuccess(null);
    setCopied(false);
  }, [initialAssetId, initialKind]);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const activeAssets = useMemo(() => assets.filter((asset) => asset.kind === kind && asset.is_active), [assets, kind]);
  const selected = useMemo(
    () => assets.find((asset) => asset.id === assetId) ?? activeAssets[0] ?? null,
    [assets, assetId, activeAssets],
  );
  const numeric = Number(value);
  const validAmount = value !== "" && Number.isFinite(numeric) && numeric > 0;
  const payout = validAmount && selected ? numeric * selected.buy_rate : 0;

  function validate(currentStep: Step): boolean {
    const next: FieldErrors = {};
    if (currentStep === 0) {
      if (!selected) next.asset = "Choose an asset to continue.";
      if (!validAmount) next.amount = "Enter an amount greater than zero.";
      else if (selected && numeric < selected.min_amount) next.amount = `Minimum is ${selected.min_amount} ${selected.kind === "gift_card" ? "USD" : selected.code}.`;
    }
    if (currentStep === 1) {
      if (name.trim().length < 3) next.name = "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
      if (phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid phone number.";
    }
    if (currentStep === 2) {
      if (accountNumber.replace(/\D/g, "").length < 10) next.accountNumber = "Enter a valid account number.";
      if (accountName.trim().length < 3) next.accountName = "Enter the account name.";
      if (payoutMethod === "Bank transfer" && bankName.trim().length < 2) next.bankName = "Enter your bank name.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function advance() {
    if (!validate(step)) return;
    setDirection(1);
    setStep((current) => Math.min(3, current + 1) as Step);
  }

  function back() {
    setDirection(-1);
    setStep((current) => Math.max(0, current - 1) as Step);
  }

  async function submit() {
    if (!selected || !validate(0) || !validate(1) || !validate(2) || submitting) return;
    setSubmitting(true);
    try {
      const result = await fetchJson<Success>("/api/trades", {
        method: "POST",
        body: JSON.stringify({
          kind: selected.kind,
          assetId: selected.id,
          amount: Number(numeric.toFixed(8)),
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          payoutMethod,
          accountNumber,
          accountName,
          bankName: payoutMethod === "Bank transfer" ? bankName : "",
          note,
        }),
      });
      setSuccess(result);
      toast("Trade submitted successfully.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not submit your trade.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const copyReference = async () => {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Copy is unavailable in this browser.", "error");
    }
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 24, filter: "blur(4px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24, filter: "blur(4px)" }),
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Start a trade">
          <motion.div
            className="absolute inset-0 bg-[#101828]/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-[var(--border)] bg-[var(--bg)] shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-7">
              <div>
                <p className="eyebrow text-[10px]">Secure trade desk</p>
                <h2 className="mt-1 text-lg font-bold">{success ? "Trade submitted" : "Start a trade"}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close trade form"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                <X size={17} />
              </button>
            </div>

            {!success && (
              <div className="border-b border-[var(--border)] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-1.5">
                  {stepLabels.map((label, index) => (
                    <div key={label} className="flex flex-1 flex-col gap-1.5">
                      <div className={`h-1 rounded-full transition-colors ${index <= step ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]"}`} />
                      <span className={`hidden text-[9px] font-semibold uppercase tracking-wider sm:block ${index <= step ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              <AnimatePresence mode="wait" custom={direction}>
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-full flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
                      className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent-soft)]"
                    >
                      <motion.span
                        className="absolute inset-0 rounded-full border border-[var(--accent)]"
                        animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                        transition={{ duration: 1.3, repeat: Infinity }}
                      />
                      <CheckCircle2 size={44} className="text-[var(--accent)]" />
                    </motion.div>
                    <h3 className="mt-7 text-2xl font-bold">Trade received</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                      Your {success.assetName} trade is now pending review. Keep the reference below to track progress.
                    </p>
                    <div className="panel mt-7 w-full max-w-sm p-5 text-left">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Trade reference</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="font-mono text-base font-bold tracking-tight">{success.reference}</span>
                        <button onClick={copyReference} className="btn btn-ghost min-h-8 px-2.5 text-xs" aria-label="Copy trade reference">
                          {copied ? <Check size={15} className="text-[var(--accent)]" /> : <ClipboardCheck size={15} />}
                        </button>
                      </div>
                      <div className="divider my-4" />
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--muted)]">Amount</span>
                        <span className="font-mono font-semibold">{formatAmount(success.amount, 8)}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-[var(--muted)]">Expected payout</span>
                        <span className="font-mono font-semibold text-[var(--accent)]">{naira(success.payoutNaira)}</span>
                      </div>
                    </div>
                    <div className="mt-7 flex w-full max-w-sm flex-col gap-2">
                      <a href={`/track?reference=${success.reference}`} className="btn btn-primary w-full" onClick={onClose}>
                        Track this trade <ArrowRight size={15} />
                      </a>
                      <button onClick={onClose} className="btn btn-ghost w-full">Back to rates</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {step === 0 && (
                      <div className="space-y-6">
                        <div>
                          <p className="field-label">What are you selling?</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(["crypto", "gift_card"] as AssetKind[]).map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setKind(option);
                                  setAssetId(null);
                                  setValue("");
                                }}
                                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                  kind === option
                                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
                                }`}
                              >
                                {option === "crypto" ? <Coins size={17} /> : <Gift size={17} />}
                                {option === "crypto" ? "Crypto" : "Gift card"}
                              </button>
                            ))}
                          </div>
                          {errors.asset && <p className="field-error">{errors.asset}</p>}
                        </div>

                        <div>
                          <p className="field-label">Select asset</p>
                          <div className="grid max-h-[260px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                            {activeAssets.map((asset) => (
                              <button
                                key={asset.id}
                                onClick={() => setAssetId(asset.id)}
                                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                  selected?.id === asset.id
                                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                                }`}
                              >
                                <AssetIcon code={asset.code} size={34} />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[13px] font-semibold">{asset.name}</span>
                                  <span className="block truncate font-mono text-[11px] text-[var(--accent)]">{naira(asset.buy_rate)}</span>
                                </span>
                                {selected?.id === asset.id && <Check size={15} className="shrink-0 text-[var(--accent)]" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="field-label" htmlFor="trade-amount">Amount you are selling</label>
                          <div className="relative">
                            <input
                              id="trade-amount"
                              inputMode="decimal"
                              className="input pr-20 font-mono text-base"
                              placeholder="0.00"
                              value={value}
                              onChange={(event) => {
                                setValue(event.target.value.replace(/[^\d.]/g, ""));
                                setErrors((current) => ({ ...current, amount: "" }));
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[var(--muted)]">
                              {selected?.kind === "gift_card" ? "USD" : selected?.code || "—"}
                            </span>
                          </div>
                          {errors.amount ? (
                            <p className="field-error">{errors.amount}</p>
                          ) : (
                            <p className="field-hint">
                              {selected ? `Minimum ${selected.min_amount} ${selected.kind === "gift_card" ? "USD face value" : selected.code}` : "Select an asset first"}
                            </p>
                          )}
                        </div>

                        <div className="panel-soft flex items-center justify-between p-4">
                          <span className="text-xs text-[var(--muted)]">Estimated payout</span>
                          <span className="font-mono text-lg font-bold text-[var(--accent)]">{naira(payout)}</span>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-5">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs leading-relaxed text-[var(--muted)]">
                          <LockKeyhole size={15} className="mb-2 text-[var(--accent)]" />
                          Your details are used only to process and confirm this trade.
                        </div>
                        <div>
                          <label className="field-label" htmlFor="trade-name">Full name</label>
                          <input id="trade-name" className="input" placeholder="Ada Okafor" value={name} onChange={(e) => setName(e.target.value)} />
                          {errors.name && <p className="field-error">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="field-label" htmlFor="trade-email">Email address</label>
                          <input id="trade-email" type="email" className="input" placeholder="ada@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                          {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="field-label" htmlFor="trade-phone">Phone number</label>
                          <input id="trade-phone" inputMode="tel" className="input" placeholder="+234 801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                          {errors.phone && <p className="field-error">{errors.phone}</p>}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-5">
                        <div>
                          <label className="field-label" htmlFor="trade-method">Payout method</label>
                          <select id="trade-method" className="select" value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
                            <option>Bank transfer</option>
                            <option>OPay</option>
                            <option>Moniepoint</option>
                            <option>Palmpay</option>
                            <option>Kuda</option>
                            <option>Other wallet</option>
                          </select>
                        </div>
                        <div>
                          <label className="field-label" htmlFor="trade-account">Account number</label>
                          <input id="trade-account" inputMode="numeric" className="input font-mono" placeholder="0123456789" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                          {errors.accountNumber && <p className="field-error">{errors.accountNumber}</p>}
                        </div>
                        <div>
                          <label className="field-label" htmlFor="trade-account-name">Account name</label>
                          <input id="trade-account-name" className="input" placeholder="Ada Okafor" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                          {errors.accountName && <p className="field-error">{errors.accountName}</p>}
                        </div>
                        {payoutMethod === "Bank transfer" && (
                          <div>
                            <label className="field-label" htmlFor="trade-bank">Bank name</label>
                            <input id="trade-bank" className="input" placeholder="e.g. Access Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                            {errors.bankName && <p className="field-error">{errors.bankName}</p>}
                          </div>
                        )}
                        <div>
                          <label className="field-label" htmlFor="trade-note">Note (optional)</label>
                          <textarea id="trade-note" className="textarea" placeholder="Anything our desk should know…" value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="panel-soft overflow-hidden">
                          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                            <div className="flex items-center gap-3">
                              {selected && <AssetIcon code={selected.code} size={38} />}
                              <div>
                                <p className="text-sm font-bold">{selected?.name}</p>
                                <p className="text-[11px] text-[var(--muted)]">{selected?.network}</p>
                              </div>
                            </div>
                            <span className="badge badge-success">Live rate</span>
                          </div>
                          <div className="space-y-2.5 p-4 text-[13px]">
                            {[
                              ["Amount", selected ? `${formatAmount(numeric, 8)} ${selected.kind === "gift_card" ? "USD" : selected.code}` : "—"],
                              ["Buying rate", selected ? naira(selected.buy_rate) : "—"],
                              ["You receive", naira(payout)],
                            ].map(([label, value]) => (
                              <div key={label} className="flex justify-between gap-3">
                                <span className="text-[var(--muted)]">{label}</span>
                                <span className={`font-mono font-semibold ${label === "You receive" ? "text-[var(--accent)]" : ""}`}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="panel-soft space-y-2.5 p-4 text-[13px]">
                          {[
                            ["Name", name],
                            ["Email", email],
                            ["Phone", phone],
                            ["Payout to", `${payoutMethod} · ${accountNumber}`],
                            ["Account name", accountName],
                            ...(bankName ? [["Bank", bankName]] : []),
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3">
                              <span className="text-[var(--muted)]">{label}</span>
                              <span className="max-w-[60%] truncate text-right font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--muted)]">
                          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                          By submitting, you confirm the details above are correct. Our desk will review your trade and update its status.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!success && (
              <div className="flex items-center gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-7">
                {step > 0 && (
                  <button onClick={back} className="btn btn-secondary px-4" disabled={submitting}>
                    <ArrowLeft size={15} /> Back
                  </button>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <span className="hidden font-mono text-xs text-[var(--muted)] sm:block">{naira(payout)}</span>
                  {step < 3 ? (
                    <button onClick={advance} className="btn btn-primary px-5">
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button onClick={submit} className="btn btn-primary px-5" disabled={submitting}>
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit trade <Check size={16} /></>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
