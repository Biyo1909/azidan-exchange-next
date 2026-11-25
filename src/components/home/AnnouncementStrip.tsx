"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useState } from "react";
import type { Announcement } from "@/lib/types";

export function AnnouncementStrip({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = announcements.filter((item) => !dismissed.includes(item.id)).slice(0, 2);
  if (!visible.length) return null;

  return (
    <div className="container-x mt-5 space-y-2">
      <AnimatePresence initial={false}>
        {visible.map((item) => {
          const Icon = item.tone === "warning" ? AlertTriangle : item.tone === "success" ? CheckCircle2 : Info;
          const tone =
            item.tone === "warning"
              ? "text-[var(--amber)] border-[color-mix(in_srgb,var(--amber)_28%,transparent)] bg-[color-mix(in_srgb,var(--amber)_8%,transparent)]"
              : item.tone === "success"
                ? "text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_24%,transparent)] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]"
                : "text-[var(--blue)] border-[color-mix(in_srgb,var(--blue)_26%,transparent)] bg-[color-mix(in_srgb,var(--blue)_7%,transparent)]";
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${tone}`}
              role="status"
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-[13px] leading-relaxed">
                <strong className="font-bold">{item.title}:</strong>{" "}
                <span className="opacity-85">{item.body}</span>
              </p>
              <button
                onClick={() => setDismissed((current) => [...current, item.id])}
                aria-label={`Dismiss ${item.title}`}
                className="opacity-60 transition hover:opacity-100"
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
