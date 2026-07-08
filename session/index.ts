import type { Session, LeaveAtResult } from "./types";
import { parseMinutes, nowMinutes, minutesToStamp } from "../shared/time";

/**
 * Builds sessions from an ordered list of `HH:MM` stamps.
 *
 * Even-indexed stamps (0, 2, 4…) are clock-ins; odd-indexed (1, 3, 5…) are
 * clock-outs. If the last stamp has no pair, the session is marked `ongoing`
 * and its duration is calculated against `now`.
 *
 * @param stamps - Ordered `HH:MM` strings for a single day.
 * @param now - Reference time for ongoing session duration. Defaults to the current time.
 * @returns Array of sessions in chronological order.
 */
export function buildSessions(
  stamps: string[],
  now: Date = new Date(),
): Session[] {
  const sessions: Session[] = [];

  for (let i = 0; i < stamps.length; i += 2) {
    const inStamp = stamps[i]!;
    const outStamp = stamps[i + 1] ?? null;
    const ongoing = outStamp === null;
    const durationMinutes = ongoing
      ? Math.max(0, nowMinutes(now) - parseMinutes(inStamp))
      : parseMinutes(outStamp!) - parseMinutes(inStamp);
    sessions.push({ in: inStamp, out: outStamp, durationMinutes, ongoing });
  }

  return sessions;
}

export function totalDurationMinutes(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function isOngoing(sessions: Session[]): boolean {
  const last = sessions[sessions.length - 1];
  return last !== undefined && last.ongoing;
}

/**
 * Computes when the user can leave to hit their daily goal.
 *
 * @param sessions - All sessions for the day (completed + possibly one ongoing).
 * @param goalMinutes - Daily work goal in minutes (e.g. 480 for 8h).
 */
export function computeLeaveAt(
  sessions: Session[],
  goalMinutes: number,
): LeaveAtResult {
  const completedMinutes = sessions
    .filter((s) => !s.ongoing)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  if (completedMinutes >= goalMinutes) return { kind: "goal-met" };

  const lastSession = sessions[sessions.length - 1];
  if (!lastSession?.ongoing) return { kind: "incomplete" };

  const remaining = goalMinutes - completedMinutes;
  const leaveMinutes = parseMinutes(lastSession.in) + remaining;
  return { kind: "in-progress", time: minutesToStamp(leaveMinutes) };
}

export type { Session, LeaveAtResult };
export { formatDuration } from "../shared/time";
