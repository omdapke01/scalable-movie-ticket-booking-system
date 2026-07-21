export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-60 blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55), transparent 65%)",
        }}
      />
      <div
        className="absolute top-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full opacity-50 blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.5), transparent 65%)",
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[60vh] w-[60vh] rounded-full opacity-40 blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.45), transparent 65%)",
          animationDelay: "-12s",
        }}
      />
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
