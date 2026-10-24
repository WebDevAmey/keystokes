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
- **References:** monkeytype (the typing text *is* the interface; no chrome around it),
  Keychron/keyboard product photography (keycaps have real material and shadow logic),
  Teenage-Engineering hardware labels (small mono labels, utility with a wink).

## Design system (tokens in use)

- **Colour:** background near-black `#09090b`; typing-test plum `#140f18` (chosen so the
  test screen feels like a different room). Surfaces = white at 2.5–3% alpha; hairlines =
  white at 7–8%. One accent: violet `#7c3aed` / `violet-300` (selection, focus, brand).
  Semantic only: red = typing errors, emerald = audio ready, amber = audio degraded.
  Text floor: `zinc-400` on dark backgrounds (AA for body text; `zinc-300/white` for
  emphasis). Hierarchy comes from size and weight, not sub-AA greys.
- **Type:** Geist Sans for tool chrome (dense, neutral, ships self-hosted with the app,
  so it is a deliberate keep from the scaffold, not a habit choice). Geist Mono for the
  typing passage and all numbers (WPM, timer, volume %) because this product is literally
  about keys and characters; mono is the subject matter, not decoration.
- **Shape:** radius by role — panels `2xl`, inputs/buttons `xl`, chips/switches `pill`,
  keycaps clamped tiny (they follow physical key geometry, not UI fashion).
- **Elevation:** borders and tone first. Shadows exist only on keycaps (material realism:
  a cap lifts when pressed) and under the active pill.
- **Icons:** lucide, sparse: two wayfinding marks on the landing gateways, control
  affordances (volume, restart, remove) only. No emoji, no sparkle AI-signalling.
- **Motion:** state feedback only — keycap press (75–100ms), caret pulse on the current
  character, segment/knob slide on selection. No hover lifts, no entrance choreography.

## Decisions recorded against the vibe-codead tells

- No gradients on text/buttons; the gradients that exist are keycap/aluminium material
  shading inside the keyboard component (product realism).
- No glassmorphism, orbs, dot grids, bento, checkmark lists, terminal mockups, fake
  testimonials, pricing, or logos.
- Two-card landing row is kept: there really are exactly two destinations, and the
  navigation itself sits in the header pill.
- Landing shows the live keyboard in the first scroll: the product is the hero.
- Em dashes are avoided in user-facing copy; copy states what the thing does.
- Trust layer: `/terms` and `/privacy` describe the actual behavior (localStorage only,
  no accounts, no servers, no cookies) and are linked in every footer. They need a
  lawyer's review before this is treated as a real release.
