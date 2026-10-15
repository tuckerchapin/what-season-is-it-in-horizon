/**
 * Builds the static site into dist/:
 *   - photos → AVIF + JPEG at several widths (content-hashed, cached in .cache/), plus ThumbHash placeholders
 *   - fonts → WOFF2 subsets containing only the glyphs the timer uses
 *   - splash/clock SVGs → optimised and inlined into the single HTML page
 *   - page.ts → minified IIFE inlined in <head>; CSS inlined; CSP hashes computed
 */
import { createHash } from "node:crypto";
import { cpus } from "node:os";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { build as esbuild, transform } from "esbuild";
import sharp from "sharp";
import subsetFont from "subset-font";
import { optimize } from "svgo";
import { rgbaToThumbHash } from "thumbhash";
import { backgrounds } from "../src/backgrounds.ts";
import type { Photo } from "../src/page.ts";
import { SEASONS, type Season } from "../src/season.ts";

const ORIGIN = "https://whatseasonisitinhorizon.com";
const ANALYTICS_HOST = new URL(ORIGIN).hostname;
const DESCRIPTION =
  "Which season is it in Forza Horizon 4 right now? A live countdown to the next weekly season change, over community photos from the Horizon Festival.";

const ROOT = new URL("..", import.meta.url).pathname;
const ASSETS = join(ROOT, "assets");
const DIST = join(ROOT, "dist");
const CACHE = join(ROOT, ".cache/photos");

const WIDTHS = [640, 1280, 1920, 2560, 3840];
// Bump to invalidate cached encodes when these settings change.
const ENCODE = { version: 1, avif: { quality: 50, effort: 4 }, jpeg: { quality: 75, mozjpeg: true } };

// Glyphs per font; the timer is always uppercase. Anything else falls back to sans-serif.
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ '";
const FONTS = {
  // Digits and ':' are for the no-JS message ("Thursday 14:30 UTC").
  "PT-Sans-Regular": `${UPPER}0123456789:`,
  "PT-Sans-Bold": "0123456789",
  "PT-Sans-Narrow-Regular": UPPER,
};

const sha = (data: string | Buffer, length = 8) => createHash("sha256").update(data).digest("hex").slice(0, length);

await rm(DIST, { recursive: true, force: true });
await mkdir(join(DIST, "bg"), { recursive: true });
await mkdir(join(DIST, "fonts"), { recursive: true });
await mkdir(CACHE, { recursive: true });

const [photos, fonts, splashes] = await Promise.all([
  buildPhotos(),
  buildFonts(),
  buildSplashes(),
  buildIcons(),
]);
await buildOgImage(splashes);
await buildPage(photos, fonts, splashes);
await report();

