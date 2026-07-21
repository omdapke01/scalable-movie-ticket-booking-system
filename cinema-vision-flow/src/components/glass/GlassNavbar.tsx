import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Film, Home, Ticket, User, Search, LayoutDashboard } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/seats", label: "Tickets", icon: Ticket },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function GlassNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [city, setCity] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedCity") || "Mumbai";
    }
    return "Mumbai";
  });

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem("selectedCity", newCity);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cityChanged"));
    }
  };

  return (
    <nav className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <div className="glass-strong flex flex-wrap items-center justify-center gap-1 rounded-full px-3 py-2 border border-white/8 shadow-2xl">
        <div className="mr-2 flex items-center gap-2 pl-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-neon shadow-[var(--shadow-glow)]">
            <Film className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight hidden xs:inline">
            CineGlass
          </span>
        </div>

        {items.map((it, i) => {
          const active = pathname === it.to;
          return (
            <Link
              key={i}
              to={it.to}
              className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <it.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{it.label}</span>
            </Link>
          );
        })}

        {/* City selection dropdown inside the pill */}
        <div className="ml-2 flex items-center pr-1">
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="bg-[#111827]/40 text-white/90 border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-semibold outline-none hover:border-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 cursor-pointer transition-colors"
          >
            {["Mumbai", "Bangalore", "Delhi", "Pune"].map((c) => (
              <option key={c} value={c} className="bg-[#111827] text-white">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
