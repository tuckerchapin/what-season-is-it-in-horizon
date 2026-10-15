/**
 * Screenshots the built site at a range of viewports, optionally at a fixed time:
 *   pnpm screenshots [ISO time]   →   .cache/screenshots/<viewport>.png
 * Expects `pnpm serve` to be running.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const SITE = process.env.SITE ?? "http://localhost:4173/";
const OUT = new URL("../.cache/screenshots/", import.meta.url).pathname;
const VIEWPORTS = {
  "desktop-1440x900": { width: 1440, height: 900 },
  "desktop-2560x1440": { width: 2560, height: 1440 },
  "laptop-1280x720": { width: 1280, height: 720 },
  "ultrawide-3440x1440": { width: 3440, height: 1440 },
  "tablet-820x1180": { width: 820, height: 1180, isMobile: true, deviceScaleFactor: 2 },
  "phone-390x844": { width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 },
  "phone-landscape-844x390": { width: 844, height: 390, isMobile: true, deviceScaleFactor: 3 },
  "small-320x568": { width: 320, height: 568, isMobile: true, deviceScaleFactor: 2 },
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const [name, { width, height, ...opts }] of Object.entries(VIEWPORTS)) {
  const page = await browser.newPage({ viewport: { width, height }, ...opts });
  if (process.argv[2]) await page.clock.setFixedTime(new Date(process.argv[2]));
  await page.goto(SITE, { waitUntil: "networkidle" });
  await page.waitForSelector("#photo[data-loaded]");
  await page.screenshot({ path: `${OUT}${name}.png` });
  await page.close();
}
await browser.close();
console.log(`Saved to ${OUT}`);
