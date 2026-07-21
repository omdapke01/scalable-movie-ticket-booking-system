import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(city?: string) {
    if (city) {
      return this.prisma.venue.findMany({
        where: {
          city: {
            equals: city,
            mode: "insensitive",
          },
        },
      });
    }
    return this.prisma.venue.findMany();
  }
}
