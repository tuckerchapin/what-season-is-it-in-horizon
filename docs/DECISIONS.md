# Decisions

## ADR-001: Render static site rather than an SSR web service (2026-10-14)

**Decision:** a Render static site serves one prebuilt HTML file from Render's CDN. All per-visit choices (season, countdown, random photo) are made by a ~3 KB inline script in `<head>` before first paint.

**Why:** the goals are the fastest load and no flash of unstyled content. A static file from a CDN edge has the lowest time to first byte. Everything that varies per visit depends on the visitor's clock, which the client knows exactly, and it's cheap to compute before first paint.

**Rejected: SSR web service.**
- **Slower:** it would run in a single region, every request would hit Node, and a time-dependent response can't be cached at the edge, so time to first byte is higher everywhere far from the region.
- **No visual gain:** the countdown still needs client-side ticking, so SSR wouldn't remove any client JS.
- **More to maintain:** health checks, cold starts, and a server.

## ADR-002: Everything critical is inlined; the photo is the only large request (2026-10-14)

**Decision:**
- **Inlined in the HTML:** CSS, JS, all four splash SVGs (about 9 KB brotli together, switched with CSS) and the clock SVG. The page is about 14 KB brotli.
- **Photo placeholders:** each photo has an inline 25-byte ThumbHash that is decoded to a blurred placeholder on the first frame.
- **Fonts:** preloaded WOFF2 subsets of about 25 KB total with `font-display: block`, so there is never a fallback-font flash.

**Rejected:**
- **Inlining fonts as base64:** this would roughly double the HTML and couldn't be cached between visits.
- **Loading only the current season's splash:** the splash would pop in after first paint.
- **Inline LQIP JPEGs:** about 10 KB, versus 1.2 KB for ThumbHash.

## ADR-003: Photos are AVIF with a JPEG fallback, at several widths (2026-10-14)

**Decision:**
- **Formats and widths:** AVIF (q50) plus mozjpeg JPEG (q75) at 640, 1280, 1920, 2560 and 3840w, capped at the source width.
- **Choosing a width:** the `sizes` attribute accounts for `object-fit: cover` on viewports narrower than the photo, and for the blurred portrait layout, which only needs a small image.
- **Speed:** the chosen image is preloaded from `<head>` with `fetchpriority=high`.

**Result:** a typical 1920w photo is ~120 KB AVIF, down from 0.4–2.7 MB JPEG.

**Rejected:** WebP as a third format. AVIF support is broad enough, and JPEG covers the rest.

## ADR-004: GoatCounter shares the tuckerchapin code, with domain-prefixed paths (2026-10-14)

**Decision:** Tucker asked to reuse the GoatCounter from their other sites. GoatCounter doesn't store the domain a hit came from, so paths are sent as `whatseasonisitinhorizon.com/`.
- **Normally:** a JS-built pixel that carries the referrer and screen size.
- **With JS off:** a `<noscript>` pixel.

Universal Analytics was removed; Google shut it down in July 2023.

**Rejected:** a separate GoatCounter site. Tucker wanted it all in one dashboard.

## ADR-005: Strict CSP via build-time hashes (2026-10-14)

**Decision:** a `<meta>` CSP with `default-src 'none'`. The build computes sha256 hashes for every inline `<script>` and `<style>`. Framing is blocked by headers in `render.yaml`.

**Why:** it's free to do on a page this small and rules out a whole class of injection bugs.

## ADR-006: Darken the timer teal to pass WCAG AA (2026-10-15)

**Decision:** the in-game palette is multiplied by 0.73 in sRGB, which keeps the hue and lowers the brightness. Tucker chose this.

| Use | In-game | Now | Contrast with white |
|---|---|---|---|
| Pill | `#00b592` | `#00846b` | 4.65:1 |
| Clock shadow | `#00a383` | `#007760` | 5.52:1 |
| Text glow | `#008168` | `#005e4c` | 7.76:1 |

The theme color and manifest use the new pill color. The favicon and app icons keep the original teal, because icons aren't text.

**Rejected:**
- **Keeping the original teal:** it's the authentic look, but only 2.62:1. Even large text needs 3:1.
- **Making the text larger:** it wouldn't pass even under the large-text threshold.
