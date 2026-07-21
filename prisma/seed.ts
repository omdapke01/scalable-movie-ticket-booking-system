import { PrismaClient, SeatStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up existing data...");
  await prisma.showSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.show.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding database...");

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      password: "password123", // Plain text for seeding. We will hash in Auth.
      name: "Alice Johnson",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      password: "password123",
      name: "Bob Smith",
    },
  });

  console.log(`Created Users: ${user1.email}, ${user2.email}`);

  // Create Movies
  const movie1 = await prisma.movie.create({
    data: {
      title: "Inception",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology.",
      durationMin: 148,
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: "Interstellar",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      durationMin: 169,
    },
  });

  console.log(`Created Movies: ${movie1.title}, ${movie2.title}`);

  // Create Venues
  const venue1 = await prisma.venue.create({
    data: {
      name: "PVR Director's Cut",
      city: "Delhi",
      address: "Ambience Mall, Vasant Kunj",
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: "IMAX Wadala",
      city: "Mumbai",
      address: "Bhakti Park, Wadala East",
    },
  });

  console.log(`Created Venues: ${venue1.name}, ${venue2.name}`);

  // Create Shows
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const show1 = await prisma.show.create({
    data: {
      startTime: tomorrow,
      movieId: movie1.id,
      venueId: venue1.id,
    },
  });

  const tomorrowLate = new Date();
  tomorrowLate.setDate(tomorrowLate.getDate() + 1);
  tomorrowLate.setHours(21, 0, 0, 0);

  const show2 = await prisma.show.create({
    data: {
      startTime: tomorrowLate,
      movieId: movie2.id,
      venueId: venue2.id,
    },
  });

  console.log(`Created Shows: Show1 (${show1.id}), Show2 (${show2.id})`);

  // Generate Seats (Rows A-E, Seats 1-10) -> 50 seats per show
  const rows = ["A", "B", "C", "D", "E"];
  const seatNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  for (const show of [show1, show2]) {
    console.log(`Generating 50 seats for Show ID: ${show.id}...`);
    const seatsData = [];
    for (const row of rows) {
      for (const num of seatNumbers) {
        const seatCode = `${row}${num.toString().padStart(2, "0")}`;
        seatsData.push({
          showId: show.id,
          seatCode,
          status: SeatStatus.AVAILABLE,
          version: 0,
        });
      }
    }
    await prisma.showSeat.createMany({
      data: seatsData,
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
