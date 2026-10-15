# Design notes: what to keep when rebuilding

This is an inventory of the 2018 site (last touched in 2020) that captures what it is meant to do. Keep the intent and replace the code.

The 2026 rebuild addressed every item under "Fragile or broken parts" (see `CLAUDE.md` and `docs/DECISIONS.md`). Paths below refer to the 2018 layout. The art now lives in `assets/`.

## Thesis

1. **Answer the question at a glance.** The page shows which season it is and a live countdown to the next one.
2. **Showcase the community.** The background is a random user-submitted Forza Horizon 4 photo for the current season, chosen on each load.
3. **Be simple.** There is one page with no navigation, no chrome and no scrolling.

## Visual system

### Layout
- **Landscape:** the photo fills the viewport edge to edge. The countdown pill sits in the top-right corner and the season splash sits in the bottom-right, with about 30px of inset. Everything stays on the right so the car in the photo stays visible.
- **Portrait:** the splash comes first and spans the width, then the pill is centred below it. The photo is blurred (10px backdrop blur) so the text stays readable over a cropped image. Getting this blur right took about 8 commits, so it was deliberate.

### Countdown pill (replicates the in-game timer)
- Background `#00B592` (Horizon teal), border radius about 20px, white uppercase text with a `0 0 10px #008168` glow.
- **Clock icon with a long flat shadow:** the shadow (`#00A383`) runs at 45° from the clock face to the bottom-right edge of the pill (`clock-fullshadow.svg`, a 478×330 tile anchored left). The icon is a white ring, a darker inner face and an L-shaped hand.
- Line 1 is `{NEXT} STARTS IN` in PT Sans Regular. Line 2 holds the values.
- **Values:** each number is in PT Sans **Bold** and is larger than its unit. Each unit letter is in **PT Sans Narrow** and is kerned tight against its number (negative left margin), with a gap before the next pair. For example, `10H 15M`.
- **Unit rules:**
  - Hide leading units that are zero (days, then hours).
  - Show minutes whenever days or hours are showing.
  - Show seconds only when less than 1 hour remains, zero-padded to two digits.
  - When less than 1 minute remains, spell out `SECONDS` instead of `S`.
  - Examples: `2D 4H 15M`, `10H 15M`, `15M 03S`, `42 SECONDS`.

### Season splashes (`images/<season>/<season>-splash.svg`)
- Hand-built in Illustrator. The text is converted to outlines so fonts can't break it. The lockup is a slanted italic `HORIZON` / **`SEASON-NAME`** / `SEASON`.
- The season word is white with a thick gradient outline stroke. `SEASON` sits on a slanted rounded bar whose gradient fades in from transparent on the left.
- Palettes:
  - **Winter:** `#139FDC` to `#0279BF`
  - **Spring:** `#B7CF22` to `#509844`
  - **Summer:** `#F8B732` to `#F06E30`
  - **Autumn:** `#EE5630` to `#9B2B1B`
- All four share the same geometry (about 575–665 × 357 viewBox, 21 paths, one stroke gradient and one field gradient). The `.ai` sources are in the repo.
- The `.png` exports are stale and are missing the `HORIZON` wordmark. The live site uses the SVGs.

### Type
PT Sans (Regular and Bold) and PT Sans Narrow (Regular). The other five weights in `fonts/` are never used.

## Behaviour

- **Season maths:** Winter started on 2018-11-08 at 14:30 UTC. Seasons last one week each, in the order winter → spring → summer → autumn, and change on Thursdays at 14:30 UTC.
- **Tab title:** `It's {season} in Horizon`.
- **Background choice:** a random pick from a hand-curated per-season list. Some images are deliberately excluded:
  - Images below 1080p: `-MattyMcFly-1` and `ur4ddiction-1`.
  - Not liked: `parkel42-3`.
- **Live season change:** when the season rolls over while the page is open, the splash, title and background all swap.
- **Credits:** the filename encodes the credit (`<reddit username>-<n>.jpg`, shown as `/u/<username>`). In-game watermarks were removed from the submissions by hand.

## Fragile or broken parts

| Issue | Effect |
|---|---|
| `setDate()` adds days in **local time** from a November anchor (`times.js`) | **In DST timezones the countdown runs 1 hour short for half the year.** It is happening today: New York and London show 10h, while UTC and Sydney correctly show 11h. The screenshot showing `10H 15M` is wrong. |
| The minute `setInterval` is not aligned to minute boundaries | The display lags by up to 59s. It drifts and is throttled in background tabs. It does not resync after sleep or when the tab becomes visible again. |
| The second/minute switch condition `(hours === 1 && minutes === 0)` | Odd: the switch happens at exactly 1:00:xx rather than when time drops below 1h. Mostly harmless but fragile. |
| `Math.abs()` on elapsed time | Gives the wrong answer before the anchor date. This is moot now. |
| Credits only appear in `console.log` and the meaningless `document.body.alt` | Contributors get no visible credit. `OriginalForzaCoverArt` and `OfficialForzaCoverArt` would be credited as reddit users. |
| The background is set by JavaScript as CSS `background-image` | Nothing renders until the JS runs, so the largest image is discovered late (bad LCP). There is no fallback without JS, and no alt text or description. |
| Images are 0.3–2.7 MB JPEGs at mixed sizes (up to 6880×2880) | Every load is a heavy, unoptimised download, worst on mobile. There is no AVIF or WebP and no responsive sizes. |
| Fonts are TTFs of about 400 KB each with no `font-display` | The page loads about 1.3 MB of fonts with a flash of invisible text. They could be subset WOFF2 files of about 15 KB. |
| Universal Analytics `UA-52798147-7` | Google shut UA down in July 2023, so this is a dead third-party script. |
| No `<meta viewport>`, `lang`, `charset` or description, and no OG or Twitter tags | Mobile scaling relies on the browser's own heuristics. The page has poor SEO and no share previews. |
| The splash `<img>` has no alt text, and the countdown has no live region or text equivalent | Screen readers announce nothing useful. |
| `user-select: none` on `*` and `overflow: hidden` on html | You can't copy the time, and content gets clipped on short or zoomed viewports. |
| Fixed px sizes and an orientation-only breakpoint (portrait uses 60–80px type) | Breaks on short landscape phones, split-screen, foldables and huge displays. |
| 10+ legacy icon `<link>`s and `msapplication` tiles | Clutter: a single SVG icon, a 180px Apple touch icon and a manifest would cover everything. |

## Repo cruft
- `images/spring/Syt1976-1.jpg` is an orphan, outside `backgrounds/` and in no list.
- Unused files: `clock-square.*`, `clock-round.png`, all splash `.png` files, five font files, and the excluded backgrounds.
- The repo is 146 MB, almost all of it images. GitHub Pages uses a legacy build from the `master` root with CNAME `whatseasonisitinhorizon.com`.
