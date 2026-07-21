import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { LayoutDashboard, TrendingUp, Users, DollarSign, Film, Flame, Star } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { movies } from "@/lib/mock-data";
import { motion } from "motion/react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Analytics Panel — CineGlass" }],
  }),
  component: AdminPage,
});

// Mock Analytics Data
const weeklyRevenue = [
  { name: "Mon", revenue: 12000 },
  { name: "Tue", revenue: 15400 },
  { name: "Wed", revenue: 11200 },
  { name: "Thu", revenue: 18900 },
  { name: "Fri", revenue: 25600 },
  { name: "Sat", revenue: 34200 },
  { name: "Sun", revenue: 31000 },
];

const occupancyData = [
  { name: "Audi 1 (IMAX)", rate: 84 },
  { name: "Audi 2 (Dolby)", rate: 68 },
  { name: "Audi 3", rate: 76 },
  { name: "Audi 4", rate: 52 },
  { name: "Audi 5", rate: 45 },
];

const colors = ["#8B5CF6", "#4F46E5", "#10B981", "#F59E0B", "#EC4899"];

function AdminPage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] pb-24">
      <AuroraBackground />
      <GlassNavbar />

      <main className="mx-auto max-w-6xl px-6 pt-32 space-y-8">
        {/* Dashboard Header */}
        <div className="flex items-center gap-3 text-left">
          <div className="p-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-2xl">
            <LayoutDashboard className="h-6 w-6 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Management Portal
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              CineGlass <span className="text-gradient-neon">Analytics</span>
            </h1>
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Weekly Revenue",
              value: "₹1.48 Lakhs",
              icon: DollarSign,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10",
              borderColor: "border-emerald-500/20",
              desc: "+18% from last week",
            },
            {
              title: "Today's Bookings",
              value: "142 Tickets",
              icon: Users,
              color: "text-[#8B5CF6]",
              bgColor: "bg-[#8B5CF6]/10",
              borderColor: "border-[#8B5CF6]/20",
              desc: "78% peak evening load",
            },
            {
              title: "Seat Occupancy",
              value: "68.2%",
              icon: TrendingUp,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10",
              borderColor: "border-blue-500/20",
              desc: "+4.2% average occupancy",
            },
            {
              title: "Top Performer",
              value: "Dune II",
              icon: Flame,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10",
              borderColor: "border-amber-500/20",
              desc: "46% of today's sales",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass-strong rounded-2xl p-5 border border-white/8 text-left flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-muted-foreground">{item.title}</span>
                  <div className="font-display font-bold text-2xl mt-1 text-white">{item.value}</div>
                </div>
                <div className={`p-2 rounded-xl ${item.bgColor} border ${item.borderColor} ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Chart (AreaChart) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-8 glass-strong rounded-3xl p-6 border border-white/8 text-left space-y-4"
          >
            <div>
              <h2 className="font-display font-bold text-lg">Revenue Metrics</h2>
              <p className="text-xs text-muted-foreground">Daily booking transactions in INR (₹)</p>
            </div>
            
            {/* Chart Container */}
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} />
                  <YAxis stroke="#9CA3AF" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Occupancy Chart (BarChart) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-4 glass-strong rounded-3xl p-6 border border-white/8 text-left space-y-4"
          >
            <div>
              <h2 className="font-display font-bold text-lg">Occupancy Ratio</h2>
              <p className="text-xs text-muted-foreground">Percentage load per auditorium</p>
            </div>

            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} tickFormatter={(val) => val.split(" ")[0]} />
                  <YAxis stroke="#9CA3AF" tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Trending Inventory List */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-strong rounded-3xl p-6 border border-white/8 text-left"
        >
          <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
            <Film className="h-5 w-5 text-[#8B5CF6]" />
            <span>Show Catalog Inventory Status</span>
          </h2>
          <div className="divide-y divide-white/5 space-y-3">
            {movies.map((m) => (
              <div key={m.id} className="flex items-center gap-4 py-3 first:pt-0">
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-10 h-14 object-cover rounded-lg border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-sm truncate">{m.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.tagline}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-white/90">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span>{m.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Sales Share</span>
                    <div className="font-mono text-xs font-semibold text-[#8B5CF6] mt-0.5">
                      {m.popularity > 96 ? "High" : m.popularity > 94 ? "Medium" : "Stable"} ({m.popularity}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
