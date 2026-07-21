import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Movie } from "./schemas/movie.schema";
import { Venue } from "./schemas/venue.schema";
import { Show } from "./schemas/show.schema";

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);
  private isFallbackMode = false;

  private mockMovies: any[] = [];
  private mockVenues: any[] = [];
  private mockShows: any[] = [];

  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(Venue.name) private venueModel: Model<Venue>,
    @InjectModel(Show.name) private showModel: Model<Show>,
  ) {}

  async onModuleInit() {
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
    if (!mongoUrl) {
      this.isFallbackMode = true;
      this.logger.warn(
        "MONGODB_URL is not defined in .env. CatalogService will run in memory fallback mode.",
      );
      this.initializeMockData();
      return;
    }

    try {
      this.logger.log("Connected to MongoDB. Initializing seed data checking...");
      await this.seedIfNeeded();
    } catch (error) {
      this.logger.error("Failed to seed MongoDB Atlas, enabling in-memory fallback mode.", error);
      this.isFallbackMode = true;
      this.initializeMockData();
    }
  }

  private initializeMockData() {
    const moviesList = [
      { id: "dune-2", title: "DUNE II", description: "The sequel to Dune (2021) — Paul Atreides unites with the Fremen of Arrakis.", durationMin: 160 },
      { id: "interstellar", title: "Interstellar", description: "A team of explorers travels through a wormhole in space to find a new home.", durationMin: 169 },
      { id: "oppenheimer", title: "Oppenheimer", description: "J. Robert Oppenheimer and his role in the development of the atomic bomb.", durationMin: 180 },
      { id: "inception", title: "Inception", description: "A thief who steals corporate secrets through dream-sharing technology.", durationMin: 148 },
      { id: "avengers-endgame", title: "Avengers: Endgame", description: "The Avengers assemble once more to reverse Thanos' actions.", durationMin: 181 },
    ];

    const venuesList = [
      // Mumbai
      { id: "venue-mumbai-1", name: "PVR Phoenix Marketcity", city: "Mumbai", address: "Kurla, Mumbai" },
      { id: "venue-mumbai-2", name: "Cinepolis Grand Galleria", city: "Mumbai", address: "Kanjurmarg, Mumbai" },
      { id: "venue-mumbai-3", name: "INOX Insignia Atria", city: "Mumbai", address: "Worli, Mumbai" },
      { id: "venue-mumbai-4", name: "Carnival Cinema IMAX", city: "Mumbai", address: "Wadala, Mumbai" },
      // Bangalore
      { id: "venue-bangalore-1", name: "PVR Forum Mall", city: "Bangalore", address: "Koramangala, Bangalore" },
      { id: "venue-bangalore-2", name: "Cinepolis Royal Meenakshi", city: "Bangalore", address: "Bannerghatta Road, Bangalore" },
      { id: "venue-bangalore-3", name: "INOX Lido Mall", city: "Bangalore", address: "Ulsoor, Bangalore" },
      { id: "venue-bangalore-4", name: "Orion Mall IMAX", city: "Bangalore", address: "Malleshwaram, Bangalore" },
      // Delhi
      { id: "venue-delhi-1", name: "PVR Select Citywalk", city: "Delhi", address: "Saket, Delhi" },
      { id: "venue-delhi-2", name: "INOX Insignia Saket", city: "Delhi", address: "Saket, Delhi" },
      { id: "venue-delhi-3", name: "Miraj Cinemas CP", city: "Delhi", address: "Connaught Place, Delhi" },
      { id: "venue-delhi-4", name: "Cinepolis DLF Avenue", city: "Delhi", address: "Saket, Delhi" },
      // Pune
      { id: "venue-pune-1", name: "IMAX Westend Mall", city: "Pune", address: "Aundh, Pune" },
      { id: "venue-pune-2", name: "PVR Phoenix Marketcity Pune", city: "Pune", address: "Viman Nagar, Pune" },
      { id: "venue-pune-3", name: "INOX Amanora Mall", city: "Pune", address: "Hadapsar, Pune" },
      { id: "venue-pune-4", name: "City Pride Kothrud", city: "Pune", address: "Kothrud, Pune" },
    ];

    this.mockMovies = moviesList;
    this.mockVenues = venuesList;

    const dates = ["2026-03-03", "2026-03-04", "2026-03-05", "2026-03-06", "2026-03-07"];
    const times = ["09:30", "12:30", "16:00", "19:15"];
    const generatedShows: any[] = [];
    let showCounter = 1;

    for (const date of dates) {
      for (let tIdx = 0; tIdx < times.length; tIdx++) {
        const time = times[tIdx];
        const startStr = `${date}T${time}:00Z`;

        venuesList.forEach((venue, vIdx) => {
          const movieIdx = (vIdx + tIdx + new Date(date).getDate()) % moviesList.length;
          const movie = moviesList[movieIdx];

          generatedShows.push({
            id: `show-${showCounter++}`,
            startTime: new Date(startStr),
            movieId: movie.id,
            venueId: venue.id,
          });
        });
      }
    }

    this.mockShows = generatedShows;
  }

  private async seedIfNeeded() {
    const movieCount = await this.movieModel.countDocuments();
    if (movieCount > 0) return;

    this.logger.log("Seeding MongoDB with movies, venues, and shows...");

    const moviesList = [
      { title: "DUNE II", description: "The sequel to Dune (2021) — Paul Atreides unites with the Fremen of Arrakis.", durationMin: 160 },
      { title: "Interstellar", description: "A team of explorers travels through a wormhole in space to find a new home.", durationMin: 169 },
      { title: "Oppenheimer", description: "J. Robert Oppenheimer and his role in the development of the atomic bomb.", durationMin: 180 },
      { title: "Inception", description: "A thief who steals corporate secrets through dream-sharing technology.", durationMin: 148 },
      { title: "Avengers: Endgame", description: "The Avengers assemble once more to reverse Thanos' actions.", durationMin: 181 },
    ];

    const venuesList = [
      // Mumbai
      { name: "PVR Phoenix Marketcity", city: "Mumbai", address: "Kurla, Mumbai" },
      { name: "Cinepolis Grand Galleria", city: "Mumbai", address: "Kanjurmarg, Mumbai" },
      { name: "INOX Insignia Atria", city: "Mumbai", address: "Worli, Mumbai" },
      { name: "Carnival Cinema IMAX", city: "Mumbai", address: "Wadala, Mumbai" },
      // Bangalore
      { name: "PVR Forum Mall", city: "Bangalore", address: "Koramangala, Bangalore" },
      { name: "Cinepolis Royal Meenakshi", city: "Bangalore", address: "Bannerghatta Road, Bangalore" },
      { name: "INOX Lido Mall", city: "Bangalore", address: "Ulsoor, Bangalore" },
      { name: "Orion Mall IMAX", city: "Bangalore", address: "Malleshwaram, Bangalore" },
      // Delhi
      { name: "PVR Select Citywalk", city: "Delhi", address: "Saket, Delhi" },
      { name: "INOX Insignia Saket", city: "Delhi", address: "Saket, Delhi" },
      { name: "Miraj Cinemas CP", city: "Delhi", address: "Connaught Place, Delhi" },
      { name: "Cinepolis DLF Avenue", city: "Delhi", address: "Saket, Delhi" },
      // Pune
      { name: "IMAX Westend Mall", city: "Pune", address: "Aundh, Pune" },
      { name: "PVR Phoenix Marketcity Pune", city: "Pune", address: "Viman Nagar, Pune" },
      { name: "INOX Amanora Mall", city: "Pune", address: "Hadapsar, Pune" },
      { name: "City Pride Kothrud", city: "Pune", address: "Kothrud, Pune" },
    ];

    const movies: any[] = [];
    for (const m of moviesList) {
      const doc = await this.movieModel.create(m);
      movies.push(doc);
    }

    const venues = [];
    for (const v of venuesList) {
      const doc = await this.venueModel.create(v);
      venues.push(doc);
    }

    const dates = ["2026-03-03", "2026-03-04", "2026-03-05", "2026-03-06", "2026-03-07"];
    const times = ["09:30", "12:30", "16:00", "19:15"];
    const showsToCreate: any[] = [];

    for (const date of dates) {
      for (let tIdx = 0; tIdx < times.length; tIdx++) {
        const time = times[tIdx];
        const startStr = `${date}T${time}:00Z`;

        venues.forEach((venue, vIdx) => {
          const movieIdx = (vIdx + tIdx + new Date(date).getDate()) % movies.length;
          const movie = movies[movieIdx];

          showsToCreate.push({
            startTime: new Date(startStr),
            movieId: movie._id.toString(),
            venueId: venue._id.toString(),
          });
        });
      }
    }

    await this.showModel.insertMany(showsToCreate);
    this.logger.log("MongoDB catalog seeding complete with 16 venues and 320 showtimes!");
  }

  // --- API Methods ---

  async findMovies() {
    if (this.isFallbackMode) return this.mockMovies;
    return this.movieModel.find().exec();
  }

  async findMovieById(id: string) {
    if (this.isFallbackMode) return this.mockMovies.find((m) => m.id === id);
    if (!Types.ObjectId.isValid(id)) {
      // Allow memory fallback check
      const local = this.mockMovies.find((m) => m.id === id);
      if (local) return local;
      return null;
    }
    return this.movieModel.findById(id).exec();
  }

  async findVenues() {
    if (this.isFallbackMode) return this.mockVenues;
    return this.venueModel.find().exec();
  }

  async findVenueById(id: string) {
    if (this.isFallbackMode) return this.mockVenues.find((v) => v.id === id);
    if (!Types.ObjectId.isValid(id)) {
      const local = this.mockVenues.find((v) => v.id === id);
      if (local) return local;
      return null;
    }
    return this.venueModel.findById(id).exec();
  }

  async findShows() {
    if (this.isFallbackMode) return this.mockShows;
    return this.showModel.find().exec();
  }

  async findShowById(id: string) {
    if (this.isFallbackMode) return this.mockShows.find((s) => s.id === id);
    if (!Types.ObjectId.isValid(id)) {
      const local = this.mockShows.find((s) => s.id === id);
      if (local) return local;
      return null;
    }
    return this.showModel.findById(id).exec();
  }

  async findShowsByCity(city: string) {
    if (this.isFallbackMode) {
      const venuesInCity = this.mockVenues.filter((v) => v.city.toLowerCase() === city.toLowerCase());
      const venueIds = venuesInCity.map((v) => v.id);
      return this.mockShows.filter((s) => venueIds.includes(s.venueId));
    }

    const venues = await this.venueModel.find({ city: { $regex: new RegExp(city, "i") } }).exec();
    const venueIds = venues.map((v) => v._id.toString());
    return this.showModel.find({ venueId: { $in: venueIds } }).exec();
  }

  async createMovie(data: any) {
    if (this.isFallbackMode) {
      const newMovie = { id: `movie-mock-${Date.now()}`, ...data };
      this.mockMovies.push(newMovie);
      return newMovie;
    }
    return this.movieModel.create(data);
  }

  async updateMovie(id: string, data: any) {
    if (this.isFallbackMode) {
      const idx = this.mockMovies.findIndex((m) => m.id === id);
      if (idx !== -1) {
        this.mockMovies[idx] = { ...this.mockMovies[idx], ...data };
        return this.mockMovies[idx];
      }
      return null;
    }
    return this.movieModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteMovie(id: string) {
    if (this.isFallbackMode) {
      const idx = this.mockMovies.findIndex((m) => m.id === id);
      if (idx !== -1) {
        const deleted = this.mockMovies[idx];
        this.mockMovies.splice(idx, 1);
        return deleted;
      }
      return null;
    }
    return this.movieModel.findByIdAndDelete(id).exec();
  }
}
