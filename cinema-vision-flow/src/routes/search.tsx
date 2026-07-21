import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, X, Film, Star, Clock } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { movies } from "@/lib/mock-data";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Movies — CineGlass" },
      {
        name: "description",
        content: "Search our catalog of movies with instant suggestions.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");

  const filteredMovies = query.trim()
    ? movies.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genres.some((g) => g.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] pb-24">
      <AuroraBackground />
      <GlassNavbar />

      <main className="mx-auto max-w-4xl px-6 pt-32 space-y-12">
        {/* Floating Glass Search Input */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Catalog Discovery
          </div>
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, genres, or cast..."
              className="glass-strong w-full pl-14 pr-14 py-4 rounded-full border border-white/8 text-md text-[#F9FAFB] placeholder:text-[#9CA3AF]/60 focus:outline-none focus:border-[#8B5CF6]/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-6 flex items-center text-muted-foreground hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown suggestions list */}
          <AnimatePresence>
            {query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-strong absolute top-full left-0 right-0 mt-3 rounded-2xl border border-white/8 overflow-hidden z-30 max-h-96 overflow-y-auto"
              >
                {filteredMovies.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {filteredMovies.map((mv) => (
                      <Link
                        key={mv.id}
                        to="/movie"
                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                      >
                        <img
                          src={mv.poster}
                          alt={mv.title}
                          className="w-12 h-16 object-cover rounded-lg border border-white/10"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-display font-semibold text-sm truncate">{mv.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{mv.tagline}</p>
                          <div className="flex gap-1.5 mt-1">
                            {mv.genres.slice(0, 2).map((g) => (
                              <span key={g} className="text-[9px] text-[#8B5CF6]">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground pr-2">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {mv.rating}
                          </span>
                          <span>{mv.runtime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Film className="h-8 w-8 text-muted-foreground/50" />
                    <span>No movies found matching "{query}"</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggested Movies Grid when no search is active */}
        {!query.trim() && (
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold tracking-tight text-left">
              Suggested for You
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {movies.slice(1, 4).map((mv) => (
                <Link key={mv.id} to="/movie" className="group">
                  <div className="glass-strong p-4 rounded-2xl border border-white/5 flex gap-4 transition-all hover:scale-[1.03] hover:border-[#8B5CF6]/30">
                    <img
                      src={mv.poster}
                      alt={mv.title}
                      className="w-16 h-24 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex-1 text-left min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-sm leading-tight truncate group-hover:text-[#8B5CF6] transition-colors">
                          {mv.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {mv.tagline}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-2">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {mv.rating}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {mv.runtime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
