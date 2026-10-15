export const SEASONS = ["winter", "spring", "summer", "autumn"] as const;
export type Season = (typeof SEASONS)[number];

/** FH4's first shared-world winter began Thursday 2018-11-08 14:30 UTC. */
export const EPOCH = Date.UTC(2018, 10, 8, 14, 30);
export const WEEK = 7 * 24 * 60 * 60 * 1000;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface SeasonState {
  season: Season;
  next: Season;
  /** Epoch ms when `next` begins. */
  endsAt: number;
}

// Pure UTC millisecond arithmetic: calendar/local-time APIs drift by an hour across DST.
export function seasonAt(now: number): SeasonState {
  const weeks = Math.floor((now - EPOCH) / WEEK);
  return {
    season: SEASONS[mod(weeks, 4)]!,
    next: SEASONS[mod(weeks + 1, 4)]!,
    endsAt: EPOCH + (weeks + 1) * WEEK,
  };
}

export interface CountdownPart {
  value: string;
  unit: string;
  spoken: string;
}

/**
 * Mirrors the in-game timer: leading zero units are dropped, seconds only appear
 * in the last hour, and the final minute spells out "SECONDS".
 * e.g. 2D 4H 15M → 10H 15M → 15M 03S → 07 SECONDS
 */
export function countdown(remaining: number): CountdownPart[] {
  const ms = Math.max(0, remaining);
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MINUTE);
  const s = Math.floor((ms % MINUTE) / SECOND);

  const parts: CountdownPart[] = [];
  if (d) parts.push(part(d, "D", "day"));
  if (d || h) parts.push(part(h, "H", "hour"));
  if (d || h || m) parts.push(part(m, "M", "minute"));
  if (!d && !h) {
    parts.push({ ...part(s, m ? "S" : "Seconds", "second"), value: String(s).padStart(2, "0") });
  }
  return parts;
}

/** Milliseconds until the countdown's displayed (floored) value next changes. */
export function nextTick(remaining: number): number {
  const unit = remaining < HOUR ? SECOND : MINUTE;
  return (remaining % unit) + 1;
}

function part(n: number, unit: string, noun: string): CountdownPart {
  return { value: String(n), unit, spoken: `${n} ${noun}${n === 1 ? "" : "s"}` };
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}
