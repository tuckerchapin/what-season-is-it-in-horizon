import { describe, expect, it } from "vitest";
import { EPOCH, WEEK, countdown, nextTick, seasonAt } from "../src/season.ts";

const S = 1000;
const M = 60 * S;
const H = 60 * M;
const D = 24 * H;
const show = (ms: number) =>
  countdown(ms)
    .map((p) => p.value + (p.unit.length > 1 ? " " : "") + p.unit.toUpperCase())
    .join(" ");

describe("seasonAt", () => {
  it("starts winter at the epoch and rotates weekly", () => {
    expect(seasonAt(EPOCH).season).toBe("winter");
    expect(seasonAt(EPOCH + WEEK - 1).season).toBe("winter");
    expect(seasonAt(EPOCH + WEEK).season).toBe("spring");
    expect(seasonAt(EPOCH + 2 * WEEK).season).toBe("summer");
    expect(seasonAt(EPOCH + 3 * WEEK).season).toBe("autumn");
    expect(seasonAt(EPOCH + 4 * WEEK).season).toBe("winter");
  });

  it("rolls over on Thursdays at 14:30 UTC, regardless of DST", () => {
    // 2026-10-15 is a Thursday during northern-hemisphere DST.
    const state = seasonAt(Date.UTC(2026, 9, 14, 23, 14));
    expect(state).toMatchObject({ season: "spring", next: "summer" });
    expect(new Date(state.endsAt).toISOString()).toBe("2026-10-15T14:30:00.000Z");
  });

  it("handles times before the epoch", () => {
    expect(seasonAt(EPOCH - 1)).toMatchObject({ season: "autumn", next: "winter", endsAt: EPOCH });
  });
});

describe("countdown", () => {
  it.each([
    [2 * D + 4 * H + 15 * M + 30 * S, "2D 4H 15M"],
    [2 * D + 5 * M, "2D 0H 5M"],
    [3 * D, "3D 0H 0M"],
    [10 * H + 15 * M + 59 * S, "10H 15M"],
    [H, "1H 0M"],
    [H - 1, "59M 59S"],
    [15 * M + 3 * S, "15M 03S"],
    [M, "1M 00S"],
    [7 * S + 999, "07 SECONDS"],
    [0, "00 SECONDS"],
    [-5 * S, "00 SECONDS"],
  ])("%i ms → %s", (ms, expected) => {
    expect(show(ms)).toBe(expected);
  });

  it("provides spoken text", () => {
    expect(countdown(D + H + M).map((p) => p.spoken)).toEqual(["1 day", "1 hour", "1 minute"]);
    expect(countdown(42 * S).map((p) => p.spoken)).toEqual(["42 seconds"]);
  });
});

describe("nextTick", () => {
  it("waits for the next minute boundary when an hour or more remains", () => {
    expect(nextTick(2 * H + 30 * S)).toBe(30 * S + 1);
    expect(nextTick(2 * H)).toBe(1);
    expect(nextTick(H)).toBe(1); // 1H 0M → 59M 59S
  });

  it("ticks every second in the final hour", () => {
    expect(nextTick(10 * M + 250)).toBe(251);
    expect(nextTick(10 * M)).toBe(1);
  });

  it("lands exactly where the displayed value changes", () => {
    for (const ms of [5 * H + 17 * M + 12_345, H + 30 * S, H, 3 * M + 1_500, 2 * D]) {
      expect(show(ms - nextTick(ms) + 1)).toBe(show(ms));
      expect(show(ms - nextTick(ms))).not.toBe(show(ms));
    }
  });
});
