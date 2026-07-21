import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { SeatGrid } from "@/components/seats/SeatGrid";
import { SeatLegend } from "@/components/seats/SeatLegend";
import { BookingBar } from "@/components/seats/BookingBar";
import { PRICE, seatStatus, movies } from "@/lib/mock-data";
import { getSeatMapApi, createBookingApi, getSession, getShowsApi } from "@/lib/api";
import { toast } from "sonner";

interface SeatSearch {
  movieId?: string;
}

export const Route = createFileRoute("/seats")({
  validateSearch: (search: Record<string, unknown>): SeatSearch => {
    return {
      movieId: search.movieId as string | undefined,
    };
  },
  head: (ctx) => {
    const search = ctx.search as SeatSearch;
    const currentMovie = movies.find((m) => m.id === search.movieId) || movies[0];
    return {
      meta: [
        { title: `Select Seats — ${currentMovie.title} — CineGlass` },
        {
          name: "description",
          content: `Pick your seats for ${currentMovie.title} with a cinematic glass UI.`,
        },
      ],
    };
  },
  component: SeatsPage,
});

function SeatsPage() {
  const navigate = useNavigate();
  const { movieId = "dune-2" } = Route.useSearch();
  const activeMovie = movies.find((m) => m.id === movieId) || movies[0];

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bookingLoading, setBookingLoading] = useState(false);

  // Dynamic show states
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [showsList, setShowsList] = useState<any[]>([]);
  const [activeVenue, setActiveVenue] = useState<any>(null);
  
  // Date & Time states mapped to current selections
  const [date, setDate] = useState("Mar 03");
  const [time, setTime] = useState("12:30 PM");

  useEffect(() => {
    const city = typeof window !== "undefined" ? localStorage.getItem("selectedCity") || "Mumbai" : "Mumbai";
    setSelectedCity(city);

    // Fetch shows from the backend
    getShowsApi(movieId, city).then((data) => {
      setShowsList(data);
    });
  }, [movieId]);

  // Extract unique venues from the show listings
  const uniqueVenues = useMemo(() => {
    const mapped = showsList.map((s) => {
      const v = s.venue;
      return v ? { id: v.id || v._id, name: v.name, address: v.address } : null;
    }).filter(Boolean);

    // Remove duplicates
    const seen = new Set();
    const result: any[] = [];
    mapped.forEach((v: any) => {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        result.push(v);
      }
    });
    return result;
  }, [showsList]);

  // Default active venue on load
  useEffect(() => {
    if (uniqueVenues.length > 0 && !activeVenue) {
      setActiveVenue(uniqueVenues[0]);
    }
  }, [uniqueVenues, activeVenue]);

  // Filter shows by selected venue
  const venueShows = useMemo(() => {
    if (!activeVenue) return [];
    return showsList.filter((s) => {
      const vId = s.venue?.id || s.venue?._id || s.venueId;
      return vId === activeVenue.id;
    });
  }, [showsList, activeVenue]);

  // Extract unique dates from the venue shows
  const availableDates = useMemo(() => {
    const datesList = venueShows.map((s) => {
      return new Date(s.startTime).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    });
    const uniq = Array.from(new Set(datesList));
    return uniq.length > 0 ? uniq : ["Mar 03", "Mar 04", "Mar 05", "Mar 06", "Mar 07"];
  }, [venueShows]);

  // Set default date when dates list updates
  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(date)) {
      setDate(availableDates[0]);
    }
  }, [availableDates, date]);

  // Filter shows by selected venue and selected date to resolve available times
  const finalShowsForDate = useMemo(() => {
    return venueShows.filter((s) => {
      const dStr = new Date(s.startTime).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      return dStr === date;
    });
  }, [venueShows, date]);

  // Extract unique showtimes
  const availableTimes = useMemo(() => {
    const timesList = finalShowsForDate.map((s) => {
      return new Date(s.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    });
    const uniq = Array.from(new Set(timesList));
    return uniq.length > 0 ? uniq : ["09:30 AM", "12:30 PM", "04:00 PM", "07:15 PM"];
  }, [finalShowsForDate]);

  // Set default time when times list updates
  useEffect(() => {
    if (availableTimes.length > 0 && !availableTimes.includes(time)) {
      setTime(availableTimes[0]);
    }
  }, [availableTimes, time]);

  // Map active selection to a unique show ID
  const activeShow = useMemo(() => {
    return showsList.find((s) => {
      const vId = s.venue?.id || s.venue?._id || s.venueId;
      const dStr = new Date(s.startTime).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      const tStr = new Date(s.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      return vId === activeVenue?.id && dStr === date && tStr === time;
    });
  }, [showsList, activeVenue, date, time]);

  // Fallback static showId mapping
  const showId = useMemo(() => {
    if (activeShow) return activeShow.id || activeShow._id;
    return movieId === "dune-2"
      ? "show-1"
      : movieId === "interstellar"
        ? "show-2"
        : movieId === "oppenheimer"
          ? "show-3"
          : "show-4";
  }, [activeShow, movieId]);

  // Seat status mapping in PostgreSQL
  const [seatMap, setSeatMap] = useState<any[]>([]);

  useEffect(() => {
    getSeatMapApi(showId).then((data) => {
      setSeatMap(data);
    });
  }, [showId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { total, label } = useMemo(() => {
    let sum = 0;
    const ids = Array.from(selected).sort();
    for (const id of ids) {
      const row = id[0];
      const col = Number(id.slice(1));
      const s = seatStatus(row, col);
      sum += s === "vip" ? PRICE.vip : PRICE.available;
    }
    return { total: sum, label: ids.join(", ") };
  }, [selected]);

  const handleBook = async () => {
    const session = getSession();
    if (!session) {
      toast.error("Please login to proceed with booking.");
      navigate({ to: "/auth" });
      return;
    }

    if (selected.size === 0) return;

    setBookingLoading(true);
    try {
      const seatCodes = Array.from(selected);
      const res = await createBookingApi(showId, seatCodes);
      toast.success("Seats reserved! Redirecting to payment...");
      navigate({
        to: "/checkout",
        search: {
          seats: label,
          total,
          date,
          time,
          bookingId: res.id,
          movieId: activeMovie.id,
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to reserve seats");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-40">
      <AuroraBackground />
      <GlassNavbar />

      <header className="mx-auto max-w-6xl px-6 pt-28 pb-8">
        <Link
          to="/movie"
          search={{ id: activeMovie.id }}
          className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-white/80 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Movie
        </Link>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="text-left w-full md:w-auto">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Select your seats
            </div>
            <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">
              <span className="text-gradient-neon">{activeMovie.title}</span>
            </h1>

            {/* Dynamic Venue / Theater dropdown */}
            {uniqueVenues.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <select
                  value={activeVenue?.id || ""}
                  onChange={(e) => {
                    const found = uniqueVenues.find((v) => v.id === e.target.value);
                    if (found) setActiveVenue(found);
                  }}
                  className="glass text-[11px] font-semibold py-1 px-2.5 rounded-full text-white outline-none cursor-pointer border border-white/8 bg-[#09090B]"
                >
                  {uniqueVenues.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#09090B] text-white">
                      {v.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                  — {activeVenue?.address}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex flex-col items-start md:items-end gap-1">
            <span className="glass px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider text-[#8B5CF6] font-bold border border-[#8B5CF6]/15">
              {selectedCity} City
            </span>
            <span className="text-xs text-muted-foreground/80 mt-1">Screen 3 · Dolby Atmos · IMAX</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
        <SeatGrid selected={selected} onToggle={toggle} seatMap={seatMap} />
        <SeatLegend />
      </main>

      <BookingBar
        selectedCount={selected.size}
        seatLabel={label}
        total={total}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        onBook={handleBook}
        loading={bookingLoading}
        availableDates={availableDates}
        availableTimes={availableTimes}
      />
    </div>
  );
}
