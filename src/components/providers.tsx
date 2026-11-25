"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type Theme = "dark" | "light";
type Tone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: Tone };

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  toast: (message: string, tone?: Tone) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside Providers");
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const stored = (localStorage.getItem("azidan-theme") as Theme | null) || "light";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("azidan-theme", next);
      return next;
    });
  }, []);

  const toast = useCallback((message: string, tone: Tone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, toast }), [theme, toggleTheme, toast]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? AlertCircle : Info;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="panel pointer-events-auto flex items-start gap-3 px-4 py-3.5"
                role="status"
              >
                <Icon
                  size={18}
                  className={
                    item.tone === "success"
                      ? "mt-0.5 shrink-0 text-[var(--accent)]"
                      : item.tone === "error"
                        ? "mt-0.5 shrink-0 text-[var(--red)]"
                        : "mt-0.5 shrink-0 text-[var(--blue)]"
                  }
                />
                <p className="flex-1 text-[13px] leading-relaxed text-[var(--text-soft)]">{item.message}</p>
                <button
                  aria-label="Dismiss notification"
                  onClick={() => setToasts((current) => current.filter((entry) => entry.id !== item.id))}
                  className="text-[var(--muted)] transition hover:text-[var(--text)]"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}
