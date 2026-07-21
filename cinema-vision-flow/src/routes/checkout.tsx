import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CreditCard, QrCode, Wallet, Landmark, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { NeonButton } from "@/components/glass/NeonButton";
import { movies } from "@/lib/mock-data";
import { confirmBookingApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface CheckoutSearch {
  seats?: string;
  total?: number;
  date?: string;
  time?: string;
  bookingId?: string;
  movieId?: string;
}

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => {
    return {
      seats: search.seats as string | undefined,
      total: Number(search.total) || undefined,
      date: search.date as string | undefined,
      time: search.time as string | undefined,
      bookingId: search.bookingId as string | undefined,
      movieId: search.movieId as string | undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Secure Checkout — CineGlass" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { seats = "E7, E8", total = 500, date = "Mar 03", time = "12:30 PM", bookingId, movieId = "dune-2" } = Route.useSearch();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [loading, setLoading] = useState(false);

  // Dynamic movie resolver from local catalog
  const currentMovie = movies.find((m) => m.id === movieId) || movies[0];

  // Card details mock state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (bookingId && !bookingId.startsWith("booking-mock")) {
        await confirmBookingApi(bookingId);
      }
      
      // Save locally to localStorage for hybrid persistent access
      if (typeof window !== "undefined") {
        const savedStr = localStorage.getItem("localBookings") || "[]";
        let list = [];
        try {
          list = JSON.parse(savedStr);
        } catch {
          list = [];
        }
        
        list.push({
          id: bookingId || `booking-mock-${Date.now()}`,
          movieTitle: currentMovie.title,
          venueName: currentMovie.cities.includes("Mumbai") ? "PVR Phoenix Marketcity" : "IMAX Grand Galleria",
          date,
          time,
          seats,
          totalAmount: total,
          status: "SUCCESS",
        });
        localStorage.setItem("localBookings", JSON.stringify(list));
      }

      toast.success("Payment successful! Tickets confirmed.");
      navigate({
        to: "/booking-success",
        search: { seats, total, date, time, movieId },
      });
    } catch (err: any) {
      toast.error(err.message || "Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] pb-24">
      <AuroraBackground />
      <GlassNavbar />

      {/* Cinematic Film Clapper Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#09090B]/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="w-24 h-24 mb-6 text-[#8B5CF6] drop-shadow-[0_0_15px_#8B5CF6]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M12 2v10" />
                <path d="M18 12H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2z" />
                <path d="M22 7l-4-4" />
                <path d="M14 7l-4-4" />
                <path d="M6 7L3.5 4.5" />
                <rect x="3" y="12" width="18" height="9" rx="2" />
              </svg>
            </motion.div>
            <h3 className="font-display text-xl font-bold tracking-wider text-gradient-neon animate-pulse">
              SECURE TRANSACTION IN PROGRESS...
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              Validating payment tokens with gateway servers
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-5xl px-6 pt-32 space-y-6">
        <Link to="/seats" search={{ movieId }} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-white/80 hover:text-white mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Adjust Seats
        </Link>

        <h1 className="font-display text-3xl font-bold tracking-tight text-left">
          Secure <span className="text-gradient-neon">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-strong rounded-3xl p-6 border border-white/8">
              <h2 className="font-display text-lg font-bold mb-4 text-left">Payment Options</h2>
              
              {/* Method Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 mb-6">
                {[
                  { id: "upi", label: "UPI / QR", icon: QrCode },
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "netbanking", label: "Banking", icon: Landmark }
                ].map((item) => {
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setMethod(item.id as any)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Details */}
              <div className="min-h-56 flex flex-col justify-center">
                {method === "upi" && (
                  <div className="text-center space-y-4">
                    <div className="glass inline-block p-4 rounded-2xl border border-white/10 relative">
                      <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center relative shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                          <rect x="0" y="0" width="25" height="25" fill="black" />
                          <rect x="75" y="0" width="25" height="25" fill="black" />
                          <rect x="0" y="75" width="25" height="25" fill="black" />
                          <rect x="8" y="8" width="9" height="9" fill="white" />
                          <rect x="83" y="8" width="9" height="9" fill="white" />
                          <rect x="8" y="83" width="9" height="9" fill="white" />
                          <rect x="35" y="10" width="10" height="15" fill="black" />
                          <rect x="50" y="30" width="15" height="10" fill="black" />
                          <rect x="15" y="45" width="20" height="10" fill="black" />
                          <rect x="70" y="60" width="10" height="25" fill="black" />
                          <rect x="40" y="75" width="25" height="15" fill="black" />
                        </svg>
                        <div className="absolute inset-0 border border-[#8B5CF6]/40 rounded-xl pointer-events-none animate-pulse" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scan the dynamic QR code with any UPI app (GPay, PhonePe, Paytm)
                    </p>
                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g. user@okhdfc)"
                        className="glass w-full px-4 py-2 text-center rounded-xl text-sm border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                      />
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-4">
                    <div className="glass-strong w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl p-5 border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/10 to-white/0 shadow-[0_15px_35px_rgba(0,0,0,0.4)] flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-11 bg-amber-500/20 rounded-md border border-amber-500/30 flex items-center justify-center">
                          <div className="w-5 h-4 bg-amber-500/30 rounded" />
                        </div>
                        <span className="font-display font-bold text-sm tracking-widest text-[#F9FAFB]/80">CinePay</span>
                      </div>
                      
                      <div className="font-mono text-lg tracking-widest text-left text-white/90 py-4 truncate">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="text-left min-w-0">
                          <div className="text-[8px] uppercase tracking-widest text-muted-foreground">Card Holder</div>
                          <div className="font-mono text-xs uppercase truncate text-white/80">{cardName || "YOUR NAME"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] uppercase tracking-widest text-muted-foreground">Expires</div>
                          <div className="font-mono text-xs text-white/80">{cardExpiry || "MM/YY"}</div>
                        </div>
                      </div>
                      <div className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-[#8B5CF6] filter blur-[40px] opacity-30 pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="glass w-full px-4 py-2.5 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="glass w-full px-4 py-2.5 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Expiry (MM/YY)"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="glass w-full px-4 py-2.5 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="glass w-full px-4 py-2.5 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground text-center mb-2">Select your banking provider</p>
                    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                      {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"].map((bank) => (
                        <button
                          key={bank}
                          className="glass py-2.5 px-4 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 border border-white/5 transition-all text-center cursor-pointer"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground justify-center">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              <span>Payments are encrypted with AES-256 standard bank security.</span>
            </div>
          </div>

          {/* Right Column: Invoice Receipt */}
          <div className="lg:col-span-5">
            <div className="glass-strong rounded-3xl p-6 border border-white/8 space-y-6">
              <h2 className="font-display text-lg font-bold text-left">Summary</h2>

              <div className="flex items-center gap-4 text-left">
                <img
                  src={currentMovie.poster}
                  alt={currentMovie.title}
                  className="w-16 h-22 object-cover rounded-xl border border-white/10"
                />
                <div>
                  <h3 className="font-display font-bold text-md leading-tight text-[#F9FAFB]">
                    {currentMovie.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentMovie.tagline}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {date} · {time} · Screen 3
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2 text-sm text-left">
                <div className="flex justify-between text-muted-foreground">
                  <span>Selected Seats ({seats.split(",").length})</span>
                  <span className="font-mono text-white/80">{seats}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Fare</span>
                  <span className="font-mono text-white/80">₹{total - 45}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Booking Fee & GST</span>
                  <span className="font-mono text-white/80">₹45</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-left">
                <div>
                  <div className="text-xs text-muted-foreground">Amount to Pay</div>
                  <div className="font-mono text-2xl font-bold text-white mt-0.5">₹{total}</div>
                </div>
                <NeonButton onClick={handlePayment} className="px-8 py-3.5">
                  Pay ₹{total}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
