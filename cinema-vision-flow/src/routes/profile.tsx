import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Ticket, Award, Heart, ShieldAlert, ChevronRight, LogOut, Settings } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { getSession, logoutSession, getUserBookingsApi, UserSession } from "@/lib/api";
import { movies } from "@/lib/mock-data";
import { toast } from "sonner";
import { motion } from "motion/react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Dashboard — CineGlass" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      toast.error("Please sign in to access your dashboard.");
      navigate({ to: "/auth" });
      return;
    }
    setCurrentUser(session);

    getUserBookingsApi()
      .then((data) => {
        const localSaved = typeof window !== "undefined" ? localStorage.getItem("localBookings") || "[]" : "[]";
        let localData = [];
        try {
          localData = JSON.parse(localSaved);
        } catch {
          localData = [];
        }
        
        const merged = [...data];
        localData.forEach((localB: any) => {
          if (!merged.some((b) => b.id === localB.id)) {
            merged.push(localB);
          }
        });
        setBookings(merged);
      })
      .catch((err) => {
        console.warn("Failed to load user bookings:", err);
        if (typeof window !== "undefined") {
          const localSaved = localStorage.getItem("localBookings") || "[]";
          try {
            setBookings(JSON.parse(localSaved));
          } catch {
            setBookings([]);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    logoutSession();
    toast.success("Logged out successfully.");
    navigate({ to: "/auth" });
  };

  const getMoviePoster = (title: string) => {
    const found = movies.find((m) => m.title.toLowerCase() === title.toLowerCase());
    return found ? found.poster : "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=150&auto=format&fit=crop&q=80";
  };

  const mockUser = {
    name: currentUser?.name || "Om Dapke",
    email: currentUser?.email || "om@cineglass.io",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    points: 1250,
    tier: "CineVIP Platinum",
  };

  // Split bookings by status
  const activeBookings = bookings.filter((b) => b.status === "SUCCESS" || b.status === "RESERVED");
  const pastBookings = bookings.filter((b) => b.status === "FAILED" || b.status === "EXPIRED");

  if (loading || !currentUser) {
    return (
      <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
          <p className="text-xs text-muted-foreground">Loading dashboard profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] pb-24">
      <AuroraBackground />
      <GlassNavbar />

      <main className="mx-auto max-w-5xl px-6 pt-32 space-y-8">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 border border-white/8 flex flex-col md:flex-row items-center gap-6 text-left relative overflow-hidden"
        >
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-24 h-24 rounded-full border-2 border-[#8B5CF6]/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{mockUser.name}</h1>
              <span className="text-[10px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-full px-3 py-0.5 font-bold uppercase tracking-wider">
                {mockUser.tier}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{mockUser.email}</p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Award className="h-4 w-4 text-yellow-500" />
                <span><strong>{mockUser.points}</strong> Reward Points</span>
              </div>
            </div>
          </div>
          
          {/* Settings / Actions */}
          <div className="flex gap-2">
            <button className="glass p-2.5 rounded-xl hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-all">
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="glass p-2.5 rounded-xl hover:bg-red-500/10 border border-red-500/10 text-red-400 hover:text-red-300 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Ambient Glow */}
          <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-[#8B5CF6] filter blur-[50px] opacity-25 pointer-events-none" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Tickets Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-strong rounded-3xl p-6 border border-white/8">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-left">
                <Ticket className="h-5 w-5 text-[#8B5CF6]" />
                <span>Active Tickets</span>
              </h2>

              <div className="space-y-4">
                {activeBookings.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    No active bookings found. Book some tickets to see them here!
                  </div>
                ) : (
                  activeBookings.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="glass rounded-2xl border border-white/5 p-4 flex flex-col sm:flex-row gap-4 text-left relative overflow-hidden"
                    >
                      <img
                        src={getMoviePoster(ticket.movieTitle)}
                        alt={ticket.movieTitle}
                        className="w-20 h-28 object-cover rounded-xl border border-white/10 self-start sm:self-auto"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-display font-bold text-md leading-tight text-[#F9FAFB]">
                              {ticket.movieTitle}
                            </h3>
                            <span className="font-mono text-[9px] text-[#8B5CF6] font-bold">
                              {ticket.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">Screen 3 · {ticket.venueName}</p>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-[11px] text-[#9CA3AF]">
                            <div>Date: <span className="text-white/80 font-mono">{ticket.date}</span></div>
                            <div>Time: <span className="text-white/80 font-mono">{ticket.time}</span></div>
                            <div className="col-span-2 mt-1">
                              Seats: <span className="text-gradient-neon font-mono font-bold text-xs">{ticket.seats}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 sm:pt-0">
                          <Link
                            to="/booking-success"
                            search={{
                              seats: ticket.seats,
                              total: Number(ticket.totalAmount) || 500,
                              date: ticket.date.slice(0, 6),
                              time: ticket.time,
                            }}
                            className="text-xs text-[#8B5CF6] hover:text-white flex items-center gap-1 font-semibold"
                          >
                            View Envelope QR <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Booking History Section */}
            <div className="glass-strong rounded-3xl p-6 border border-white/8">
              <h2 className="font-display text-lg font-bold mb-4 text-left">Booking History</h2>
              <div className="space-y-3">
                {pastBookings.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No expired or cancelled bookings.
                  </div>
                ) : (
                  pastBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left"
                    >
                      <img
                        src={getMoviePoster(b.movieTitle)}
                        alt={b.movieTitle}
                        className="w-10 h-14 object-cover rounded-lg border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-sm truncate">{b.movieTitle}</h4>
                        <p className="text-[10px] text-muted-foreground">{b.date} · Seats: {b.seats}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold">₹{b.totalAmount}</span>
                        <div className="text-[9px] text-[#EF4444] font-semibold mt-0.5 uppercase">{b.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="glass-strong rounded-3xl p-6 border border-white/8 text-left space-y-4">
              <h2 className="font-display text-lg font-bold mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Interests</span>
              </h2>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Favorite Genres</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Sci-Fi", "Adventure", "Drama", "Action", "Thriller"].map((g) => (
                    <span
                      key={g}
                      className="text-[10px] bg-white/5 hover:bg-[#8B5CF6]/15 hover:border-[#8B5CF6]/40 border border-white/5 rounded-full px-3 py-1 cursor-pointer transition-colors"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Loader2 Helper Component
const Loader2 = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
