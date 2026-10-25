# Keywave — handover

**What this is:** a browser keyboard playground. Three live on-screen keyboards mirror your
physical one and play real switch sounds, a timed typing test at `/test`, and a sound studio
that maps notes and samples to keys at `/studio`.

**Where it stands:** the premium redesign is implemented and pushed (Griffin-inspired
editorial landing, warm monochrome design system, animated glyph texture band). Type-check,
lint, build, and HTTP smoke checks all pass. Visual and interactive behaviour has **not**
been confirmed in a browser (no automation available). Do that first.

---

## 1. Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint (strict rules, see section 8)
npx tsc --noEmit   # typecheck (build also runs it)
npm run build      # Turbopack; every route prerenders static
npm start          # serve the production build
```

- Remote: `https://github.com/WebDevAmey/keystokes.git`, branch `main`.
- Commit style: plain humanized sentences, phase-wise, pushed continuously
  (e.g. "add the animated glyph texture band").
- `AGENTS.md` has an auto re-added Next.js agent block. Never strip it from a diff;
  commit it with your work or `next dev` will recreate it.
- `keysim/` is vendored on purpose (embedded `.git` was stripped); it is in the
  eslint global ignores.

## 2. Routes

| Route | What lives there |
|---|---|
| `/` | Landing: hero -> glyph band -> 01 experience (live keyboard) -> 02 sound (controls + demo) -> 03 customise (colourway chips) -> 04 about (engineering notes) -> closing CTA -> footer. `app/page.tsx` |
| `/test` | Typing test: 15/30/60/120s durations, live WPM/accuracy, red error/caret, hidden input for mobile keyboards, keyboard stage below with sound disabled. |
| `/studio` | Sound studio: SoundCN + synthesized catalog grouped by Notes/Percussion/SoundCN, click-to-select keys, Assign/Preview/Remove/Clear-all, persisted per-key mappings, badge overlay on the stage. |
| `/terms`, `/privacy` | Trust pages describing the real behavior (localStorage only, no accounts/cookies/servers). Marked "needs lawyer review". |

## 3. Architecture map

```
app/
  layout.tsx            fonts (Geist, Geist Mono, Instrument Serif), dark class, metadata
  globals.css           design tokens, kw-btn/kw-eyebrow components, reduced-motion
  page.tsx              landing (server component; client islands imported)
  test/page.tsx  studio/page.tsx  terms/  privacy/
components/
  site-header.tsx       sticky nav, mobile disclosure menu, hydrateStudioPrefs()
  site-footer.tsx       hairline footer, Terms/Privacy/issue links
  site/
    glyph-band.tsx      canvas glyph field (see section 7)
    theme-chips.tsx     Keychron colourways; sets style=keychron + theme
    sound-demo-button.tsx  plays one switch sample via the shared engine
  studio/
    KeyboardSwitcher.tsx   stage: picks one of the 3 keyboards, forwards key events
    StyleSegmented.tsx     MacBook / Keychron / mac-keyboard pills
    sound-controls.tsx     SoundToggle, VolumeSlider, SoundProfileSelect
    music-studio.tsx       /studio client experience
    AudioStatusPill.tsx    live engine status (idle/loading/ready/unavailable)
  test/typing-test.tsx  + test/words.ts (deterministic server word snapshot)
  ui/
    mac-keyboard.tsx         MacBook board (dark aluminium material)
    keyboard.tsx             Keychron K2 with 6 colour themes (classic/mint/royal/dolch/sand/scarlet)
    registry-mac-keyboard.tsx  componentry mac-keyboard, adapted (editable/IME/modifier guards)
lib/
  studio-store.ts       useSyncExternalStore store: style, soundEnabled, volume, soundProfile, keychronTheme
  key-sound.ts          KeySoundEngine: one AudioContext, lazy sample, per-key segments, prime/play/status/subscribe
  sound-engine.ts       SoundCN playSound/getAudioContext
  sound-profiles.ts     SOUND_PROFILES + charToKeyCode + ASSIGNABLE_GROUPS (notes/percussion/SoundCN)
  music-notes.ts        synthesized C4-C5 notes + kick/snare/hihat (Web Audio, not SoundCN files)
  click-*.ts, coin-collect.ts, confirmation-001.ts, bell-toll-alliance.ts  SoundCN assets
hooks/
  use-physical-keys.ts  window keydown/keyup mirror; skips EDITABLE_SELECTOR; never
                        intercepts modifier combos; clears on blur + visibilitychange;
                        blocks page scroll only for Space/arrows/PageUp/PageDown
  use-key-mappings.ts   localStorage mappings (keywave.mappings.v1) via external store
```

