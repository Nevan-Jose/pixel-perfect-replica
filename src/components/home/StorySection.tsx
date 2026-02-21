import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StorySectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  align?: "left" | "right";
}

const enter = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export default function StorySection({
  id,
  eyebrow,
  title,
  description,
  children,
  align = "left",
}: StorySectionProps) {
  return (
    <section
      id={id}
      data-story-section
      className="relative z-[5] min-h-screen flex items-center px-6 sm:px-10 lg:px-16 py-28"
    >
      <div className={`w-full max-w-[1300px] mx-auto ${align === "right" ? "text-right" : "text-left"}`}>
        <motion.p
          {...enter}
          viewport={{ amount: 0.55, once: false }}
          className="text-[0.68rem] uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))]"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          {...enter}
          viewport={{ amount: 0.5, once: false }}
          transition={{ ...enter.transition, delay: 0.08 }}
          className="mt-3 text-[clamp(2rem,5vw,4.4rem)] leading-[1.02] text-[hsl(var(--foreground))]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </motion.h2>
        <motion.p
          {...enter}
          viewport={{ amount: 0.5, once: false }}
          transition={{ ...enter.transition, delay: 0.16 }}
          className={`mt-4 text-[0.95rem] sm:text-[1.05rem] text-[hsl(var(--muted-foreground))] ${
            align === "right" ? "ml-auto" : ""
          } max-w-[680px] leading-relaxed`}
        >
          {description}
        </motion.p>

        <motion.div
          {...enter}
          viewport={{ amount: 0.4, once: false }}
          transition={{ ...enter.transition, delay: 0.24 }}
          className="mt-10"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
