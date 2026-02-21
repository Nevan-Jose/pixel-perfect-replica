import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import HomeStory, { type StoryAnchorItem } from "@/components/home/HomeStory";
import StorySection from "@/components/home/StorySection";
import NewsPanel from "@/components/home/NewsPanel";
import OkxStatsPanel from "@/components/home/OkxStatsPanel";
import StrategyPanel from "@/components/home/StrategyPanel";
import TradeLogsPanel from "@/components/home/TradeLogsPanel";

const ANCHORS: StoryAnchorItem[] = [
  { id: "overview", label: "Overview" },
  { id: "news", label: "News" },
  { id: "okx", label: "OKX" },
  { id: "strategy", label: "Strategy" },
  { id: "logs", label: "Logs" },
];

const MAX_VELOCITY = 1.8;

function dispatchSceneIntensity(intensity: number) {
  window.dispatchEvent(
    new CustomEvent("scene-scroll-intensity", {
      detail: {
        intensity: Math.max(0, Math.min(1, intensity)),
      },
    })
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState<string>(ANCHORS[0].id);
  const lastScrollRef = useRef({ y: 0, t: 0 });

  useEffect(() => {
    document.body.classList.add("landing-page");
    document.documentElement.classList.remove("marketplace-dark");
    return () => {
      document.body.classList.remove("landing-page");
    };
  }, []);

  useEffect(() => {
    lastScrollRef.current = { y: window.scrollY, t: performance.now() };

    let rafId = 0;

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(now - lastScrollRef.current.t, 16);
      const dy = Math.abs(y - lastScrollRef.current.y);
      const velocity = dy / dt;
      const intensity = Math.min(velocity / MAX_VELOCITY, 1);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => dispatchSceneIntensity(intensity));

      lastScrollRef.current = { y, t: now };
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-story-section]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            const nextSection = entry.target.getAttribute("id");
            if (!nextSection) return;
            setActiveSection(nextSection);
            dispatchSceneIntensity(0.5);
          }
        });
      },
      { threshold: [0.45, 0.65] }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="relative min-h-screen"
    >
      <Navbar />

      <HomeStory anchors={ANCHORS} activeAnchor={activeSection}>
        <StorySection
          id="overview"
          eyebrow="Global Trading Layer"
          title="Crypto Intelligence That Moves With The Market"
          description="Track real-time crypto headlines, monitor OKX market flow, design autonomous strategy agents, and audit every execution in one continuous interface while the coin model stays alive in the background."
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5">
            <article className="story-card p-7 sm:p-9">
              <p className="text-[0.66rem] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">Scroll Narrative</p>
              <h3 className="mt-4 text-[clamp(1.4rem,3vw,2.5rem)] leading-tight text-[hsl(var(--foreground))]">
                Apple-style homepage storytelling for your trading product.
              </h3>
              <p className="mt-4 text-[0.94rem] text-[hsl(var(--muted-foreground))] leading-relaxed">
                As users scroll, each full-screen chapter introduces one capability: live crypto news, OKX market stats,
                smart agent strategy creation, and detailed trade logs with personal performance metrics.
              </p>
              <div className="mt-7 flex items-center gap-3 flex-wrap">
                <Link
                  to="/create-agent"
                  className="no-underline px-5 py-2.5 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[0.68rem] uppercase tracking-[0.12em]"
                >
                  Create Agent
                </Link>
                <Link
                  to="/marketplace"
                  className="no-underline px-5 py-2.5 rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] text-[0.68rem] uppercase tracking-[0.12em] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
                >
                  Open Marketplace
                </Link>
              </div>
            </article>

            <aside className="story-card p-7 sm:p-9">
              <p className="text-[0.66rem] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">Scroll Dynamics</p>
              <ul className="mt-5 space-y-3 text-[0.9rem] text-[hsl(var(--muted-foreground))]">
                <li>1. The 3D coin model remains fixed while sections slide over it.</li>
                <li>2. Coin rotation speed scales with scroll velocity in real time.</li>
                <li>3. Section transitions trigger extra momentum pulses.</li>
                <li>4. Data modules auto-refresh with graceful fallback datasets.</li>
              </ul>
              <div className="mt-8 rounded-2xl border border-[hsl(var(--card-border))] bg-white/70 p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Current Section</p>
                <p className="mt-2 text-[1.25rem] text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>
                  {ANCHORS.find((item) => item.id === activeSection)?.label ?? "Overview"}
                </p>
              </div>
            </aside>
          </div>
        </StorySection>

        <StorySection
          id="news"
          eyebrow="01 / Live Headlines"
          title="Crypto News"
          description="Ingest the latest market-moving stories so traders and agents can react faster to macro and token-specific catalysts."
        >
          <NewsPanel />
        </StorySection>

        <StorySection
          id="okx"
          eyebrow="02 / Exchange Pulse"
          title="OKX Market Statistics"
          description="Stream key OKX spot data points to understand trend strength, volatility shifts, and intraday leader rotation before entering positions."
          align="right"
        >
          <OkxStatsPanel />
        </StorySection>

        <StorySection
          id="strategy"
          eyebrow="03 / Agent Studio"
          title="Agent Creation & Smart Strategy"
          description="Transform natural-language strategy ideas into automated agents with structured signal, risk, and execution layers."
        >
          <StrategyPanel />
        </StorySection>

        <StorySection
          id="logs"
          eyebrow="04 / Execution Intelligence"
          title="Trade Logs & User Statistics"
          description="Record each order event and aggregate PnL, win rate, and behavior metrics so users can continuously improve their trading systems."
          align="right"
        >
          <TradeLogsPanel />
        </StorySection>
      </HomeStory>
    </motion.div>
  );
}
