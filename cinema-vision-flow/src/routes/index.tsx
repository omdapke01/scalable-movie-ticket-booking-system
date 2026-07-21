import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Film, Ticket, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { NeonButton } from "@/components/glass/NeonButton";
import { movies } from "@/lib/mock-data";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // City Filtering State
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedCity(localStorage.getItem("selectedCity") || "Mumbai");

      const handleCityChanged = () => {
        setSelectedCity(localStorage.getItem("selectedCity") || "Mumbai");
      };

      window.addEventListener("cityChanged", handleCityChanged);
      return () => {
        window.removeEventListener("cityChanged", handleCityChanged);
      };
    }
  }, []);

  // Carousel Slider State
  const featuredMovies = movies.slice(0, 4); // Latest 4 movies for the banner slider
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000); // Auto-slide every 6 seconds
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  // Filter movies listing based on selected city
  const filteredMovies = movies.filter((mv) =>
    mv.cities.some((c) => c.toLowerCase() === selectedCity.toLowerCase())
  );

  const activeMovie = featuredMovies[slideIndex];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] overflow-x-hidden pb-24">
      <AuroraBackground />
      <GlassNavbar />

      {/* Cinematic Banner Carousel (Header Section) */}
      <div className="relative w-full h-[85vh] overflow-hidden">
        {/* Banner Backdrop Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMovie.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${activeMovie.backdrop})` }}
          />
        </AnimatePresence>

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-[#09090B]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/95 via-transparent to-transparent hidden md:block" />

        {/* Carousel Content Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-auto max-w-6xl w-full px-6 flex justify-between items-center z-10">
            
            {/* Left Control Arrow */}
            <button
              onClick={handlePrevSlide}
              className="glass p-3 rounded-full hover:bg-white/10 border border-white/5 text-white/80 hover:text-white transition-all cursor-pointer hidden md:flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Slider Content Info Card */}
            <div className="max-w-xl text-left md:text-left flex flex-col justify-center items-start md:ml-12 md:mr-12 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMovie.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.35em] text-[#8B5CF6] font-bold border border-[#8B5CF6]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_#8B5CF6]" />
                    Featured Premiere
                  </div>

                  <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-none text-white">
                    {activeMovie.title}
                  </h1>

                  <p className="text-sm sm:text-base italic text-muted-foreground font-display max-w-lg">
                    "{activeMovie.tagline}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {activeMovie.genres.map((g) => (
                      <span key={g} className="glass rounded-full px-3 py-0.5 text-xs font-semibold text-white/85">
                        {g}
                      </span>
                    ))}
                    <span className="glass rounded-full px-3 py-0.5 text-xs font-semibold text-white/85 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      {activeMovie.rating}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-md leading-relaxed">
                    {activeMovie.synopsis}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Action Trigger CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/movie" search={{ id: activeMovie.id }}>
                  <NeonButton>
                    <Film className="h-4 w-4" /> View Details <ArrowRight className="h-4 w-4" />
                  </NeonButton>
                </Link>
                <Link to="/seats" search={{ movieId: activeMovie.id }}>
                  <NeonButton variant="glass">
                    <Ticket className="h-4 w-4" /> Instantly Book
                  </NeonButton>
                </Link>
              </div>
            </div>

            {/* Right Control Arrow */}
            <button
              onClick={handleNextSlide}
              className="glass p-3 rounded-full hover:bg-white/10 border border-white/5 text-white/80 hover:text-white transition-all cursor-pointer hidden md:flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                slideIndex === idx ? "w-8 bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6]" : "w-2 bg-white/30 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trending Section with Active City Filter */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-32">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B5CF6] font-bold">
              Now Screening In {selectedCity}
            </div>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Recommended Movies
            </h2>
          </div>
          <Link to="/search" className="text-xs text-[#8B5CF6] hover:text-[#4F46E5] flex items-center gap-1 font-semibold self-start sm:self-auto">
            Search All Catalog <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="glass-strong rounded-3xl p-16 text-center border border-white/5">
            <Film className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm font-semibold">No shows scheduled in {selectedCity} right now.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try selecting Mumbai or Pune from the top dropdown navbar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-left">
            {filteredMovies.map((mv, idx) => (
              <motion.div
                key={mv.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * idx }}
              >
                <Link to="/movie" search={{ id: mv.id }} className="group block">
                  <div className="glass-strong relative overflow-hidden rounded-2xl border border-white/8 transition-all duration-300 group-hover:scale-[1.04] group-hover:border-[#8B5CF6]/50 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]">
                    {/* Poster Wrapper */}
                    <div className="aspect-[2/3] overflow-hidden relative">
                      <img
                        src={mv.poster}
                        alt={mv.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Dark gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Movie Info */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-display font-semibold text-sm leading-snug group-hover:text-[#8B5CF6] transition-colors truncate">
                        {mv.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {mv.rating}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {mv.runtime}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {mv.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-[9px] bg-white/5 border border-white/5 rounded-md px-1.5 py-0.5">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
