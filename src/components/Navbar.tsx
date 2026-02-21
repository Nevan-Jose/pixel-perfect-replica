import { memo } from "react";
import { Link } from "react-router-dom";

const Navbar = memo(() => (
  <>
    <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-[2.5rem] py-[1.2rem]">
      <Link
        to="/"
        className="no-underline text-[hsla(var(--nav-text))] tracking-[0.2em] text-[1.4rem]"
        style={{ fontFamily: "var(--font-logo)" }}
      >
        Soros
      </Link>
      <div className="flex items-center gap-8">
        <Link
          to="/marketplace"
          className="text-[hsla(var(--nav-link))] text-[0.72rem] tracking-[0.12em] uppercase no-underline transition-colors duration-200 hover:text-[hsla(var(--nav-link-hover))]"
        >
          Marketplace
        </Link>
      </div>
    </nav>
    <div className="fixed top-[56px] left-0 w-full h-px bg-[hsla(var(--nav-divider))] z-10" />
  </>
));

Navbar.displayName = "Navbar";
export default Navbar;
