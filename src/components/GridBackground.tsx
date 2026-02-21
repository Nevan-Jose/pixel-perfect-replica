import { memo, useRef, useEffect, useCallback, useState } from "react";

const CELL = 60;
const LINE_COLOR = "hsla(0,0%,0%,0.13)";
const GREEN_LINE_COLOR = "hsla(145,63%,49%,0.18)";
const WAVE_DURATION = 1200;
const FADE_HOLD = 400;
const BLACKOUT_DURATION = 1000;

const GridBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const greenCells = useRef<Map<string, number>>(new Map());
  const blackCells = useRef<Map<string, number>>(new Map());
  const blackoutActive = useRef(false);
  const greenMode = useRef(false);
  const maskOff = useRef(false);
  const animating = useRef(false);
  const rafRef = useRef<number>(0);
  const [noMask, setNoMask] = useState(false);

  const drawGrid = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width;
    const H = cv.height;
    const now = performance.now();

    ctx.clearRect(0, 0, W, H);

    const cols = Math.ceil(W / CELL) + 1;
    const rows = Math.ceil(H / CELL) + 1;

    // Draw black cells (filled)
    blackCells.current.forEach((startTime, key) => {
      const age = now - startTime;
      if (age < 0) return;
      const [cStr, rStr] = key.split(",");
      const c = parseInt(cStr), r = parseInt(rStr);
      const x = c * CELL;
      const y = r * CELL;
      const alpha = Math.min(age / 300, 1);
      ctx.fillStyle = `hsla(0,0%,3%,${alpha})`;
      ctx.fillRect(x, y, CELL, CELL);
    });

    // Draw base grid lines
    const lineColor = greenMode.current ? GREEN_LINE_COLOR : LINE_COLOR;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      const x = c * CELL;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let r = 0; r <= rows; r++) {
      const y = r * CELL;
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Draw green cells
    let hasActive = false;
    greenCells.current.forEach((startTime, key) => {
      const age = now - startTime;
      if (age < 0) { hasActive = true; return; }
      const totalLife = FADE_HOLD + 400;
      if (age > totalLife) {
        greenCells.current.delete(key);
        return;
      }
      hasActive = true;
      const [cStr, rStr] = key.split(",");
      const c = parseInt(cStr), r = parseInt(rStr);
      const x = c * CELL;
      const y = r * CELL;

      let alpha: number;
      if (age < 80) {
        alpha = age / 80;
      } else if (age < FADE_HOLD) {
        alpha = 1;
      } else {
        alpha = 1 - (age - FADE_HOLD) / 400;
      }
      alpha = Math.max(0, Math.min(1, alpha));

      ctx.strokeStyle = `hsla(145,63%,49%,${0.4 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + CELL, y);
      ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL);
      ctx.moveTo(x, y); ctx.lineTo(x, y + CELL);
      ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL);
      ctx.stroke();
    });

    if (hasActive || blackoutActive.current) {
      rafRef.current = requestAnimationFrame(drawGrid);
    } else if (blackCells.current.size > 0) {
      rafRef.current = requestAnimationFrame(drawGrid);
    } else {
      animating.current = false;
      const lineCol = greenMode.current ? GREEN_LINE_COLOR : LINE_COLOR;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = lineCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = c * CELL;
        ctx.moveTo(x, 0); ctx.lineTo(x, H);
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * CELL;
        ctx.moveTo(0, y); ctx.lineTo(W, y);
      }
      ctx.stroke();
    }
  }, []);

  const triggerWave = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = cv.width;
    const H = cv.height;
    const cols = Math.ceil(W / CELL) + 1;
    const rows = Math.ceil(H / CELL) + 1;
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const now = performance.now();

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (Math.random() > 0.6) continue;
        const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
        const delay = (dist / maxDist) * WAVE_DURATION + Math.random() * 120;
        greenCells.current.set(`${c},${r}`, now + delay);
      }
    }

    if (!animating.current) {
      animating.current = true;
      rafRef.current = requestAnimationFrame(drawGrid);
    }
  }, [drawGrid]);

  const triggerBlackout = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = cv.width;
    const H = cv.height;
    const cols = Math.ceil(W / CELL) + 1;
    const rows = Math.ceil(H / CELL) + 1;
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const now = performance.now();

    blackoutActive.current = true;
    // Remove mask immediately so black cells cover entire viewport
    maskOff.current = true;
    setNoMask(true);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
        const delay = (dist / maxDist) * BLACKOUT_DURATION + Math.random() * 80;
        blackCells.current.set(`${c},${r}`, now + delay);
      }
    }

    setTimeout(() => {
      blackoutActive.current = false;
      greenMode.current = true;
    }, BLACKOUT_DURATION + 400);

    if (!animating.current) {
      animating.current = true;
      rafRef.current = requestAnimationFrame(drawGrid);
    }
  }, [drawGrid]);

  const resetGrid = useCallback(() => {
    blackCells.current.clear();
    greenCells.current.clear();
    blackoutActive.current = false;
    greenMode.current = false;
    maskOff.current = false;
    setNoMask(false);
    const cv = canvasRef.current;
    if (cv) {
      const ctx = cv.getContext("2d")!;
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
    if (!animating.current) {
      animating.current = true;
      rafRef.current = requestAnimationFrame(drawGrid);
    }
  }, [drawGrid]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      drawGrid();
    };
    resize();

    const onTrigger = () => triggerWave();
    const onBlackout = () => triggerBlackout();
    const onReset = () => resetGrid();
    window.addEventListener("resize", resize);
    window.addEventListener("grid-green-wave", onTrigger);
    window.addEventListener("grid-blackout", onBlackout);
    window.addEventListener("grid-reset", onReset);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("grid-green-wave", onTrigger);
      window.removeEventListener("grid-blackout", onBlackout);
      window.removeEventListener("grid-reset", onReset);
    };
  }, [drawGrid, triggerWave, triggerBlackout, resetGrid]);

  const maskStyle = noMask
    ? undefined
    : {
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 80%)",
      };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[0] pointer-events-none"
      style={maskStyle}
    />
  );
});

GridBackground.displayName = "GridBackground";
export default GridBackground;
