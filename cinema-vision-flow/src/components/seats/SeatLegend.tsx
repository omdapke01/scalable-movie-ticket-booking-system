const items = [
  { label: "Available", cls: "bg-white/[0.06] border border-white/10" },
  { label: "Selected", cls: "bg-gradient-neon shadow-[var(--shadow-glow)]" },
  { label: "VIP", cls: "bg-white/[0.04] border border-vip/50" },
  { label: "Sold", cls: "bg-white/[0.03]" },
];

export function SeatLegend() {
  return (
    <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5"
        >
          <span className={`h-3.5 w-3.5 rounded-[4px] ${it.cls}`} />
          <span className="text-xs text-white/80">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
