
## Scope

Two web pages inspired by VisionOS / Netflix / Linear, adapted from the mobile mockup to desktop-first responsive layouts:

1. `/movie` — Movie Detail page (Dune II)
2. `/seats` — Seat Selection page

All data is hardcoded. No backend, no auth. A minimal top nav links the two pages.

## Design system (src/styles.css)

Dark theme tokens defined as CSS custom properties, mapped through `@theme inline` so Tailwind utilities like `bg-background`, `text-foreground`, `border-border`, `bg-accent` all work:

- `--background` `#09090B`
- `--surface` (secondary bg) `#111827`
- `--glass` `rgba(255,255,255,0.06)`
- `--border` `rgba(255,255,255,0.08)`
- `--primary` `#8B5CF6` (purple)
- `--secondary-accent` `#4F46E5` (indigo)
- `--success` `#10B981`, `--danger` `#EF4444`
- `--foreground` `#F9FAFB`, `--muted-foreground` `#9CA3AF`
- Gradients: `--gradient-neon` (purple → indigo), `--gradient-aurora` (radial purple/blue blobs)
- Shadows: `--shadow-glow` (soft purple glow), `--shadow-glass` (inner + drop)

Fonts loaded via `<link>` tags in `__root.tsx` head (Google Fonts): Space Grotesk (headings), Inter (body), JetBrains Mono (numbers — Geist Mono isn't on Google Fonts, JetBrains Mono is the closest free equivalent). Registered as `--font-display`, `--font-sans`, `--font-mono` in `@theme`.

Reusable primitives:
- `GlassCard` — `bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl` with subtle inner highlight.
- `NeonButton` — gradient purple→indigo, glow on hover, scale 1.04.
- `AuroraBackground` — fixed, blurred purple + blue radial gradients slowly drifting (CSS keyframes, no JS).

## Movie Detail page (`/movie`)

Layout (desktop):
- Fullscreen backdrop image (generated hero of a cinematic sci-fi scene) with dark gradient overlay + slow zoom (CSS `animation: subtle-zoom 20s ease-in-out infinite alternate`).
- Floating glass navbar at top (Home / Movies / Events / Tickets / Profile).
- Two-column hero: left = poster (generated), right = title "DUNE II", rating stars, chip row (Adventure · Sci-Fi · 2h 40m), two CTAs: `Watch Trailer` (glass) and `Book Tickets` (neon gradient → routes to `/seats`).
- Below the fold, an animated tab strip: Overview / Cast / Crew / Gallery / Reviews / Similar. Active tab indicator is a purple underline that slides between tabs (Framer Motion `layoutId`).
- Tab panels: Overview shows synopsis + meta grid; Cast shows glass avatar cards; others are lightweight placeholders styled consistently.

Mobile: single column stack, poster full-width, tabs become horizontally scrollable.

## Seat Selection page (`/seats`)

Layout (desktop):
- Same aurora background + glass navbar.
- Top: curved SCREEN element — a wide arc rendered with `border-radius` + soft purple glow underneath (`box-shadow`), label "SCREEN" in mono.
- Seat grid: 10 rows × 14 seats, rows labeled A–J on both sides. Each seat is a rounded-square button (~36px) with the row-number label in JetBrains Mono, states styled from tokens:
  - Available: glass, subtle border, hover → lift (`translate-y-[-2px]`) + purple glow
  - Selected: filled purple gradient, glow, scale pop (Framer Motion)
  - Sold: dimmed grey, disabled
  - VIP: amber accent border, subtle amber glow (middle rows)
  - Aisle gaps between seat groups (columns 4–5 and 10–11 skipped)
- Legend row (Available / Selected / Sold / VIP) as glass chips.
- Sticky bottom booking bar (glass, blurred): date pill (Mar 03 ▾), showtime pills (9:30 AM active, 12:30 PM, 4:00 PM, 7:15 PM), selected-seat summary ("A10, A11 · 2 seats"), total `₹620` in mono, and a large neon `Book Now` button. Total updates reactively from selected seats.

State: local `useState<Set<string>>` for selected seats. Click toggles selection unless sold. Simple price map (VIP ₹450, standard ₹250).

Mobile: seat grid gets horizontal scroll inside a glass frame; bottom bar stacks vertically.

## Animations

- Framer Motion (`motion` package): tab underline (`layoutId`), seat pop on select (`whileTap` scale), card hover lift, page fade-in.
- CSS keyframes: hero backdrop slow zoom, aurora blob drift, button gradient shift on hover, skeleton shimmer utility (defined but unused this pass).
- All motion respects `prefers-reduced-motion` via a media-query override that disables transforms.

## Routes / files

- `src/routes/__root.tsx` — add font `<link>` tags, real title/description ("CineGlass — Book Cinema Tickets"), og tags. Keep `<Outlet />`.
- `src/routes/index.tsx` — replace placeholder with a small landing that links to `/movie` (keeps `/` from being blank; not a full landing page this pass).
- `src/routes/movie.tsx` — Movie Detail page + own `head()`.
- `src/routes/seats.tsx` — Seat Selection page + own `head()`.
- `src/components/glass/GlassCard.tsx`, `NeonButton.tsx`, `AuroraBackground.tsx`, `GlassNavbar.tsx`.
- `src/components/seats/SeatGrid.tsx`, `SeatLegend.tsx`, `BookingBar.tsx`.
- `src/components/movie/MovieHero.tsx`, `MovieTabs.tsx`.
- `src/lib/mock-data.ts` — movie + seats + showtimes.
- `src/styles.css` — tokens, gradients, keyframes, `@theme inline` mapping.
- Generated images (fast tier) saved to `src/assets/`: `dune-backdrop.jpg`, `dune-poster.jpg`, 3 cast headshots. Imported as ES modules.

## Dependencies

- Add `motion` (Framer Motion successor) via `bun add motion`. Nothing else new — `lucide-react` and shadcn already present.

## Out of scope this pass

Landing/search/checkout/success/profile/admin, real auth, real bookings, trailer video, confetti, QR generation, wishlist, globe, admin analytics. Design system is built so those pages can be added later without rework.
