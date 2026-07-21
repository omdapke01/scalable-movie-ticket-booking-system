import { Injectable } from "@nestjs/common";
import { CatalogService } from "../catalog/catalog.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class MovieService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll() {
    return this.catalogService.findMovies();
  }

  async create(data: any) {
    const movie = await this.catalogService.createMovie(data);
    this.eventEmitter.emit("movie.created", movie);
    return movie;
  }

  async update(id: string, data: any) {
    const movie = await this.catalogService.updateMovie(id, data);
    this.eventEmitter.emit("movie.updated", movie);
    return movie;
  }

  async delete(id: string) {
    const movie = await this.catalogService.deleteMovie(id);
    this.eventEmitter.emit("movie.deleted", { id });
    return movie;
  }
}
