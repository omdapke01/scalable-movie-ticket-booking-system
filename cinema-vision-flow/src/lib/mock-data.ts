import posterUrl from "@/assets/dune-poster.jpg";
import backdropUrl from "@/assets/dune-backdrop.jpg";
import cast1 from "@/assets/cast-1.jpg";
import cast2 from "@/assets/cast-2.jpg";
import cast3 from "@/assets/cast-3.jpg";

export interface CastMember {
  name: string;
  role: string;
  photo: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  genres: string[];
  runtime: string;
  rating: number;
  year: number;
  poster: string;
  backdrop: string;
  synopsis: string;
  popularity: number;
  cities: string[]; // Active metro cities
  cast: CastMember[];
}

export const movies: Movie[] = [
  {
    id: "dune-2",
    title: "DUNE II",
    tagline: "Long live the fighters.",
    genres: ["Adventure", "Sci-Fi", "Drama"],
    runtime: "2h 40m",
    rating: 4.8,
    year: 2024,
    poster: posterUrl,
    backdrop: backdropUrl,
    synopsis:
      "The sequel to Dune (2021) — Paul Atreides unites with the Fremen of Arrakis to wage war against House Harkonnen. A cinematic journey through sand, prophecy, and power on the desert planet.",
    popularity: 98,
    cities: ["Mumbai", "Pune", "Delhi", "Bangalore"],
    cast: [
      { name: "Timothée C.", role: "Paul Atreides", photo: cast1 },
      { name: "Austin B.", role: "Feyd-Rautha", photo: cast2 },
      { name: "Zendaya", role: "Chani", photo: cast3 },
      { name: "Rebecca F.", role: "Lady Jessica", photo: cast1 },
      { name: "Josh B.", role: "Gurney Halleck", photo: cast2 },
    ],
  },
  {
    id: "interstellar",
    title: "Interstellar",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    runtime: "2h 49m",
    rating: 4.9,
    year: 2014,
    poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
    synopsis:
      "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival on distant worlds.",
    popularity: 97,
    cities: ["Bangalore", "Delhi"],
    cast: [
      { name: "Matthew M.", role: "Cooper", photo: cast1 },
      { name: "Anne H.", role: "Brand", photo: cast2 },
      { name: "Jessica C.", role: "Murph", photo: cast3 },
    ],
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    tagline: "The world forever changes.",
    genres: ["History", "Drama", "Biography"],
    runtime: "3h 0m",
    rating: 4.7,
    year: 2023,
    poster: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1600&auto=format&fit=crop&q=80",
    synopsis:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    popularity: 94,
    cities: ["Delhi", "Mumbai"],
    cast: [
      { name: "Cillian M.", role: "J. Robert Oppenheimer", photo: cast1 },
      { name: "Emily B.", role: "Kitty Oppenheimer", photo: cast2 },
      { name: "Robert D.", role: "Lewis Strauss", photo: cast3 },
    ],
  },
  {
    id: "inception",
    title: "Inception",
    tagline: "Your mind is the scene of the crime.",
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: "2h 28m",
    rating: 4.8,
    year: 2010,
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1600&auto=format&fit=crop&q=80",
    synopsis:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    popularity: 95,
    cities: ["Pune", "Mumbai", "Bangalore"],
    cast: [
      { name: "Leonardo D.", role: "Cobb", photo: cast1 },
      { name: "Elliot P.", role: "Ariadne", photo: cast2 },
      { name: "Tom H.", role: "Eames", photo: cast3 },
    ],
  },
  {
    id: "avengers-endgame",
    title: "Avengers: Endgame",
    tagline: "Part of the journey is the end.",
    genres: ["Action", "Adventure", "Sci-Fi"],
    runtime: "3h 1m",
    rating: 4.6,
    year: 2019,
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=1600&auto=format&fit=crop&q=80",
    synopsis:
      "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions.",
    popularity: 96,
    cities: ["Mumbai", "Delhi"],
    cast: [
      { name: "Robert D. Jr", role: "Tony Stark", photo: cast1 },
      { name: "Chris E.", role: "Steve Rogers", photo: cast2 },
      { name: "Scarlett J.", role: "Natasha Romanoff", photo: cast3 },
    ],
  },
];

export const movie = movies[0];

export type SeatStatus = "available" | "sold" | "vip";

export const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
export const seatsPerRow = 14;

export function seatStatus(row: string, col: number): SeatStatus {
  const rowIdx = rows.indexOf(row);
  const isVip = rowIdx >= 8 && rowIdx <= 9; // Last 2 rows (J and K) are VIP
  return isVip ? "vip" : "available"; // All seats available, no pre-booked seats
}

export const PRICE = { available: 250, vip: 450, sold: 0 } as const;

export const showtimes = ["9:30 AM", "12:30 PM", "4:00 PM", "7:15 PM"];
export const dates = ["Mar 03", "Mar 04", "Mar 05", "Mar 06", "Mar 07"];
