import { memo, useRef, useEffect } from "react";

const HALO_X = 0.62;
const HALO_Y = 0.06;
const HALO_SPREAD_X = 0.60;
const HALO_SPREAD_Y = 0.45;
const HALO_OPACITY = 0.52;

const HAZE_X = 0.55;
const HAZE_Y = 0.15;
const HAZE_SPREAD_X = 0.85;
const HAZE_SPREAD_Y = 0.70;
const HAZE_OPACITY = 0.14;

const DRIFT_AMP_X = 18;
const DRIFT_AMP_Y = 12;
const DRIFT_PERIOD = 16;
const BREATHE_PERIOD = 6;
const BREATHE_DEPTH = 0.35;

const VIGNETTE_STRENGTH = 0.45;

const MOBILE_BREAKPOINT = 768;
const MOBILE_SCALE = 0.65;
const MOBILE_OPACITY_SCALE = 0.7;

const DIMMED_MULTIPLIER = 0.45;
const TWO_PI = Math.PI * 2;

const HaloLightOverlay = memo(({ dimmed = false }: { dimmed?: boolean }) => {
  const dimmedRef = useRef(dimmed);
  dimmedRef.current = dimmed;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true })!;
    let raf: number;
    let W = 0, H = 0;

    function resize() {
      // Render at half resolution for performance, CSS scales up
      W = Math.round(window.innerWidth / 2);
      H = Math.round(window.innerHeight / 2);
      cv!.width = W;
      cv!.height = H;
    }
    resize();
    let resizeTimer: number;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 150); };
    window.addEventListener("resize", onResize);

    // Pre-compute static values
    const driftPeriodInv = TWO_PI / DRIFT_PERIOD;
    const breathePeriodInv = TWO_PI / BREATHE_PERIOD;

    function draw(time: number) {
      raf = requestAnimationFrame(draw);
      const isMobile = W < MOBILE_BREAKPOINT / 2;
      const dimScale = dimmedRef.current ? DIMMED_MULTIPLIER : 1;
      const sScale = isMobile ? MOBILE_SCALE : 1;
      const oScale = (isMobile ? MOBILE_OPACITY_SCALE : 1) * dimScale;

      const t = time * 0.001;
      const driftX = Math.sin(t * driftPeriodInv) * DRIFT_AMP_X * 0.5;
      const driftY = Math.cos(t * driftPeriodInv * 0.7) * DRIFT_AMP_Y * 0.5;
      const breathe = 1 - BREATHE_DEPTH + BREATHE_DEPTH * (0.5 + 0.5 * Math.sin(t * breathePeriodInv));

      ctx.clearRect(0, 0, W, H);

      // Main halo
      const hx = HALO_X * W + driftX;
      const hy = HALO_Y * H + driftY;
      const hrx = HALO_SPREAD_X * W * sScale;
      const hry = HALO_SPREAD_Y * H * sScale;
      const maxR = hrx > hry ? hrx : hry;
      const alpha = HALO_OPACITY * breathe * oScale;

      const g1 = ctx.createRadialGradient(hx, hy, 0, hx, hy, maxR);
      g1.addColorStop(0, `rgba(0,0,0,${alpha * 0.5})`);
      g1.addColorStop(0.2, `rgba(3,5,8,${alpha * 0.35})`);
      g1.addColorStop(0.45, `rgba(10,14,20,${alpha * 0.15})`);
      g1.addColorStop(1, `rgba(25,30,35,0)`);

      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(hrx / maxR, hry / maxR);
      ctx.translate(-hx, -hy);
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(hx, hy, maxR, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // Secondary haze
      const hzx = HAZE_X * W + driftX * 0.5;
      const hzy = HAZE_Y * H + driftY * 0.3;
      const hzrx = HAZE_SPREAD_X * W * sScale;
      const hzry = HAZE_SPREAD_Y * H * sScale;
      const maxR2 = hzrx > hzry ? hzrx : hzry;
      const alpha2 = HAZE_OPACITY * breathe * oScale;

      const g2 = ctx.createRadialGradient(hzx, hzy, 0, hzx, hzy, maxR2);
      g2.addColorStop(0, `rgba(0,3,7,${alpha2 * 0.3})`);
      g2.addColorStop(0.4, `rgba(15,20,25,${alpha2 * 0.15})`);
      g2.addColorStop(1, `rgba(35,40,45,0)`);

      ctx.save();
      ctx.translate(hzx, hzy);
      ctx.scale(hzrx / maxR2, hzry / maxR2);
      ctx.translate(-hzx, -hzy);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(hzx, hzy, maxR2, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // Vignette
      if (VIGNETTE_STRENGTH > 0) {
        const vg = ctx.createRadialGradient(W * 0.5, H * 0.4, W * 0.25, W * 0.5, H * 0.5, W * 0.85);
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(0.6, "rgba(0,0,0,0)");
        vg.addColorStop(1, `rgba(0,0,0,${VIGNETTE_STRENGTH})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
      }
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "multiply", width: "100vw", height: "100vh", imageRendering: "auto" }}
    />
  );
});

HaloLightOverlay.displayName = "HaloLightOverlay";
export default HaloLightOverlay;
