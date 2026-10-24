# Keywave — design brief

## Product truth

- **Who opens this:** people who care about mechanical keyboards and typists who want to
  practice. They arrive playful, not rushed. They want to press something within seconds.
- **The one job:** press keys and hear/see them respond. Two structured ways to do it:
  a timed typing test, and a studio where keys get mapped to notes and sounds.
- **The real output (this is the hero):** the keyboard itself. Three real, pressable
  on-screen keyboards (MacBook, Keychron K2, registry mac-keyboard) that mirror a physical
  keyboard and play real samples. A WPM/accuracy score after a test.
- **Personality (3):** tactile, quiet, playfully precise.
  **Not (3):** corporate, gradient-slick, hype-driven.
- **References:** Griffin (vibrant.design) for hero composition and restraint — left-aligned
  editorial serif headline, compact uppercase nav, filled + outline pill pair, right-aligned
  technical microcopy, full-width glyph band as the transition into the product.
  monkeytype (the typing text *is* the interface), Keychron product photography (keycap
  material logic), Teenage-Engineering hardware labels (small mono annotations).

## Design system (tokens in use)

- **Colour — warm monochrome** (Griffin-derived, verified for AA on `#0a0a09`):
  canvas `--kw-bg #0a0a09`, surface `--kw-surface #141412`, text `--kw-text #f1ede3`,
  muted `--kw-muted #b7b3a9`, subtle `--kw-subtle #8a877f` (≈5.8:1, AA), hairline
  `--kw-border #26262a`. No bright brand accent: hierarchy comes from fill vs outline
  (off-white pill = primary). Semantic only: red = typing errors, emerald = audio ready,
  amber = audio degraded/loading. The old violet accent and the plum test room were
  removed in the redesign for palette consistency.
- **Type:** Instrument Serif for display headlines (editorial voice, clamp-scaled,
  tight tracking); Geist Sans for interface; Geist Mono for technical microcopy, eyebrows,
  stat numbers, and the typing passage (the product is about characters — mono is the
  subject matter).
- **Shape:** radius by role — pills for actions, `xl` panels, chips `full`, keycaps follow
  physical key geometry, not UI fashion.
- **Elevation:** borders and tone first. Shadows exist only on keycaps (material realism)
  and mapped-sound badges get a hairline ring instead of a glow.
- **Motion:** state feedback only — keycap press, caret pulse, segment/knob slide, plus the
  canvas glyph band (own rAF loop, paused when hidden/off-screen, static under
  `prefers-reduced-motion`). No hover lifts, no entrance choreography.

## Component library research (recorded)

- **Space UI (spaceui.one):** accessible; shadcn registry `@spaceui/essentials`, Base UI +
  Tailwind, MIT. Offerings are mostly decorative (orbs, reels, animoji). Nothing adopted.
- **Kobra (kobra.systems):** accessible; `Kbd` is listed free but its source is Pro-gated
  behind a blur/paywall ($19), so we keep our own trivial key-hint styling. Its `Sound`
  component ships full source but depends on `@web-kits/audio` and would duplicate
  Keywave's own engine — inspected, not adopted.
- **Board UI (board.ui):** unreachable (connection failed via fetch and curl).
  Limitation recorded; no components could be verified.
- **UIarc / Arc UI (uiarc.dev):** accessible; shadcn registry, 185 components, many Pro
  ($249). Borrowed only the idea of restrained in-view headline treatment; no package added.
- **Decision:** zero new dependencies. The landing, controls, segmented pills, and glyph
  band are built directly in Keywave's token system; the existing sound engine and
  keyboard components stay the source of truth.

## Decisions recorded against the vibe-codead tells

- No gradients on text/buttons; the gradients that exist are keycap/aluminium material
  shading inside the keyboard component (product realism).
- No glassmorphism, orbs, dot grids, bento, checkmark lists, terminal mockups, fake
  testimonials, pricing, or logos.
- The landing tells one story: hero → glyph band → live keyboard (01) → sound controls
  (02) → colourways/per-key map (02/03) → engineering notes (04) → closing action.
  The product is reachable in one scroll; no decorative-only sections.
- Em dashes are avoided in user-facing copy; copy states what the thing does.
- Trust layer: `/terms` and `/privacy` describe the actual behavior (localStorage only,
  no accounts, no servers, no cookies) and are linked in every footer. They need a
  lawyer's review before this is treated as a real release.
