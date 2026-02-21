import { memo } from "react";

const ScreenVignette = memo(() => (
  <div
    className="fixed top-[56px] left-0 right-0 h-16 z-[8] pointer-events-none"
    style={{
      background: "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, transparent 100%)",
    }}
  />
));

ScreenVignette.displayName = "ScreenVignette";
export default ScreenVignette;
