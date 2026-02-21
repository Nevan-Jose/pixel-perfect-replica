import { memo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const Hero = memo(() => {
  const [expanding, setExpanding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (expanding) return;
    setExpanding(true);

    // 1. Green circle expands over button
    // 2. Coins spin 20x faster
    window.dispatchEvent(new CustomEvent("scene-turbo-spin"));

    // 3. After green fills button, fade everything out
    setTimeout(() => {
      setFadingOut(true);
      window.dispatchEvent(new CustomEvent("scene-fade-out"));
    }, 500);

    // 4. Navigate after fade completes
    setTimeout(() => {
      navigate("/marketplace");
    }, 1400);
  }, [expanding, navigate]);

  return (
    <div
      className="fixed bottom-[33vh] left-[2.5rem] z-[5] max-w-[480px]"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? "opacity 600ms ease-out" : "none",
      }}
    >
      <h1
        className="text-[hsl(var(--hero-title))] tracking-[0.06em] leading-[1.1] animate-fade-up-delay-1"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 3.8vw, 3.6rem)",
        }}
      >
        GLOBAL
        <br />
        FINANCIAL
        <br />
        INFRASTRUCTURE.
      </h1>
      <div className="flex items-center gap-4 mt-8 animate-fade-up-delay-3">
        <Link
          to="/marketplace"
          onClick={handleClick}
          onMouseEnter={() => {
            setHovered(true);
            window.dispatchEvent(new CustomEvent("scene-hover-pause"));
          }}
          onMouseLeave={() => {
            if (!expanding) {
              setHovered(false);
              window.dispatchEvent(new CustomEvent("scene-hover-resume"));
            }
          }}
          className="relative inline-flex items-center gap-2.5 px-[1.8rem] py-[0.7rem] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[0.7rem] tracking-[0.18em] uppercase no-underline cursor-pointer rounded-full hover:shadow-[0_0_24px_6px_rgba(0,0,0,0.35)] overflow-hidden"
          style={{
            fontFamily: "var(--font-body)",
            transition: "box-shadow 0.3s, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: hovered && !expanding ? "scale(1.06)" : "scale(1)",
          }}
        >
          {/* Green expanding circle */}
          <span
            className="absolute rounded-full pointer-events-none"
            style={{
              width: expanding ? "800px" : "0px",
              height: expanding ? "800px" : "0px",
              left: "1.4rem",
              top: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "hsl(145 63% 49%)",
              transition: expanding
                ? "width 550ms cubic-bezier(0.22, 1, 0.36, 1), height 550ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
          />
          {/* Green dot */}
          <span
            className="relative z-[1] rounded-full flex-shrink-0"
            style={{
              width: hovered && !expanding ? "10px" : "0px",
              height: hovered && !expanding ? "10px" : "0px",
              minWidth: hovered && !expanding ? "10px" : "0px",
              backgroundColor: "hsl(145 63% 49%)",
              boxShadow: hovered && !expanding ? "0 0 8px 2px hsla(145, 63%, 49%, 0.5)" : "none",
              transition: "width 300ms cubic-bezier(0.34, 1.56, 0.64, 1), height 300ms cubic-bezier(0.34, 1.56, 0.64, 1), min-width 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease",
            }}
          />
          <span className="relative z-[1]">Explore Marketplace</span>
        </Link>
      </div>
    </div>
  );
});

Hero.displayName = "Hero";
export default Hero;
