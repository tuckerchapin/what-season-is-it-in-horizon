import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { backgrounds } from "../src/backgrounds.ts";
import { SEASONS } from "../src/season.ts";

const dir = (season: string) => new URL(`../assets/backgrounds/${season}/`, import.meta.url);

describe.each(SEASONS)("%s backgrounds", (season) => {
  it("lists every file on disk, and only files on disk", () => {
    const listed = backgrounds[season].map((b) => b.file).sort();
    expect(listed).toEqual(readdirSync(dir(season)).filter((f) => !f.startsWith(".")).sort());
  });

  it("has at least one photo to show", () => {
    expect(backgrounds[season].filter((b) => !b.exclude).length).toBeGreaterThan(0);
  });
});
