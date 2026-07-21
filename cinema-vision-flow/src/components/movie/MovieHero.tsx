import { Play, Ticket, Star, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NeonButton } from "@/components/glass/NeonButton";
import { Movie } from "@/lib/mock-data";

interface Props {
  movie: Movie;
}

export function MovieHero({ movie }: Props) {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={movie.backdrop}
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full object-cover animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-14 md:pb-24">
        {/* Poster */}
        <div className="animate-fade-in-up">
          <div className="glass-strong relative overflow-hidden rounded-3xl">
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              width={768}
              height={1152}
              className="h-auto w-full"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-end animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-px w-8 bg-primary/70" />
            Now Showing
          </div>
          <h1 className="font-display text-6xl font-bold leading-[0.95] sm:text-7xl md:text-8xl">
            <span className="text-gradient-neon">{movie.title.split(" ")[0]}</span>{" "}
            <span className="text-white/95">{movie.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="mt-3 font-display text-lg italic text-muted-foreground">
            "{movie.tagline}"
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="glass rounded-full px-3.5 py-1 text-xs font-medium text-white/80"
              >
                {g}
              </span>
            ))}
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium text-white/80">
              <Clock className="h-3 w-3" /> {movie.runtime}
            </span>
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium text-white/80">
              <Star className="h-3 w-3 fill-vip text-vip" />
              <span className="font-mono">{movie.rating}</span>
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/seats" search={{ movieId: movie.id }}>
              <NeonButton>
                <Ticket className="h-4 w-4" /> Book Tickets
              </NeonButton>
            </Link>
            <NeonButton variant="glass">
              <Play className="h-4 w-4 fill-white" /> Watch Trailer
            </NeonButton>
          </div>
        </div>
      </div>
    </section>
  );
}
