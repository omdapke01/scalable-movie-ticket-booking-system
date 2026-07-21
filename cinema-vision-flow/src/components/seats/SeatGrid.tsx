import { motion } from "motion/react";
import { rows, seatsPerRow, seatStatus, type SeatStatus } from "@/lib/mock-data";

interface Props {
  selected: Set<string>;
  onToggle: (id: string) => void;
  seatMap: any[];
}

export function SeatGrid({ selected, onToggle, seatMap }: Props) {
  return (
    <div className="glass-strong mx-auto w-full max-w-4xl rounded-3xl p-6 md:p-10 border border-white/8 shadow-2xl">
      {/* Screen */}
      <div className="mb-10 flex flex-col items-center">
        <div
          className="relative h-16 w-full max-w-2xl"
          style={{
            background:
              "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(139,92,246,0.85), rgba(139,92,246,0.05) 70%)",
            borderRadius: "50% 50% 50% 50% / 100% 100% 0 0",
            filter: "blur(0.5px)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
              boxShadow: "0 0 40px 8px rgba(139,92,246,0.6)",
            }}
          />
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Screen
        </div>
      </div>

      {/* Seats */}
      <div className="overflow-x-auto">
        <div className="mx-auto min-w-max space-y-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <div className="w-5 text-center font-mono text-[10px] text-muted-foreground">
                {row}
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: seatsPerRow }).map((_, i) => {
                  const col = i + 1;
                  const gap = col === 5 || col === 11 ? "ml-3" : "";
                  const id = `${row}${col}`;

                  // Resolve active seat status from database map
                  const dbSeat = seatMap.find((s) => s.seatCode === id);
                  let status: SeatStatus = seatStatus(row, col);

                  if (dbSeat) {
                    if (dbSeat.status === "BOOKED" || dbSeat.status === "RESERVED") {
                      status = "sold";
                    }
                  }

                  const isSelected = selected.has(id);
                  return (
                    <Seat
                      key={id}
                      id={id}
                      col={col}
                      status={status}
                      selected={isSelected}
                      onClick={() => onToggle(id)}
                      className={gap}
                    />
                  );
                })}
              </div>
              <div className="w-5 text-center font-mono text-[10px] text-muted-foreground">
                {row}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SeatProps {
  id: string;
  col: number;
  status: SeatStatus;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

function Seat({ col, status, selected, onClick, className = "" }: SeatProps) {
  const isSold = status === "sold";
  const isVip = status === "vip";

  const base =
    "relative grid h-8 w-8 place-items-center rounded-md font-mono text-[10px] font-medium transition-all duration-200";
  let styles = "";
  if (selected) {
    styles =
      "bg-gradient-neon text-white shadow-[var(--shadow-glow)] scale-110";
  } else if (isSold) {
    styles = "bg-white/[0.03] text-muted-foreground/30 cursor-not-allowed border border-white/5";
  } else if (isVip) {
    styles =
      "bg-white/[0.04] text-vip border border-vip/40 hover:-translate-y-0.5 hover:shadow-[var(--shadow-vip)] hover:bg-vip/10";
  } else {
    styles =
      "bg-white/[0.04] text-white/70 border border-white/10 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[var(--shadow-glow)] hover:text-white";
  }

  return (
    <motion.button
      type="button"
      disabled={isSold}
      onClick={onClick}
      whileTap={{ scale: isSold ? 1 : 0.9 }}
      className={`${base} ${styles} ${className}`}
      aria-label={`Seat ${col} ${status}${selected ? " selected" : ""}`}
    >
      {col}
    </motion.button>
  );
}
