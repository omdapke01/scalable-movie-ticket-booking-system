import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CatalogService } from "./catalog.service";
import { Movie, MovieSchema } from "./schemas/movie.schema";
import { Venue, VenueSchema } from "./schemas/venue.schema";
import { Show, ShowSchema } from "./schemas/show.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Venue.name, schema: VenueSchema },
      { name: Show.name, schema: ShowSchema },
    ]),
  ],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
