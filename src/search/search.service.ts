import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "../catalog/catalog.service";

const INDEX_NAME = "movies";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private isFallbackMode = false;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
  ) {}

  async onModuleInit() {
    if (!process.env.ELASTICSEARCH_NODE) {
      this.isFallbackMode = true;
      this.logger.warn(
        "ELASTICSEARCH_NODE is not defined in .env. SearchService will run in PostgreSQL fallback mode.",
      );
      return;
    }

    this.logger.log("Initializing Elasticsearch index configurations...");
    try {
      await this.createIndex();
    } catch (error) {
      this.logger.error("Failed to configure Elasticsearch indexes. Falling back to PostgreSQL mode.", error);
      this.isFallbackMode = true;
    }
  }

  private async createIndex() {
    const indexExists = await this.elasticsearchService.indices.exists({ index: INDEX_NAME });

    if (!indexExists) {
      this.logger.log(`Creating index "${INDEX_NAME}" with edge n-gram autocomplete analyzer...`);
      await this.elasticsearchService.indices.create({
        index: INDEX_NAME,
        settings: {
          analysis: {
            analyzer: {
              autocomplete_analyzer: {
                type: "custom",
                tokenizer: "autocomplete_tokenizer",
                filter: ["lowercase"],
              },
            },
            tokenizer: {
              autocomplete_tokenizer: {
                type: "edge_ngram",
                min_gram: 2,
                max_gram: 10,
                token_chars: ["letter", "digit"],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: "keyword" },
            title: {
              type: "text",
              fields: {
                suggest: {
                  type: "text",
                  analyzer: "autocomplete_analyzer",
                  search_analyzer: "standard",
                },
                keyword: { type: "keyword" },
              },
            },
            description: { type: "text" },
            durationMin: { type: "integer" },
            cities: { type: "keyword" },
          },
        },
      });
      this.logger.log(`Index "${INDEX_NAME}" created successfully.`);
    } else {
      this.logger.log(`Index "${INDEX_NAME}" already exists.`);
    }
  }

  async indexMovie(movie: any) {
    if (this.isFallbackMode) {
      this.logger.debug(`[Fallback] Skipping indexing for movie ${movie.id} (Elasticsearch disabled)`);
      return;
    }
    this.logger.log(`Indexing movie document in ES: ${movie.id} - "${movie.title}"`);
    await this.elasticsearchService.index({
      index: INDEX_NAME,
      id: movie.id,
      document: movie,
    });
  }

  async deleteMovie(movieId: string) {
    if (this.isFallbackMode) {
      this.logger.debug(`[Fallback] Skipping deletion for movie ${movieId} (Elasticsearch disabled)`);
      return;
    }
    this.logger.log(`Deleting movie document from ES: ${movieId}`);
    try {
      await this.elasticsearchService.delete({
        index: INDEX_NAME,
        id: movieId,
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        this.logger.warn(`Movie ${movieId} not found in ES index, skip deletion.`);
      } else {
        throw error;
      }
    }
  }

  async search(query: string, city?: string) {
    if (this.isFallbackMode) {
      this.logger.log(`[Fallback] Querying CatalogService for movies containing "${query}" (city: ${city || "ALL"})`);
      const allMovies = await this.catalogService.findMovies();
      const allShows = await this.catalogService.findShows();
      const allVenues = await this.catalogService.findVenues();

      const matchedMovies = [];

      for (const movie of allMovies) {
        const movieTitle = movie.title || "";
        const movieDesc = movie.description || "";
        if (
          !movieTitle.toLowerCase().includes(query.toLowerCase()) &&
          !movieDesc.toLowerCase().includes(query.toLowerCase())
        ) {
          continue;
        }

        // Resolve active cities
        const movieShows = allShows.filter((s) => s.movieId === movie.id || s.movieId === movie._id?.toString());
        const cities = [
          ...new Set(
            movieShows
              .map((s) => {
                const venue = allVenues.find((v) => v.id === s.venueId || v._id?.toString() === s.venueId);
                return venue ? venue.city : null;
              })
              .filter(Boolean),
          ),
        ];

        if (city && !cities.some((c) => c.toLowerCase() === city.toLowerCase())) {
          continue;
        }

        matchedMovies.push({
          id: movie.id || movie._id?.toString(),
          title: movie.title,
          description: movie.description,
          durationMin: movie.durationMin,
          cities,
        });
      }

      return matchedMovies;
    }

    this.logger.log(`Fuzzy search query: "${query}" in city: "${city || "ALL"}"`);
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ["title^3", "description"],
          fuzziness: "AUTO",
          prefix_length: 2,
        },
      },
    ];

    const filter: any[] = [];
    if (city) {
      filter.push({ term: { cities: city } });
    }

    const response = await this.elasticsearchService.search({
      index: INDEX_NAME,
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort: [{ _score: { order: "desc" } }],
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }

  async autocomplete(prefix: string) {
    if (this.isFallbackMode) {
      this.logger.log(`[Fallback] Querying CatalogService autocomplete for prefix: "${prefix}"`);
      const allMovies = await this.catalogService.findMovies();
      const allShows = await this.catalogService.findShows();
      const allVenues = await this.catalogService.findVenues();

      const matchedMovies = [];

      for (const movie of allMovies) {
        const movieTitle = movie.title || "";
        if (!movieTitle.toLowerCase().startsWith(prefix.toLowerCase())) {
          continue;
        }

        const movieShows = allShows.filter((s) => s.movieId === movie.id || s.movieId === movie._id?.toString());
        const cities = [
          ...new Set(
            movieShows
              .map((s) => {
                const venue = allVenues.find((v) => v.id === s.venueId || v._id?.toString() === s.venueId);
                return venue ? venue.city : null;
              })
              .filter(Boolean),
          ),
        ];

        matchedMovies.push({
          id: movie.id || movie._id?.toString(),
          title: movie.title,
          description: movie.description,
          durationMin: movie.durationMin,
          cities,
        });

        if (matchedMovies.length >= 5) break;
      }

      return matchedMovies;
    }

    this.logger.log(`Autocomplete query prefix: "${prefix}"`);
    const response = await this.elasticsearchService.search({
      index: INDEX_NAME,
      query: {
        match: {
          "title.suggest": {
            query: prefix,
            analyzer: "standard",
          },
        },
      },
      size: 5,
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }
}
