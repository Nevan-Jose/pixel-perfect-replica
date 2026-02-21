import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/home/FeatureCards";

export default function Index() {
  useEffect(() => {
    document.body.classList.add("landing-page");
    document.documentElement.classList.remove("marketplace-dark");
    return () => {
      document.body.classList.remove("landing-page");
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

      {/* Feature cards visible after scrolling past hero */}
      <section className="relative z-[5] pt-[100vh]">
        <FeatureCards />
      </section>
    </motion.div>
  );
}
