import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "../catalog/catalog.service";

@Injectable()
export class ShowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
  ) {}

  async findMany(movieId?: string, venueId?: string, date?: string, city?: string) {
    const shows = city ? await this.catalogService.findShowsByCity(city) : await this.catalogService.findShows();
    const movies = await this.catalogService.findMovies();
    const venues = await this.catalogService.findVenues();

    const filtered = shows.filter((s) => {
      const sMovieId = s.movieId || "";
      const sVenueId = s.venueId || "";
      if (movieId && sMovieId !== movieId) return false;
      if (venueId && sVenueId !== venueId) return false;

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const startTime = new Date(s.startTime);
        if (startTime < startOfDay || startTime > endOfDay) return false;
      }
      return true;
    });

    return filtered.map((s) => {
      const movie = movies.find((m) => m.id === s.movieId || m._id?.toString() === s.movieId);
      const venue = venues.find((v) => v.id === s.venueId || v._id?.toString() === s.venueId);
      return {
        id: s.id || s._id?.toString(),
        startTime: s.startTime,
        movieId: s.movieId,
        venueId: s.venueId,
        movie,
        venue,
      };
    });
  }

  async getSeatMap(showId: string) {
    let seats = await this.prisma.showSeat.findMany({
      where: { showId },
      orderBy: { seatCode: "asc" },
    });

    if (seats.length === 0) {
      // Initialize seats: A-K rows, 1-12 seats
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
      const seatsToCreate = [];
      for (const row of rows) {
        for (let col = 1; col <= 12; col++) {
          seatsToCreate.push({
            showId,
            seatCode: `${row}${col}`,
            status: "AVAILABLE" as any,
          });
        }
      }
      await this.prisma.showSeat.createMany({
        data: seatsToCreate,
      });

      seats = await this.prisma.showSeat.findMany({
        where: { showId },
        orderBy: { seatCode: "asc" },
      });
    }

    return seats;
  }
}
