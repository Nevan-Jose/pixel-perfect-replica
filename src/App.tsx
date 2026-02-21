import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

import GridBackground from "@/components/GridBackground";

import Scene3D from "@/components/Scene3D";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import CreateAgent from "./pages/CreateAgent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  const isLanding = location.pathname === "/";
  const prevLanding = useRef(isLanding);

  useEffect(() => {
    if (isLanding && !prevLanding.current) {
      window.dispatchEvent(new CustomEvent("scene-reset"));
      window.dispatchEvent(new CustomEvent("grid-reset"));
    }
    prevLanding.current = isLanding;
  }, [isLanding]);

  return (
    <>
      <div className="fixed inset-0 bg-[hsl(var(--background))] z-0" />
      <GridBackground />
      
      {/* Scene3D lives outside AnimatePresence to prevent flash on route change */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLanding ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ willChange: "opacity" }}
      >
        <Scene3D />
      </motion.div>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/create-agent" element={<CreateAgent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
