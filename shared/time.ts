export class InvalidTimeError extends Error {
  constructor(input: string) {
    super(`Invalid time: "${input}". Expected HH:MM (e.g. 09:30).`);
  }
}

export class InvalidDateError extends Error {
  constructor(input: string) {
    super(`Invalid date: "${input}". Expected YYYY-MM-DD (e.g. 2026-05-15).`);
  }
}

/**
 * Parses and validates a user-supplied time string into a normalized `HH:MM` stamp.
 *
 * @param input - Time string in `HH:MM` format (e.g. `9:05`, `23:59`).
 * @returns Normalized `HH:MM` string (e.g. `09:05`).
 * @throws {InvalidTimeError} If the format is invalid or values are out of range.
 */
export function parseTimeInput(input: string): string {
  const match = input.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new InvalidTimeError(input);

  const h = parseInt(match[1]!, 10);
  const m = parseInt(match[2]!, 10);

  if (h > 23 || m > 59) throw new InvalidTimeError(input);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Converts a `HH:MM` stamp to minutes since midnight. */
export function parseMinutes(stamp: string): number {
  const parts = stamp.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

/** Returns the current time as minutes since midnight. */
export function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** Converts minutes since midnight to a `HH:MM` stamp. */
export function minutesToStamp(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parses and validates a `YYYY-MM-DD` date string, returning it normalized. */
export function parseDateInput(input: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) throw new InvalidDateError(input);

  const [y, mo, day] = input.split("-").map(Number);
  const d = new Date(y!, mo! - 1, day!);
  if (
    d.getFullYear() !== y ||
    d.getMonth() !== mo! - 1 ||
    d.getDate() !== day
  ) {
    throw new InvalidDateError(input);
  }
  return input;
}

/** Formats a duration in minutes as `Xh MMm` (e.g. `2h 30m`). */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
