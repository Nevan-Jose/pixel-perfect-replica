import { memo } from "react";

const ContactSection = memo(() => (
  <section className="relative z-[5] min-h-screen flex items-center justify-center px-8 pb-16">
    <div className="max-w-[600px] w-full text-center">
      <h2
        className="text-[hsl(var(--foreground))] tracking-[0.06em] leading-tight mb-4"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.6rem, 3vw, 2.8rem)",
        }}
      >
        GET IN TOUCH
      </h2>
      <p className="text-[0.85rem] text-[hsl(var(--muted-foreground))] leading-relaxed mb-10">
        Have questions about Soros or want to partner with us? Drop us a message and we'll get back to you.
      </p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4 text-left"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-full text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--card-border-hover))] transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-full text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--card-border-hover))] transition-colors"
          />
        </div>
        <input
          type="text"
          placeholder="Subject"
          className="w-full px-4 py-3 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-full text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--card-border-hover))] transition-colors"
        />
        <textarea
          placeholder="Message"
          rows={5}
          className="w-full px-4 py-3 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-2xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--card-border-hover))] transition-colors resize-none"
        />
        <button
          type="submit"
          className="self-center px-8 py-3 text-[0.72rem] tracking-[0.12em] uppercase bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-medium rounded-full hover:shadow-[0_0_20px_4px_hsla(0,0%,0%,0.2)] transition-all"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Send Message
        </button>
      </form>

      <div className="mt-16 flex items-center justify-center gap-8 text-[0.65rem] tracking-[0.1em] uppercase text-[hsl(var(--muted-foreground))]">
        <a href="mailto:hello@soros.io" className="hover:text-[hsl(var(--foreground))] transition-colors no-underline">
          hello@soros.io
        </a>
        <span className="w-px h-3 bg-[hsl(var(--card-border))]" />
        <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors no-underline">
          Twitter
        </a>
        <span className="w-px h-3 bg-[hsl(var(--card-border))]" />
        <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors no-underline">
          Discord
        </a>
      </div>
    </div>
  </section>
));

ContactSection.displayName = "ContactSection";
export default ContactSection;
