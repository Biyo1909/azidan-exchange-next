"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const STORAGE_KEY = "azidan-intro-seen";

function Patch({ x, y, fill, label, ring = "#ffffff" }: { x: number; y: number; fill: string; label: string; ring?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="11" fill="#7d8b9c" opacity="0.35" />
      <circle r="9.5" fill={fill} stroke={ring} strokeWidth="1.6" />
      <circle r="7.2" fill="none" stroke={ring} strokeWidth="0.6" opacity="0.65" />
      <text y="3.6" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff" fontFamily="Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function Rocket({ ignited }: { ignited: boolean }) {
  return (
    <svg width="156" height="340" viewBox="0 0 160 340" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="az-body" x1="38" y1="0" x2="122" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b9c6d5" />
          <stop offset="0.2" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#f4f7fb" />
          <stop offset="1" stopColor="#a9b8c9" />
        </linearGradient>
        <linearGradient id="az-nose" x1="80" y1="20" x2="80" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eef2f7" />
          <stop offset="1" stopColor="#c7d3e1" />
        </linearGradient>
        <linearGradient id="az-fin" x1="12" y1="230" x2="148" y2="310" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b5c3d3" />
          <stop offset="1" stopColor="#79899c" />
        </linearGradient>
        <linearGradient id="az-metal" x1="56" y1="294" x2="104" y2="330" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9aa9bb" />
          <stop offset="0.5" stopColor="#e7edf5" />
          <stop offset="1" stopColor="#8494a7" />
        </linearGradient>
        <radialGradient id="az-window" cx="0.35" cy="0.3" r="0.8">
          <stop stopColor="#7db8f7" />
          <stop offset="0.55" stopColor="#1e5aa8" />
          <stop offset="1" stopColor="#0b2547" />
        </radialGradient>
        <linearGradient id="az-flame" x1="80" y1="326" x2="80" y2="410" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.22" stopColor="#9dd2ff" />
          <stop offset="0.55" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
        <filter id="az-shadow" x="20" y="0" width="120" height="340" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Engine plume and ignition */}
      {ignited && (
        <g style={{ animation: "flame-flicker 0.16s ease-in-out infinite", transformOrigin: "80px 326px" }}>
          <path d="M62 326 C62 350 68 374 80 404 C92 374 98 350 98 326 Z" fill="url(#az-flame)" />
          <path d="M70 326 C70 342 74 358 80 376 C86 358 90 342 90 326 Z" fill="#dbeafe" opacity="0.95" />
          <ellipse cx="80" cy="330" rx="20" ry="7" fill="#ffffff" opacity="0.85" />
        </g>
      )}

      <g filter="url(#az-shadow)">
        {/* Fins behind the fuselage */}
        <path d="M45 218 C29 236 18 268 14 310 L46 294 Z" fill="url(#az-fin)" stroke="#7a8a9c" strokeWidth="1" />
        <path d="M115 218 C131 236 142 268 146 310 L114 294 Z" fill="url(#az-fin)" stroke="#7a8a9c" strokeWidth="1" />
        <path d="M74 288 L86 288 L90 322 L70 322 Z" fill="#8797a9" />

        {/* Main body */}
        <path
          d="M80 22 C104 52 116 94 116 140 L116 260 C116 284 100 304 80 304 C60 304 44 284 44 260 L44 140 C44 94 56 52 80 22 Z"
          fill="url(#az-body)"
          stroke="#9dabbc"
          strokeWidth="1.2"
        />
        <path d="M80 22 C100 50 112 90 116 124 L44 124 C48 90 60 50 80 22 Z" fill="url(#az-nose)" stroke="#9dabbc" strokeWidth="1" />
        <path d="M44 124 H116 V132 H44 Z" fill="#2563eb" opacity="0.9" />
        <path d="M44 132 H116 V136 H44 Z" fill="#1e40af" opacity="0.55" />

        {/* Subtle panel lines and highlights */}
        <path d="M52 150 H108 M52 282 H108" stroke="#aebbc9" strokeWidth="0.8" opacity="0.65" />
        <path d="M57 46 C48 83 46 122 46 174" stroke="#ffffff" strokeWidth="2.4" opacity="0.55" strokeLinecap="round" />
        <circle cx="53" cy="145" r="1.5" fill="#94a3b8" />
        <circle cx="107" cy="145" r="1.5" fill="#94a3b8" />
        <circle cx="53" cy="246" r="1.5" fill="#94a3b8" />
        <circle cx="107" cy="246" r="1.5" fill="#94a3b8" />

        {/* Cockpit window */}
        <circle cx="80" cy="96" r="20" fill="#8090a2" />
        <circle cx="80" cy="96" r="16.5" fill="url(#az-window)" stroke="#e6edf5" strokeWidth="2" />
        <path d="M70 90 C73 85 79 83 84 84" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />

        {/* Asset patches on the fuselage: crypto + gift cards */}
        <Patch x={80} y={158} fill="#f7931a" label="₿" />
        <Patch x={62} y={186} fill="#627eea" label="Ξ" />
        <Patch x={98} y={186} fill="#26a17b" label="₮" />
        <Patch x={62} y={214} fill="#f3ba2f" label="◆" ring="#f7f9fc" />
        <Patch x={98} y={214} fill="#8b5cf6" label="S" ring="#f7f9fc" />
        <Patch x={62} y={242} fill="#111827" label="A" />
        <Patch x={98} y={242} fill="#232f3e" label="a" />
        <g transform="translate(80 270)">
          <circle r="11" fill="#7d8b9c" opacity="0.3" />
          <circle r="9.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.6" />
          <path d="M-5 -2 H5 V0 H-5 Z M-1 -2 H1 V4 H-1 Z" fill="#ffffff" opacity="0.95" />
          <path d="M-4.6 0 H4.6 V4.2 H-4.6 Z" fill="none" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
        </g>

        {/* Engine bell */}
        <path d="M64 296 H96 L102 326 H58 Z" fill="url(#az-metal)" stroke="#7d8b9c" strokeWidth="1" />
        <ellipse cx="80" cy="326" rx="21" ry="5" fill="#4b5b6d" />
        <ellipse cx="80" cy="327" rx="14" ry="3" fill="#1f2937" opacity="0.75" />
      </g>
    </svg>
  );
}

export function RocketIntro() {
  const reduceMotion = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const [ignited, setIgnited] = useState(false);
  const [connected, setConnected] = useState(false);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setFinished(true);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    if (seen || reduceMotion) {
      setFinished(true);
      return;
    }
    const ignitionTimer = setTimeout(() => setIgnited(true), 520);
    const connectedTimer = setTimeout(() => setConnected(true), 2300);
    const doneTimer = setTimeout(finish, 3600);
    return () => {
      clearTimeout(ignitionTimer);
      clearTimeout(connectedTimer);
      clearTimeout(doneTimer);
    };
  }, [finish, reduceMotion]);

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          key="rocket-intro"
          role="dialog"
          aria-label="AZIDAN Exchange launch sequence"
          className="fixed inset-0 z-[200] overflow-hidden bg-[var(--bg)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 45% at 50% 8%, var(--accent-soft), transparent 72%)" }}
          />

          {/* Clean horizon and low clouds */}
          <div className="absolute inset-x-0 bottom-0 h-[34vh] border-t border-[var(--border)] bg-[var(--bg-soft)]" />
          {[
            { left: "8%", bottom: "12%", width: 260, height: 46, opacity: 0.65 },
            { left: "62%", bottom: "16%", width: 320, height: 52, opacity: 0.55 },
            { left: "34%", bottom: "4%", width: 380, height: 60, opacity: 0.75 },
          ].map((cloud, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-[var(--surface)] blur-xl"
              style={{
                left: cloud.left,
                bottom: cloud.bottom,
                width: cloud.width,
                height: cloud.height,
                opacity: cloud.opacity,
              }}
            />
          ))}

          <button
            onClick={finish}
            className="absolute right-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[11px] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            Skip intro <ArrowUpRight size={13} />
          </button>

          <motion.div
            className="relative z-10 h-full w-full"
            animate={ignited ? { x: [0, 1.2, -1, 0.6, 0] } : { x: 0 }}
            transition={{ duration: 2.6, delay: 0.52, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute bottom-[8%] left-1/2 -translate-x-1/2"
              initial={{ y: "10vh", scale: 1, opacity: 0 }}
              animate={{
                y: ["10vh", "7vh", "-16vh", "-56vh", "-100vh"],
                x: ["0vw", "-0.35vw", "0.25vw", "0vw", "0vw"],
                scale: [1, 1, 0.98, 0.9, 0.82],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{ duration: 3, delay: 0.5, times: [0, 0.12, 0.36, 0.72, 1], ease: "easeIn" }}
            >
              {/* Exhaust cloud follows the rocket */}
              <motion.div
                className="pointer-events-none absolute left-1/2 top-[300px] -translate-x-1/2"
                initial={{ opacity: 0, scaleY: 0.3 }}
                animate={{ opacity: ignited ? [0, 0.8, 0.55, 0] : 0, scaleY: [0.3, 1, 1.8, 2.4] }}
                transition={{ duration: 2.7, delay: 0.55, ease: "easeOut" }}
              >
                {[
                  { x: -34, y: 12, size: 52 },
                  { x: 12, y: 28, size: 68 },
                  { x: -12, y: 52, size: 80 },
                  { x: 34, y: 72, size: 58 },
                ].map((puff, index) => (
                  <span
                    key={index}
                    className="absolute rounded-full bg-[var(--muted)] blur-lg"
                    style={{ left: puff.x, top: puff.y, width: puff.size, height: puff.size * 0.62, opacity: 0.28 }}
                  />
                ))}
              </motion.div>

              <Rocket ignited={ignited} />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute inset-x-0 bottom-[24%] z-20 flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.28, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.5 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]"
            >
              <span className="live-dot" /> Exchange desk online
            </motion.p>
            <h1 className="reveal-text text-[clamp(1.9rem,6vw,3.6rem)] font-black tracking-[-0.045em] text-[var(--text)]">
              AZIDAN EXCHANGE
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.6 }}
              className="mt-3 text-[clamp(0.7rem,2vw,0.95rem)] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
            >
              Rocket Speed Exchange
            </motion.p>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-7">
            <div className="mx-auto max-w-md">
              <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
                <span>Launch sequence</span>
                <span className={connected ? "text-[var(--accent)]" : ""}>{connected ? "Connected" : "Igniting"}</span>
              </div>
              <motion.div
                className="h-1 w-full origin-left rounded-full bg-[var(--accent)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, delay: 0.5, ease: [0.22, 0.8, 0.2, 1] }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
