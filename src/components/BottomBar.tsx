import { memo } from "react";
import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

const bounceUp = { y: [0, -6, 0] };

const BottomBar = memo(() => (
  <div className="fixed bottom-[1.8rem] left-0 right-0 z-[5] flex justify-center items-center">
    <motion.span
      animate={bounceUp}
      transition={{ duration: 0.3, ease, repeat: Infinity, repeatDelay: 2.7 }}
      className="inline-flex items-center gap-1.5 text-[0.8rem] tracking-[0.2em] uppercase text-[hsl(var(--foreground))] font-medium"
    >
      Contact Us <span className="text-[1rem]">↓</span>
    </motion.span>
  </div>
));

BottomBar.displayName = "BottomBar";
export default BottomBar;
