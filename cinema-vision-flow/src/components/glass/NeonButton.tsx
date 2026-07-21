import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "neon" | "glass";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export const NeonButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "neon", className = "", children, ...rest }, ref) => {
    const base =
      "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";
    const styles =
      variant === "neon"
        ? "text-white bg-gradient-neon shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] hover:brightness-110"
        : "glass text-white hover:bg-white/[0.09]";
    return (
      <button ref={ref} className={`${base} ${styles} ${className}`} {...rest}>
        {variant === "neon" && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)",
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
NeonButton.displayName = "NeonButton";
