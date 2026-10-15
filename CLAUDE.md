# whatseasonisitinhorizon.com

A single static page: the current Forza Horizon 4 season, a countdown that matches the in-game timer, and a random community photo. Start with `docs/DESIGN.md` (what to preserve) and `docs/DECISIONS.md` (why things are this way).

## Commands

- `pnpm dev`: build, then serve `dist/` at http://localhost:4173
- `pnpm check`: typecheck, tests and build. Run it before committing.
- `pnpm screenshots [ISO time]`: Chrome screenshots at 8 viewports into `.cache/screenshots/`. Needs `pnpm serve` running. Pass a time to see a specific timer state, e.g. `2026-10-15T14:29:53Z` → `07 SECONDS`.

## Deploy

- **Render:** static site `whatseasonisitinhorizon` (`srv-db852p8n74is73dr1ug0`) in "il mio workspace". It auto-deploys on every push to `master`, in about a minute.
- **`render.yaml` describes the service but is not a synced Blueprint.** The service was created through the REST API (ADR-007). If you edit headers, the build command or the build filter in `render.yaml`, also apply the change to the service (dashboard, or `POST /v1/services/<id>/headers`), and check it with `curl -sI`.
- **DNS:** at Namecheap. `A @ → 216.24.57.1` and `CNAME www → whatseasonisitinhorizon.onrender.com`; there must be no AAAA records. Render redirects `www` and `http://` to the apex. GitHub Pages is off.
- **The README's `## Meta Preview` section is generated** by `.github/workflows/readme-meta-preview.yml` ([tuckerchapin/readme-meta-preview](https://github.com/tuckerchapin/readme-meta-preview)), daily, from the live site. Don't edit between its markers. After deploying a change to the title, description, favicon or preview image, run `gh workflow run readme-meta-preview.yml`. The bot commits to the default branch, so `git pull` before pushing.

## Verifying changes

Check layout changes in real Chrome. Use `pnpm screenshots`, which covers 11 viewports, including Tucker's tall and narrow window shapes.
- **Measure, don't eyeball:** when a spec is geometric ("same margin", "edges aligned", "centred"), read `getBoundingClientRect()` for the timer and splash at many viewports and compare gaps and edges numerically.
- **Flash of content:** capture a throttled CDP screencast (about 1.6 Mbps, 150 ms latency) and check the first-paint frames.
- **Testing production when local DNS is stale:** use `curl --resolve whatseasonisitinhorizon.com:443:216.24.57.1` or Chrome's `--host-resolver-rules`.
- **axe:** `@axe-core/playwright` needs `browser.newContext()`, not `browser.newPage()`.

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
- `.visually-hidden` elements outside a positioned container need `margin: -1px`. A stray `<p>`'s default margin once pushed one below the viewport and made the whole page scroll.
- Don't wait for `DOMContentLoaded` to fill the timer. Browsers paint streamed HTML before it fires. `mountSeason()` runs inline right after the markup instead.
- Adding a glyph to the timer (a new label, for example) means updating the subset strings in `FONTS` in `build.ts`.
- In portrait the timer is a fixed 13.8em × 4.4em pill, and its font size is derived from its width (`--timer-em` in `styles.css`). The widest label, "AUTUMN STARTS IN", measures 13.78em. If you change the labels, fonts or padding, re-measure it, or the text will overflow on narrow screens.

- **iOS Safari's bars can't show the photo.** Safari 26+ paints the status bar and toolbar in the background colour of the fixed element at each edge (ignoring `theme-color`) and clips fixed elements to the area between them. The `.edge` strips carry each photo's edge colours (`edges` in `build.ts`) on touch screens in portrait. Keep them deeper than 10px and don't put other fixed elements at the screen edges.
- **Never transform or filter the fixed `.backdrop` itself.** The blur and 1.1× zoom live on its `<img>`. A transformed fixed box overflows the viewport, and iOS then lets the page scroll.

## Invariants

- First paint shows the correct splash and a blurred placeholder of the chosen photo. The timer is never painted half-filled.
- Every file in `assets/backgrounds/` is listed in `backgrounds.ts`. `test/backgrounds.test.ts` enforces this.
- The timer display rules (see `countdown()` and its tests) mirror the in-game timer. Change them only on purpose.