## 4. Design system

Tokens live in `app/globals.css` (`:root`) and are exposed to Tailwind as `kw-*` utilities:

| Token | Value | Use |
|---|---|---|
| `--kw-bg` | `#0a0a09` | canvas |
| `--kw-surface` | `#141412` | panels |
| `--kw-text` | `#f1ede3` | primary text, primary pill fill |
| `--kw-muted` | `#b7b3a9` | body copy |
| `--kw-subtle` | `#8a877f` | mono labels (AA on bg, ~5.8:1) |
| `--kw-border` | `#26262a` | hairlines |

- Type: Instrument Serif (`font-display`) for headlines, Geist Sans default, Geist Mono
  (`font-mono`) for eyebrows/microcopy/stats (`kw-eyebrow` class).
- Buttons: `.kw-btn` base + `.kw-btn-primary` (off-white fill, dark text) /
  `.kw-btn-secondary` (hairline outline). Focus: `outline-kw-text`.
- Semantic colors only for meaning: red = typing errors, emerald = audio ready,
  amber = audio loading/degraded.
- No brand accent, no em dashes in user-facing copy (use middots/periods), no
  glassmorphism/gradients on chrome (keycap material shading is intentional).
- `html` carries the `dark` class so `dark:` variants (registry keyboard material) resolve.

## 5. Sound engine (the identity)

- `lib/key-sound.ts` — `KeySoundEngine`: single shared `AudioContext` (created lazily),
  one sprite sample, per-key `[offset, duration]` segments for down/up, volume + enabled,
  status stream (`idle | loading | ready | unavailable`) that `AudioStatusPill` renders.
  Call `keySound.prime()` after a gesture; `keySound.play(segment)` to trigger.
- `lib/sound-profiles.ts` — typing-test profiles (`charToKeyCode` maps a typed char to the
  key that plays its sound) and `ASSIGNABLE_GROUPS` for the studio:
  SoundCN assets, synthesized notes (C4-C5), synthesized percussion.
- `lib/music-notes.ts` — Web Audio synthesis for notes/percussion. These are **not**
  SoundCN samples; do not invent remote URLs.
- `lib/sound-engine.ts` + `lib/click-*.ts` etc. — the SoundCN runtime (npx shadcn add
  from `https://soundcn.xyz/r/<name>.json`).
- Rules: audio only after a real gesture; mute/volume reflect live engine state; a failed
  sample load must never break the keyboard (status pill shows "unavailable").

## 6. Keyboard layer (shared contract)

All three boards render inside `KeyboardSwitcher` and share this event shape:

```ts
type StageKeyEvent = { code: string; phase: "down" | "up"; source: "physical" | "pointer" };
```

- Physical input is centralized in `hooks/use-physical-keys.ts` (Keychron and MacBook use
  it; the registry board has its own equivalent with the same guard rules).
- Guard rules (do not regress these):
  - skip events from editable fields (`EDITABLE_SELECTOR` includes the typing test's
    `data-typing-input`),
  - never intercept modifier combos (`⌘R`, `⌘W`, … pass through),
  - dedupe overlapping pointer/physical presses; ignore stray key-ups,
  - release held keys with `up` events on window blur and `visibilitychange`,
  - pointer capture so leaving the board does not stick keys.
- `markers: Record<code, label>` draws mapped-sound badges; `enableSound={false}` lets a
  page own the audio (used by `/test`).
- The registry board ships `soundSrc=""` and routes presses through the shared engine.

## 7. Glyph band (signature texture)

`components/site/glyph-band.tsx` — canvas field of `01/\:.+=*#%@` glyphs.
- Own rAF loop, throttled (~70ms desktop / ~120ms mobile), DPR capped at 2.
- No React state per frame; allocations only on resize.
- Pauses via IntersectionObserver + `visibilitychange`; static single frame under
  `prefers-reduced-motion`; pointer illumination disabled on touch.
