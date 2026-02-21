import { memo, useState, useEffect } from "react";

const LoadingScreen = memo(() => {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 600);
    const t2 = setTimeout(() => setGone(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[hsl(var(--background))] flex flex-col items-center justify-center gap-[1.2rem] transition-opacity duration-[800ms]"
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? "none" : "auto" }}
    >
      <div
        className="w-9 h-9 rounded-full animate-spin-ring"
        style={{
          border: "1.5px solid hsla(var(--loading-ring-border))",
          borderTopColor: "hsla(var(--loading-ring-top))",
        }}
      />
      <p className="text-[hsla(var(--loading-text))] text-[0.65rem] tracking-[0.25em] uppercase">
        Loading
      </p>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
export default LoadingScreen;
