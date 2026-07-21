import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { MovieHero } from "@/components/movie/MovieHero";
import { MovieTabs } from "@/components/movie/MovieTabs";
import { movies } from "@/lib/mock-data";

interface MovieSearch {
  id?: string;
}

export const Route = createFileRoute("/movie")({
  validateSearch: (search: Record<string, unknown>): MovieSearch => {
    return {
      id: search.id as string | undefined,
    };
  },
  head: (ctx) => {
    const search = ctx.search as MovieSearch;
    const currentMovie = movies.find((m) => m.id === search.id) || movies[0];
    return {
      meta: [
        { title: `${currentMovie.title} — CineGlass` },
        {
          name: "description",
          content: `Book tickets for ${currentMovie.title}. Cinematic glass UI, cast, showtimes, and seat selection.`,
        },
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const { id = "dune-2" } = Route.useSearch();
  const selectedMovie = movies.find((m) => m.id === id) || movies[0];

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <GlassNavbar />
      <MovieHero movie={selectedMovie} />
      <MovieTabs movie={selectedMovie} />
    </div>
  );
}
