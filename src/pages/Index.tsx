import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import FeatureCards from "@/components/home/FeatureCards";
import HomeStory, { type StoryAnchorItem } from "@/components/home/HomeStory";
import StorySection from "@/components/home/StorySection";
import NewsPanel from "@/components/home/NewsPanel";
import OkxStatsPanel from "@/components/home/OkxStatsPanel";
import StrategyPanel from "@/components/home/StrategyPanel";
import TradeLogsPanel from "@/components/home/TradeLogsPanel";

const ANCHORS: StoryAnchorItem[] = [
  { id: "features", label: "Features" },
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
        <section id="features" data-story-section className="min-h-[60vh] pt-[100vh]">
          <FeatureCards />
        </section>

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
