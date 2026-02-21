import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/home/FeatureCards";
import HomeStory, { type StoryAnchorItem } from "@/components/home/HomeStory";
import StorySection from "@/components/home/StorySection";
import NewsPanel from "@/components/home/NewsPanel";

const ANCHORS: StoryAnchorItem[] = [
  { id: "features", label: "Features" },
  { id: "news", label: "News" },
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
      <Hero />

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
      </HomeStory>
    </motion.div>
  );
}
