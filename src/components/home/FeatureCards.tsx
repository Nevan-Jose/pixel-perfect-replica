import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface FeatureCard {
  title: string;
  subtitle: string;
  cta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  dark?: boolean;
}

const FEATURES: FeatureCard[] = [
  {
    title: "Live Crypto News",
    subtitle: "Real-time market-moving headlines\nso agents react before the crowd.",
    cta: { label: "Learn more", to: "#news" },
    secondaryCta: { label: "Explore", to: "/marketplace" },
  },
  {
    title: "OKX Market Stats",
    subtitle: "Stream exchange data to spot\ntrend shifts and leader rotation.",
    cta: { label: "Learn more", to: "#okx" },
    dark: true,
  },
  {
    title: "Agent Strategy Studio",
    subtitle: "Transform natural-language ideas\ninto automated trading agents.",
    cta: { label: "Create Agent", to: "/create-agent" },
    secondaryCta: { label: "Browse", to: "/marketplace" },
  },
  {
    title: "Trade Logs & Analytics",
    subtitle: "Record every execution and aggregate\nPnL, win rate, and behavior metrics.",
    cta: { label: "Learn more", to: "#logs" },
    dark: true,
  },
];

const enter = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  viewport: { amount: 0.3, once: true } as const,
};

export default function FeatureCards() {
  return (
    <section className="relative z-[5] px-4 sm:px-6 py-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            {...enter}
            transition={{ ...enter.transition, delay: i * 0.08 }}
            className={`relative rounded-[1.6rem] overflow-hidden flex flex-col items-center justify-center text-center px-8 py-20 sm:py-28 min-h-[420px] ${
              feature.dark
                ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
            }`}
          >
            <h3
              className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {feature.title}
            </h3>
            <p
              className={`mt-3 text-[1rem] sm:text-[1.1rem] leading-relaxed whitespace-pre-line ${
                feature.dark
                  ? "text-[hsl(var(--background)/0.7)]"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {feature.subtitle}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                to={feature.cta.to}
                className={`no-underline px-6 py-2.5 rounded-full text-[0.82rem] font-medium ${
                  feature.dark
                    ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                    : "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                }`}
              >
                {feature.cta.label}
              </Link>
              {feature.secondaryCta && (
                <Link
                  to={feature.secondaryCta.to}
                  className={`no-underline px-6 py-2.5 rounded-full text-[0.82rem] font-medium border ${
                    feature.dark
                      ? "border-[hsl(var(--background)/0.3)] text-[hsl(var(--background))]"
                      : "border-[hsl(var(--card-border))] text-[hsl(var(--foreground))]"
                  }`}
                >
                  {feature.secondaryCta.label}
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