async function buildPhotos(): Promise<Record<Season, Photo[]>> {
  const jobs: (() => Promise<void>)[] = [];
  const result = {} as Record<Season, Photo[]>;

  for (const season of SEASONS) {
    result[season] = [];
    for (const bg of backgrounds[season]) {
      if (bg.exclude) continue;
      const file = join(ASSETS, "backgrounds", season, bg.file);
      const input = await readFile(file);
      const { width, height } = await sharp(input).metadata();
      const stem = `${season}-${basename(bg.file, extname(bg.file))}.${sha(input)}`;
      const widths = WIDTHS.filter((w) => w < width);
      widths.push(Math.min(width, WIDTHS.at(-1)!));

      const { data, info } = await sharp(input)
        .resize(100, 100, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      result[season].push({
        src: `/bg/${stem}`,
        widths,
        ratio: Math.round((width / height) * 1000) / 1000,
        hash: Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString("base64"),
        ...("reddit" in bg.credit
          ? { credit: `u/${bg.credit.reddit}`, href: `https://www.reddit.com/user/${bg.credit.reddit}/` }
          : { credit: bg.credit.label }),
      });

      for (const w of widths) {
        for (const ext of ["avif", "jpg"] as const) {
          jobs.push(async () => {
            const name = `${stem}-${w}.${ext}`;
            const cached = join(CACHE, `${sha(JSON.stringify(ENCODE))}-${name}`);
            if (!existsSync(cached)) {
              const img = sharp(input).resize(w);
              await (ext === "avif" ? img.avif(ENCODE.avif) : img.jpeg(ENCODE.jpeg)).toFile(cached);
            }
            await copyFile(cached, join(DIST, "bg", name));
          });
        }
      }
    }
  }

  let next = 0;
  const worker = async () => {
    while (next < jobs.length) await jobs[next++]!();
  };
  await Promise.all(Array.from({ length: Math.max(2, cpus().length) }, worker));
  return result;
}

async function buildFonts() {
  const urls: Record<string, string> = {};
  for (const [name, text] of Object.entries(FONTS)) {
    const woff2 = await subsetFont(await readFile(join(ASSETS, "fonts", `${name}.ttf`)), text, {
      targetFormat: "woff2",
    });
    const url = `/fonts/${name}.${sha(woff2)}.woff2`;
    await writeFile(join(DIST, url), woff2);
    urls[name] = url;
  }
  return urls;
}

async function buildSplashes() {
  const svgs = {} as Record<Season, string>;
  for (const season of SEASONS) {
    const source = await readFile(join(ASSETS, "splash", `${season}.svg`), "utf8");
    svgs[season] = optimize(source, {
      multipass: true,
      floatPrecision: 2,
      plugins: [
        "preset-default",
        "removeDimensions",
        // Illustrator writes gradient stops as style="" attributes, which the CSP would block.
        "convertStyleToAttrs",
        // All four are inlined into one document, so their gradient IDs must not collide.
        { name: "prefixIds", params: { prefix: season, prefixClassNames: false } },
        {
          name: "addAttributesToSVGElement",
          params: { attributes: [{ class: season }, { "aria-hidden": "true" }, { focusable: "false" }] },
        },
      ],
    }).data;
  }
  return svgs;
}

async function buildIcons() {
  const icon = await readFile(join(ASSETS, "icons/icon.svg"));
  // iOS and Android mask their own shape, so these get a full-bleed square background.
  const square = Buffer.from(
    icon
      .toString()
      .replace(/<circle[^>]*\/>/, '<rect fill="#00b592" x="435" y="235" width="330" height="330"/>')
      .replace(/<path fill="#00a383" d="M526[^"]*"/, '<path fill="#00a383" d="M765,565V416.395l-89.644-89.644L526.75,475.353L616.396,565z"'),
  );
  await Promise.all([
    copyFile(join(ASSETS, "icons/icon.svg"), join(DIST, "icon.svg")),
    copyFile(join(ASSETS, "icons/favicon.ico"), join(DIST, "favicon.ico")),
    sharp(square, { density: 300 }).resize(180).png().toFile(join(DIST, "apple-touch-icon.png")),
    sharp(square, { density: 300 }).resize(192).png().toFile(join(DIST, "icon-192.png")),
    sharp(square, { density: 300 }).resize(512).png().toFile(join(DIST, "icon-512.png")),
    writeFile(
      join(DIST, "manifest.webmanifest"),
      JSON.stringify({
        name: "Horizon Season",
        short_name: "Season",
        description: DESCRIPTION,
        start_url: "/",
        display: "standalone",
        background_color: "#101418",
        theme_color: "#00b592",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      }),
    ),
    writeFile(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`),
    writeFile(
      join(DIST, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${ORIGIN}/</loc><changefreq>weekly</changefreq></url></urlset>\n`,
    ),
  ]);
}

/** Evergreen share image: all four seasons, each over its official cover art. */
async function buildOgImage(splashes: Record<Season, string>) {
  const [W, H] = [600, 315];
  const tiles = await Promise.all(
    SEASONS.map(async (season, i) => {
      const art = backgrounds[season].find((b) => !b.exclude && "label" in b.credit) ?? backgrounds[season][0]!;
      const photo = await sharp(join(ASSETS, "backgrounds", season, art.file))
        .resize(W, H, { fit: "cover" })
        .modulate({ brightness: 0.8 })
        .toBuffer();
      const splash = await sharp(Buffer.from(splashes[season]), { density: 200 }).resize({ height: 190 }).toBuffer();
      const tile = await sharp(photo).composite([{ input: splash, gravity: "center" }]).toBuffer();
      return { input: tile, left: (i % 2) * W, top: Math.floor(i / 2) * H };
    }),
  );
  await sharp({ create: { width: 2 * W, height: 2 * H, channels: 3, background: "#101418" } })
    .composite(tiles)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(DIST, "og.jpg"));
}

