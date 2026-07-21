import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Movie } from "@/lib/mock-data";

const tabs = ["Overview", "Cast", "Crew", "Gallery", "Reviews", "Similar"] as const;
type Tab = (typeof tabs)[number];

interface Props {
  movie: Movie;
}

export function MovieTabs({ movie }: Props) {
  const [active, setActive] = useState<Tab>("Overview");

  return (
    <section className="mx-auto max-w-7xl px-6 pb-32">
      <div className="glass-strong rounded-3xl p-6 md:p-10">
        {/* Tab strip */}
        <div className="relative -mx-2 mb-8 flex gap-1 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const isActive = active === t;
            return (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`relative shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-muted-foreground hover:text-white/80"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 -z-0 rounded-full bg-gradient-neon shadow-[var(--shadow-glow)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {active === "Overview" && <Overview movie={movie} />}
            {active === "Cast" && <Cast movie={movie} />}
            {active !== "Overview" && active !== "Cast" && (
              <div className="grid place-items-center py-16 text-sm text-muted-foreground">
                {active} content coming soon.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

interface PanelProps {
  movie: Movie;
}

function Overview({ movie }: PanelProps) {
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="text-left">
        <h3 className="mb-3 font-display text-xl font-semibold">About the film</h3>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {movie.synopsis}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Runtime", movie.runtime],
          ["Year", String(movie.year)],
          ["Rating", `${movie.rating} / 5`],
          ["Language", "English"],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl p-4 text-left">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {k}
            </div>
            <div className="mt-1 font-mono text-lg text-white">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cast({ movie }: PanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 text-left">
      {movie.cast.map((c, i) => (
        <div
          key={i}
          className="glass group overflow-hidden rounded-2xl p-3 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
        >
          <div className="aspect-square overflow-hidden rounded-xl">
            <img
              src={c.photo}
              alt={c.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="mt-3 px-1">
            <div className="text-sm font-semibold text-white truncate">{c.name}</div>
            <div className="text-xs text-muted-foreground truncate">{c.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
