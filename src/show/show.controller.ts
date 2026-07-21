import { Controller, Get, Param, Query } from "@nestjs/common";
import { ShowService } from "./show.service";

@Controller("shows")
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Get()
  async findMany(
    @Query("movieId") movieId?: string,
    @Query("venueId") venueId?: string,
    @Query("date") date?: string,
    @Query("city") city?: string,
  ) {
    return this.showService.findMany(movieId, venueId, date, city);
  }

  @Get(":id/seats")
  async getSeatMap(@Param("id") showId: string) {
    return this.showService.getSeatMap(showId);
  }
}
