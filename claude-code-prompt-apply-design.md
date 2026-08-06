Apply this extracted design system to my app — the actual colors, type,
spacing, and header from a Stoyangu build, not a generic redesign.

WHAT I'M ATTACHING
1. stoyangu-design-tokens.css — the real design tokens (exact hex colors,
   font families, type scale, spacing, radii, shadows, motion, button
   styles) pulled from the production CSS-variable theme object. This is
   the actual visual system, already in CSS custom property form.
2. StorefrontHeader.tsx — a cleaned-up, working reconstruction of the
   real sticky header: announcement bar, scroll-progress bar, centered
   nav, logo mark (image or generated initial-mark fallback), and CTA
   button, in both desktop and mobile layouts.

WHAT I WANT
1. Load stoyangu-design-tokens.css globally in this app (wherever global
   CSS is imported — find the right spot, e.g. root layout/_app/main
   entry point).
2. Replace this app's current color/spacing/typography choices with
   these tokens wherever they're hardcoded — buttons, headings, body
   text, cards, section spacing. Use the `--sy-*` CSS variables and the
   `.sy-btn` / `.sy-card` / `.sy-section-heading` / `.sy-hero-heading` /
   `.sy-eyebrow` / `.sy-body` utility classes from the token file rather
   than reinventing equivalents.
3. Swap in StorefrontHeader.tsx as this app's header/nav, adapting the
   props (`homeUrl`, `engine`, `storeName`, `logoUrl`, `mode`) to however
   this app currently models its nav items and store/brand info — the
   `engine.header.nav` / `engine.sections` shape is illustrative, map it
   to whatever this app's real header config or nav data looks like.
4. If this app uses Tailwind, make sure `color-mix()`, arbitrary value
   classes (`text-[17px]`, `max-w-[1400px]`, etc.), and the CSS variables
   referenced in style props all work with the existing Tailwind config —
   flag anything that needs a config change instead of silently dropping
   it.
5. Show me a before/after of one page (whichever has the header) so I can
   confirm the visual result before you touch more pages.

Don't change layout structure or content — only the visual system
(colors/type/spacing/shadows) and the header component itself. Leave
everything else as-is for now.