- Canvas is `pointer-events-none`; wrapper is `aria-hidden`.

## 8. State and persistence

| Key | Where | Contents |
|---|---|---|
| `keywave.prefs.v1` | `lib/studio-store.ts` | style, soundEnabled, volume, soundProfile, keychronTheme — hydrated in `SiteHeader` via `hydrateStudioPrefs()` |
| `keywave.mappings.v1` | `hooks/use-key-mappings.ts` | per-key sound assignments for the studio |

Both use the external-store (`useSyncExternalStore`) pattern — required because Next 16
`cacheComponents` prerenders these pages, and because the lint config forbids
`setState` inside `useEffect`. Server snapshots must be deterministic
(see `components/test/words.ts`); no `Math.random()` during render.

## 9. Conventions and constraints

- Next.js 16.4.3, React 19, TS strict, Tailwind v4. Read `node_modules/next/dist/docs/`
  before assuming familiar Next patterns (see the AGENTS.md block).
- Lint rules that bite: no `setState` in effects, no `Date.now()`/refs during render, no
  render-variable reassignment. Use external stores / `useMemo` derivations.
- Fonts via `next/font/google`; do not hardcode font-family strings (canvas reads the
  `--font-geist-mono` CSS variable instead).
- Accessibility floor: AA contrast (`kw-muted`/`kw-subtle` are the low end), visible
  `outline-kw-text` focus rings, labeled controls, keyboard-operable menus, reduced
  motion honored globally in `globals.css`.
- Do not add dependencies without checking what already exists; the redesign added zero.

## 10. Verification status (honest)

Passed on the final build (commit `2598254`):
- `npx tsc --noEmit` — clean
- `npm run lint` — clean (0 errors, 0 warnings)
- `npm run build` — all 6 routes static
- Production smoke: `/`, `/test`, `/studio`, `/terms`, `/privacy` all HTTP 200; landing
  HTML contains hero copy, section headings, CTAs, mobile menu, glyph canvas, 78 keycaps;
  prod CSS has `kw-btn` token rules, reduced-motion media queries, zero `violet`.

**Not verified (no browser tooling in the build environment):**
- Visual layout at 360/390/768/1024/1440+ and horizontal-overflow checks
- Sound audibility, latency, mute/volume behavior with real audio devices
- Physical-key mirroring, stuck-key guards, mapping persistence across reloads
- Canvas frame rate and glyph band feel; mobile typing with the hidden input
- Console for hydration warnings

## 11. Known limitations / next steps

1. **Browser QA pass** — the top task for whoever picks this up (list above).
2. Musical notes/percussion are synthesized, not SoundCN samples (documented in code and
   `DESIGN_BRIEF.md`). Replace with real samples only if licensed ones exist.
3. `/terms` and `/privacy` need a lawyer review before any real release.
4. `board.ui` was unreachable during component research; recorded as a limitation in
   `DESIGN_BRIEF.md` — revisit if component polish is needed.
5. Optional (deliberately skipped): key-activity meter in the sounds section, hover-reveal
   micro-annotations on keycaps. Add only if they stay restrained.
6. Keychron `royal` theme reuses `MINT_DARK_KEYS` overrides (pre-existing; cosmetic only).

## 12. Recent history (last redesign)

Phases, each pushed as separate commits:

1. Foundation — tokens, Instrument Serif, header/footer (`96e5612`, `5a7534e`)
2. Signature band — `glyph-band.tsx` (`bddde0d`)
3. Landing — Griffin hero + sections + stage restyle (`4ea01bc`, `d3b11d1`)
4. Palette sweep — sound controls, typing test, studio, keycap badges, trust pages
   (`87e20db`, `3ebdcb7`, `7b65a45`)
5. Input hardening — registry/mac key release fixes (`49a4e58`)
6. Docs + motion — `DESIGN_BRIEF.md`, global reduced-motion (`fe8c05d`, `2598254`)

Earlier history (from `80f4811` backwards): SoundCN sounds, three-keyboard stage,
typing test, music studio, persistence, terms/privacy, landing gateway.
