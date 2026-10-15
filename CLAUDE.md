# whatseasonisitinhorizon.com

A single static page: the current Forza Horizon 4 season, a countdown that matches the in-game timer, and a random community photo. Start with `docs/DESIGN.md` (what to preserve) and `docs/DECISIONS.md` (why things are this way).

## Commands

- `pnpm dev`: build, then serve `dist/` at http://localhost:4173
- `pnpm check`: typecheck, tests and build. Run it before committing.
- `pnpm screenshots [ISO time]`: Chrome screenshots at 8 viewports into `.cache/screenshots/`. Needs `pnpm serve` running. Pass a time to see a specific timer state, e.g. `2026-10-15T14:29:53Z` → `07 SECONDS`.

## Layout

- `src/season.ts`: pure season and countdown maths. Fully tested, with no DOM.
- `src/page.ts`: browser script. It is inlined into `<head>` and runs before first paint.
- `src/backgrounds.ts`: the curated photo list and credits. Excluded photos stay listed, with a reason.
- `src/index.html` and `src/styles.css`: the template. `{{VARS}}` are filled by `scripts/build.ts`.
- `assets/`: source art (photos, Illustrator `.ai` files and SVGs, TTF fonts, icons). Never served directly.
- `scripts/build.ts` → `dist/`: photos to AVIF and JPEG (hashed, cached in `.cache/`), font subsets, inlined SVG, JS and CSS, CSP hashes.

## Verified facts

- FH4 seasons change **Thursdays 14:30 UTC**, cycling weekly winter → spring → summer → autumn. Winter began 2018-11-08. Sources: Microsoft via Stevivor, and Wikipedia (checked 2026-10-14).
- GoatCounter doesn't record which domain a hit came from, so this site reports paths as `whatseasonisitinhorizon.com/` to keep them separate from tuckerchap.in's `/` under the shared `tuckerchapin` code. It only counts on the production hostname.
- Render has pnpm preinstalled. Don't `corepack enable` there (read-only `/usr/bin`). Node 25+ also no longer bundles corepack.
- pnpm 12 fails CI installs (`ERR_PNPM_IGNORED_BUILDS`) on any unapproved install script, where locally it only warns. Approvals live in `pnpm-workspace.yaml` (`allowBuilds`). Reproduce with `CI=true pnpm install --frozen-lockfile`.

## Pitfalls

- **Never use local-time Date APIs for season maths.** The 2018 site used `setDate()` and ran 1h short during DST. Keep everything as UTC milliseconds.
- **Helpers in `page.ts` must be `function` declarations.** The top-level code runs immediately, and esbuild lowers `const` arrows to `var`, so they are `undefined` when called. The symptom is "X is not a function".
- **No inline `style=""` in markup.** The CSP hashes `<script>`/`<style>` blocks only. Illustrator SVGs use style attributes for gradient stops, and svgo's `convertStyleToAttrs` handles them.
- svgo `prefixIds` also prefixes class names unless `prefixClassNames: false`, which breaks the `[data-season] .spring` switch.
- Don't wait for `DOMContentLoaded` to fill the timer. Browsers paint streamed HTML before it fires. `mountSeason()` runs inline right after the markup instead.
- Adding a glyph to the timer (a new label, for example) means updating the subset strings in `FONTS` in `build.ts`.
- In portrait the timer is a fixed 13.8em × 4.4em pill, and its font size is derived from its width (`--timer-em` in `styles.css`). The widest label, "AUTUMN STARTS IN", measures 13.78em. If you change the labels, fonts or padding, re-measure it, or the text will overflow on narrow screens.

## Invariants

- First paint shows the correct splash and a blurred placeholder of the chosen photo. The timer is never painted half-filled.
- Every file in `assets/backgrounds/` is listed in `backgrounds.ts`. `test/backgrounds.test.ts` enforces this.
- The timer display rules (see `countdown()` and its tests) mirror the in-game timer. Change them only on purpose.
