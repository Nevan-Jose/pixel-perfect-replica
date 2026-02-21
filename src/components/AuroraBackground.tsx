import { memo, useRef, useEffect } from "react";

const LAYERS = [
  { x:0.85, y:-0.08, rx:0.55, ry:0.50, r:0, g:0, b:0, a:0.14, spd:0.0000320, ph:0 },
  { x:0.90, y:0.0,   rx:0.70, ry:0.60, r:5, g:5, b:8, a:0.10, spd:0.0000420, ph:1.1 },
  { x:0.75, y:0.05,  rx:0.90, ry:0.70, r:10, g:10, b:15, a:0.08, spd:0.0000500, ph:2.3 },
  { x:0.92, y:0.10,  rx:0.45, ry:0.40, r:0, g:0, b:5, a:0.10, spd:0.0000380, ph:3.5 },
  { x:0.65, y:0.20,  rx:0.60, ry:0.45, r:15, g:15, b:20, a:0.06, spd:0.0000550, ph:4.0 },
  { x:0.5,  y:0.55,  rx:1.1,  ry:0.30, r:0, g:0, b:0, a:0.10, spd:0.0000490, ph:0.6 },
  { x:0.25, y:0.70,  rx:0.80, ry:0.35, r:0, g:0, b:0, a:0.08, spd:0.0000560, ph:1.9 },
  { x:0.6,  y:0.85,  rx:0.95, ry:0.28, r:0, g:0, b:0, a:0.07, spd:0.0000455, ph:3.1 },
];

const AuroraBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ac = canvasRef.current;
    if (!ac) return;
    const ctx = ac.getContext("2d")!;
    let t = 0;
    let raf: number;

    function resize() {
      ac!.width = window.innerWidth;
      ac!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      raf = requestAnimationFrame(draw);
      t++;
      const W = ac!.width, H = ac!.height;
      ctx.clearRect(0, 0, W, H);

      LAYERS.forEach((l) => {
        const ox = Math.sin(t * l.spd * 350 + l.ph) * 0.04 * W;
        const oy = Math.cos(t * l.spd * 280 + l.ph * 1.3) * 0.04 * H;
        const cx = l.x * W + ox;
        const cy = l.y * H + oy;
        const rx = l.rx * W * (0.92 + 0.08 * Math.sin(t * l.spd * 200 + l.ph));
        const ry = l.ry * H * (0.92 + 0.08 * Math.cos(t * l.spd * 180 + l.ph));
        const maxR = Math.max(rx, ry);

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        g.addColorStop(0, `rgba(${l.r},${l.g},${l.b},${l.a})`);
        g.addColorStop(0.45, `rgba(${l.r},${l.g},${l.b},${l.a * 0.4})`);
        g.addColorStop(1, `rgba(${l.r},${l.g},${l.b},0)`);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(rx / maxR, ry / maxR);
        ctx.translate(-cx, -cy);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
    />
  );
});

AuroraBackground.displayName = "AuroraBackground";
export default AuroraBackground;
