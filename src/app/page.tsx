"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnnouncementStrip } from "@/components/home/AnnouncementStrip";
import { CalculatorSection } from "@/components/home/CalculatorSection";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RateTicker } from "@/components/home/RateTicker";
import { RatesSection } from "@/components/home/RatesSection";
import { RocketIntro } from "@/components/home/RocketIntro";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { TradeDrawer } from "@/components/home/TradeDrawer";
import { TrackSection } from "@/components/home/TrackSection";
import { TrustSection } from "@/components/home/TrustSection";
import { fetchJson } from "@/lib/client";
import type { Announcement, Asset, AssetKind } from "@/lib/types";

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ kind?: AssetKind; assetId?: number }>({});

  const load = useCallback(async () => {
    try {
      const [assetResult, noticeResult] = await Promise.all([
        fetchJson<{ assets: Asset[] }>("/api/assets"),
        fetchJson<{ announcements: Announcement[] }>("/api/announcements"),
      ]);
      setAssets(assetResult.assets);
      setAnnouncements(noticeResult.announcements);
    } catch {
      /* polling or SSE will retry */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const poll = setInterval(() => void load(), 30_000);
    let stream: EventSource | null = null;
    try {
      stream = new EventSource("/api/stream");
      stream.addEventListener("rates", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as { assets: Asset[] };
          setAssets(data.assets);
          setLoading(false);
        } catch {
          /* ignore malformed event */
        }
      });
      stream.addEventListener("announcements", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as { announcements: Announcement[] };
          setAnnouncements(data.announcements);
        } catch {
          /* ignore malformed event */
        }
      });
    } catch {
      /* polling fallback active */
    }
    return () => {
      clearInterval(poll);
      stream?.close();
    };
  }, [load]);

  const startTrade = useCallback((kind?: AssetKind, assetId?: number) => {
    setPrefill({ kind, assetId });
    setDrawerOpen(true);
  }, []);

  return (
    <>
      <RocketIntro />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
        <SiteHeader onStartTrade={(kind) => startTrade(kind)} />
        <AnnouncementStrip announcements={announcements} />
        <main>
          <Hero onStartTrade={(kind) => startTrade(kind)} assetCount={assets.length} />
          <RateTicker assets={assets} />
          <RatesSection assets={assets} loading={loading} onTrade={(kind, assetId) => startTrade(kind, assetId)} />
          <CalculatorSection assets={assets} onTrade={(kind, assetId) => startTrade(kind, assetId)} />
          <HowItWorks />
          <TrackSection />
          <TrustSection />
        </main>
        <SiteFooter />
      </motion.div>
      <TradeDrawer
        open={drawerOpen}
        assets={assets}
        initialKind={prefill.kind}
        initialAssetId={prefill.assetId}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
