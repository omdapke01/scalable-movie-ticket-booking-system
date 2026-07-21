import { Controller, Get, Query } from "@nestjs/common";
import { VenueService } from "./venue.service";

@Controller("venues")
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  async findMany(@Query("city") city?: string) {
    return this.venueService.findMany(city);
  }
}
