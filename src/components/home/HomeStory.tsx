import type { ReactNode } from "react";

export interface StoryAnchorItem {
  id: string;
  label: string;
}

interface HomeStoryProps {
  anchors: StoryAnchorItem[];
  activeAnchor: string;
  children: ReactNode;
}

export default function HomeStory({ anchors, activeAnchor, children }: HomeStoryProps) {
  return (
    <main className="relative z-[5]">
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[8] hidden lg:flex flex-col gap-3">
        {anchors.map((anchor) => {
          const isActive = anchor.id === activeAnchor;

          return (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              className="group no-underline flex items-center justify-end gap-2"
            >
              <span className="text-[0.58rem] tracking-[0.14em] uppercase text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity">
                {anchor.label}
              </span>
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-8 bg-[hsl(var(--foreground))]"
                    : "w-2 group-hover:bg-[hsl(var(--foreground))]"
                }`}
                style={isActive ? undefined : { backgroundColor: "hsl(var(--foreground) / 0.35)" }}
              />
            </a>
          );
        })}
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-[4]"
        style={{
          background: "radial-gradient(circle at 50% 30%, hsla(0, 0%, 100%, 0.45), transparent 55%)",
        }}
      />
      {children}
    </main>
  );
}