async function buildPage(photos: Record<Season, Photo[]>, fonts: Record<string, string>, splashes: Record<Season, string>) {
  const js = await esbuild({
    entryPoints: [join(ROOT, "src/page.ts")],
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2022",
    write: false,
    define: { PHOTOS: JSON.stringify(photos), ANALYTICS_HOST: JSON.stringify(ANALYTICS_HOST) },
  });

  const rawCss = (await readFile(join(ROOT, "src/styles.css"), "utf8")).replace(
    /\{\{FONT:([\w-]+)\}\}/g,
    (_, name: string) => fonts[name]!,
  );
  const css = (await transform(rawCss, { loader: "css", minify: true })).code.trim();
  const noscriptCss = (
    await transform(".needs-js,#credit,.backdrop picture{display:none}.backdrop img{opacity:1}.splash{line-height:1.2;text-shadow:0 1px 4px #000}", {
      loader: "css",
      minify: true,
    })
  ).code.trim();

  const fallback = photos.winter.find((p) => !p.href) ?? photos.winter[0]!;
  const clock = optimize(await readFile(join(ASSETS, "clock/timer.svg"), "utf8"), {
    plugins: [
      "preset-default",
      { name: "addAttributesToSVGElement", params: { attributes: [{ "aria-hidden": "true" }, { focusable: "false" }] } },
    ],
  }).data;

  const vars: Record<string, string> = {
    ORIGIN,
    DESCRIPTION,
    ANALYTICS_PATH: encodeURIComponent(`${ANALYTICS_HOST}/`),
    FONT_PRELOADS: Object.values(fonts)
      .map((url) => `<link rel="preload" href="${url}" as="font" type="font/woff2" crossorigin>`)
      .join("\n  "),
    CSS: css,
    JS: js.outputFiles[0]!.text.trim(),
    NOSCRIPT_CSS: noscriptCss,
    NOSCRIPT_PHOTO: `<img src="${fallback.src}-1920.jpg" alt="">`,
    SPLASHES: SEASONS.map((s) => splashes[s]).join(""),
    CLOCK: clock,
  };
  let html = (await readFile(join(ROOT, "src/index.html"), "utf8")).replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key === "CSP" ? match : (vars[key] ?? missing(key)),
  );

  // Hash every inline <script>/<style> so the CSP needs no 'unsafe-inline'.
  // (The JSON-LD <script type=…> is data, not executed, so CSP ignores it.)
  const inlineHashes = (tag: string) =>
    [...html.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))]
      .map(([, body]) => `'sha256-${createHash("sha256").update(body!).digest("base64")}'`)
      .join(" ");
  const csp = [
    "default-src 'none'",
    `script-src ${inlineHashes("script")}`,
    `style-src ${inlineHashes("style")}`,
    "img-src 'self' data: https://tuckerchapin.goatcounter.com",
    "font-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  html = html.replace("{{CSP}}", csp);
  await writeFile(join(DIST, "index.html"), html);
}

function missing(key: string): never {
  throw new Error(`Template variable {{${key}}} has no value`);
}

async function report() {
  const html = await readFile(join(DIST, "index.html"));
  const { brotliCompressSync } = await import("node:zlib");
  const fontFiles = await readdir(join(DIST, "fonts"));
  const fontBytes = (await Promise.all(fontFiles.map((f) => stat(join(DIST, "fonts", f))))).reduce((n, s) => n + s.size, 0);
  const bg = await readdir(join(DIST, "bg"));
  console.log(
    `index.html ${(html.length / 1024).toFixed(1)} KB (${(brotliCompressSync(html).length / 1024).toFixed(1)} KB br) · ` +
      `fonts ${(fontBytes / 1024).toFixed(1)} KB · ${bg.length} photo files`,
  );
}
