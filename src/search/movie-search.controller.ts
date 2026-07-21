import { Controller, Get, Post, Query, BadRequestException, Logger } from "@nestjs/common";
import { SearchService } from "./search.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("movies")
export class MovieSearchController {
  private readonly logger = new Logger(MovieSearchController.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("search")
  async search(@Query("q") query: string, @Query("city") city?: string) {
    if (!query) {
      throw new BadRequestException("Query parameter 'q' is required");
    }
    return this.searchService.search(query, city);
  }

  @Get("autocomplete")
  async autocomplete(@Query("prefix") prefix: string) {
    if (!prefix) {
      throw new BadRequestException("Query parameter 'prefix' is required");
    }
    return this.searchService.autocomplete(prefix);
  }

  @Post("sync-search")
  async syncSearch() {
    this.logger.log("Backfilling movie records from PostgreSQL to Elasticsearch...");
    const movies = await this.prisma.movie.findMany();
    let count = 0;

    for (const movie of movies) {
      const shows = await this.prisma.show.findMany({
        where: { movieId: movie.id },
        select: { venue: { select: { city: true } } },
      });
      const cities = [...new Set(shows.map((s) => s.venue.city))];

      const document = {
        id: movie.id,
        title: movie.title,
        description: movie.description || "",
        durationMin: movie.durationMin ? Number(movie.durationMin) : 0,
        cities,
      };

      await this.searchService.indexMovie(document);
      count++;
    }

    return {
      success: true,
      message: `Successfully synchronized ${count} movies from PostgreSQL to Elasticsearch.`,
    };
  }
}
