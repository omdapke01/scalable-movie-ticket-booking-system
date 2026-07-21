import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Ticket, Calendar, Clock, MapPin, ChevronRight, Home, ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { NeonButton } from "@/components/glass/NeonButton";
import { movies } from "@/lib/mock-data";
import { motion, AnimatePresence } from "motion/react";

interface BookingSuccessSearch {
  seats?: string;
  total?: number;
  date?: string;
  time?: string;
  movieId?: string;
}

export const Route = createFileRoute("/booking-success")({
  validateSearch: (search: Record<string, unknown>): BookingSuccessSearch => {
    return {
      seats: search.seats as string | undefined,
      total: Number(search.total) || undefined,
      date: search.date as string | undefined,
      time: search.time as string | undefined,
      movieId: search.movieId as string | undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Booking Confirmed! — CineGlass" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { seats = "E7, E8", total = 500, date = "Mar 03", time = "12:30 PM", movieId = "dune-2" } = Route.useSearch();
  const [particles, setParticles] = useState<any[]>([]);

  // Resolve dynamic movie details
  const activeMovie = movies.find((m) => m.id === movieId) || movies[0];

  // Confetti Particle Generator
  useEffect(() => {
    const colors = ["#8B5CF6", "#4F46E5", "#10B981", "#EF4444", "#F59E0B"];
    const items = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Width %
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      duration: Math.random() * 2.5 + 2.5,
      rotation: Math.random() * 360,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] pb-32 overflow-hidden">
      <AuroraBackground />
      <GlassNavbar />

      {/* Confetti Animation overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -30, x: `${p.x}vw`, rotate: p.rotation, opacity: 1 }}
            animate={{ y: "110vh", rotate: p.rotation + 360, opacity: 0.25 }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
            className="absolute rounded-sm"
            style={{
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </div>

      <main className="mx-auto max-w-2xl px-6 pt-32 text-center flex flex-col items-center">
        {/* Animated Confirmation Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          className="mb-8"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-9 w-9 text-[#10B981]" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#10B981]">
            Booking Confirmed
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Enjoy the show, <span className="text-gradient-neon">Fighter!</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Your transaction was processed successfully. Present the QR code envelope at the theater counter.
          </p>
        </motion.div>

        {/* 3D Folding Interactive Ticket Envelope */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full max-w-sm aspect-[1/1.6] select-none cursor-pointer mt-12 mb-12"
        >
          {/* Inner Ticket */}
          <motion.div
            initial={{ y: 80, scale: 0.95 }}
            animate={{ y: -80, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-4 top-10 h-76 bg-white text-black rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-5 z-10 flex flex-col justify-between"
          >
            {/* Ticket Header */}
            <div className="flex justify-between items-start border-b border-dashed border-black/10 pb-3">
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-wider text-black/60">Movie Admit One</span>
                <h3 className="font-display font-black text-sm tracking-tight text-black">{activeMovie.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-black/60">Format</span>
                <div className="text-[10px] font-bold">IMAX 3D</div>
              </div>
            </div>

            {/* Ticket Metadata */}
            <div className="grid grid-cols-2 gap-3 text-left my-4 text-xs font-semibold">
              <div>
                <div className="text-[7px] uppercase text-black/60 tracking-wider">Date</div>
                <div className="font-mono">{date}</div>
              </div>
              <div>
                <div className="text-[7px] uppercase text-black/60 tracking-wider">Time</div>
                <div className="font-mono">{time}</div>
              </div>
              <div>
                <div className="text-[7px] uppercase text-black/60 tracking-wider">Seats</div>
                <div className="font-mono font-bold text-sm tracking-tight">{seats}</div>
              </div>
              <div>
                <div className="text-[7px] uppercase text-black/60 tracking-wider">Hall</div>
                <div className="font-mono">Audi 03</div>
              </div>
            </div>

            {/* Ticket Footer / Barcode */}
            <div className="flex flex-col items-center pt-3 border-t border-dashed border-black/10">
              <div className="w-full h-8 bg-black flex gap-0.5 px-3 py-1.5 rounded items-center">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-white"
                    style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[8px] tracking-[0.25em] text-black/60 mt-1">CINEGLASS-CONF-{total}</span>
            </div>
          </motion.div>

          {/* Envelope Back Plate */}
          <div className="absolute inset-0 bg-[#111827] rounded-3xl border border-white/5 z-0 shadow-2xl flex flex-col justify-end p-6">
            <div className="text-left text-muted-foreground/40 text-[9px] font-mono select-none">
              SECURE ENVELOPE / TICKET VAULT
            </div>
          </div>

          {/* Envelope Front Flap Plate */}
          <div className="absolute inset-x-0 bottom-0 top-[45%] glass-strong border-t border-white/10 rounded-b-3xl rounded-t-lg z-20 p-5 flex flex-col justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Location</span>
                <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium mt-0.5">
                  <MapPin className="h-3 w-3 text-[#8B5CF6]" />
                  <span>Grand Galleria, Mumbai</span>
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                className="w-16 h-16 bg-white p-1 rounded-lg border border-[#8B5CF6]/30 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.3)]"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                  <rect x="0" y="0" width="20" height="20" fill="black" />
                  <rect x="80" y="0" width="20" height="20" fill="black" />
                  <rect x="0" y="80" width="20" height="20" fill="black" />
                  <rect x="30" y="20" width="40" height="10" fill="black" />
                  <rect x="15" y="45" width="20" height="20" fill="black" />
                  <rect x="60" y="55" width="20" height="20" fill="black" />
                  <rect x="40" y="80" width="20" height="10" fill="black" />
                </svg>
              </motion.div>
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-3">
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Order Total</span>
                <div className="font-mono text-sm font-bold text-white">₹{total}</div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#8B5CF6] font-bold">
                CineGlass Ticket
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="flex gap-4 mt-4"
        >
          <Link to="/">
            <NeonButton variant="glass" className="gap-2">
              <Home className="h-4 w-4" /> Go Home
            </NeonButton>
          </Link>
          <Link to="/profile">
            <NeonButton className="gap-2">
              My Bookings <ChevronRight className="h-4 w-4" />
            </NeonButton>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
