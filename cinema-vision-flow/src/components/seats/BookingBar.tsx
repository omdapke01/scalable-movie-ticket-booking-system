import { ChevronDown, Ticket } from "lucide-react";
import { NeonButton } from "@/components/glass/NeonButton";
import { showtimes as defaultTimes, dates as defaultDates } from "@/lib/mock-data";

interface Props {
  selectedCount: number;
  seatLabel: string;
  total: number;
  date: string;
  setDate: (d: string) => void;
  time: string;
  setTime: (t: string) => void;
  onBook: () => void;
  loading?: boolean;
  availableDates?: string[];
  availableTimes?: string[];
}

export function BookingBar({
  selectedCount,
  seatLabel,
  total,
  date,
  setDate,
  time,
  setTime,
  onBook,
  loading = false,
  availableDates = defaultDates,
  availableTimes = defaultTimes,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pt-2 md:px-6 md:pb-6">
      <div className="glass-strong mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl p-4 md:flex-row md:items-center md:gap-6 md:p-5 border border-white/8 shadow-2xl">
        {/* Date Selector */}
        <div className="relative">
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass appearance-none rounded-full py-2 pl-4 pr-9 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            {availableDates.map((d) => (
              <option key={d} value={d} className="bg-surface text-white">
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Showtimes Selector */}
        <div className="flex flex-wrap gap-2">
          {availableTimes.map((t) => {
            const active = t === time;
            return (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-neon text-white shadow-[var(--shadow-glow)]"
                    : "glass text-white/80 hover:text-white"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="hidden h-8 w-px bg-white/10 md:block" />

        {/* Summary */}
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {selectedCount} seat{selectedCount === 1 ? "" : "s"}
          </div>
          <div className="truncate font-mono text-sm text-white/90">
            {seatLabel || "Select seats"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="font-mono text-2xl font-semibold text-white">
            ₹{total}
          </div>
        </div>

        <NeonButton
          disabled={selectedCount === 0 || loading}
          onClick={onBook}
          className="md:px-8 md:py-3.5 w-full justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Reserving...
            </span>
          ) : (
            <>
              <Ticket className="h-4 w-4" /> Book Now
            </>
          )}
        </NeonButton>
      </div>
    </div>
  );
}

// Local spinner stub helper
const Loader2 = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
