import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SearchService } from "../search.service";
import { CatalogService } from "../../catalog/catalog.service";

@Injectable()
export class MovieIndexingListener {
  private readonly logger = new Logger(MovieIndexingListener.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly catalogService: CatalogService,
  ) {}

  @OnEvent("movie.created")
  @OnEvent("movie.updated")
  async handleMovieSync(movie: any) {
    const movieId = movie.id || movie._id?.toString();
    this.logger.log(`Received movie sync event for movie: ${movieId} - "${movie.title}"`);
    try {
      const cities = await this.getMovieCities(movieId);

      const document = {
        id: movieId,
        title: movie.title,
        description: movie.description || "",
        durationMin: movie.durationMin ? Number(movie.durationMin) : 0,
        cities,
      };

      await this.searchService.indexMovie(document);
    } catch (error) {
      this.logger.error(`Failed to execute search index sync for movie ${movieId}`, error);
    }
  }

  @OnEvent("movie.deleted")
  async handleMovieDelete(eventPayload: { id: string }) {
    const { id } = eventPayload;
    this.logger.log(`Received movie deletion event for movie: ${id}`);
    try {
      await this.searchService.deleteMovie(id);
    } catch (error) {
      this.logger.error(`Failed to execute search index deletion for movie ${id}`, error);
    }
  }

  private async getMovieCities(movieId: string): Promise<string[]> {
    const shows = await this.catalogService.findShows();
    const movieShows = shows.filter((s) => s.movieId === movieId);
    const venues = await this.catalogService.findVenues();

    const cities = movieShows
      .map((s) => {
        const venue = venues.find((v) => v.id === s.venueId || v._id?.toString() === s.venueId);
        return venue ? venue.city : null;
      })
      .filter(Boolean);

    return [...new Set(cities)] as string[];
  }
}
