import { test, expect } from "bun:test";
import {
  buildSessions,
  totalDurationMinutes,
  isOngoing,
  computeLeaveAt,
} from "./index";

const at = (h: number, m: number) => new Date(2026, 0, 1, h, m, 0);

test("pairs even stamps into completed sessions", () => {
  const sessions = buildSessions(["10:30", "13:00", "14:00", "18:00"]);

  expect(sessions).toHaveLength(2);
  expect(sessions[0]).toMatchObject({
    in: "10:30",
    out: "13:00",
    durationMinutes: 150,
    ongoing: false,
  });
  expect(sessions[1]).toMatchObject({
    in: "14:00",
    out: "18:00",
    durationMinutes: 240,
    ongoing: false,
  });
});

test("odd stamps produce an ongoing session as the last entry", () => {
  const now = at(15, 45);
  const sessions = buildSessions(["10:30", "13:00", "14:00"], now);

  expect(sessions).toHaveLength(2);
  expect(sessions[1]).toMatchObject({
    in: "14:00",
    out: null,
    ongoing: true,
    durationMinutes: 105,
  });
});

test("single stamp is an ongoing session", () => {
  const now = at(11, 0);
  const sessions = buildSessions(["09:00"], now);

  expect(sessions).toHaveLength(1);
  expect(sessions[0]).toMatchObject({
    in: "09:00",
    out: null,
    ongoing: true,
    durationMinutes: 120,
  });
});

test("empty stamps returns no sessions", () => {
  expect(buildSessions([])).toEqual([]);
});

test("ongoing duration is clamped to 0 when now is before clock-in", () => {
  const now = at(8, 0);
  const sessions = buildSessions(["09:00"], now);

  expect(sessions[0]!.durationMinutes).toBe(0);
});

test("totalDurationMinutes sums all sessions", () => {
  const sessions = buildSessions(["10:30", "13:00", "14:00", "18:00"]);

  expect(totalDurationMinutes(sessions)).toBe(390);
});

test("totalDurationMinutes includes ongoing session duration", () => {
  const now = at(15, 0);
  const sessions = buildSessions(["09:00", "12:00", "13:00"], now);

  expect(totalDurationMinutes(sessions)).toBe(180 + 120);
});

test("isOngoing returns true when last session has no out stamp", () => {
  const now = at(12, 0);
  expect(isOngoing(buildSessions(["09:00"], now))).toBe(true);
  expect(isOngoing(buildSessions(["09:00", "12:00", "13:00"], now))).toBe(true);
});

test("isOngoing returns false when all sessions are closed", () => {
  expect(isOngoing(buildSessions(["09:00", "12:00"]))).toBe(false);
  expect(isOngoing([])).toBe(false);
});

// computeLeaveAt

test("returns leave time when clocked in and goal not yet met", () => {
  // 3h completed, 8h goal, clocked in at 14:00 → needs 5h more → leave at 19:00
  const sessions = buildSessions(
    ["09:00", "12:00", "14:00"],
    new Date(2026, 0, 1, 14, 30),
  );
  expect(computeLeaveAt(sessions, 480)).toEqual({
    kind: "in-progress",
    time: "19:00",
  });
});

test("returns goal-met when completed sessions already cover the goal", () => {
  // 8h completed, 8h goal
  const sessions = buildSessions(["09:00", "17:00"]);
  expect(computeLeaveAt(sessions, 480)).toEqual({ kind: "goal-met" });
});

test("returns goal-met when completed sessions exceed the goal", () => {
  const sessions = buildSessions(["09:00", "18:00"]);
  expect(computeLeaveAt(sessions, 480)).toEqual({ kind: "goal-met" });
});

test("returns incomplete when all sessions are closed and goal not met", () => {
  const sessions = buildSessions(["09:00", "11:00"]);
  expect(computeLeaveAt(sessions, 480)).toEqual({ kind: "incomplete" });
});

test("returns incomplete when no sessions exist", () => {
  expect(computeLeaveAt([], 480)).toEqual({ kind: "incomplete" });
});

test("accounts only for completed sessions when clocked in", () => {
  // 2h completed (09:00–11:00), clocked in again at 13:00, goal 4h → needs 2h more → leave 15:00
  const now = new Date(2026, 0, 1, 13, 30);
  const sessions = buildSessions(["09:00", "11:00", "13:00"], now);
  expect(computeLeaveAt(sessions, 240)).toEqual({
    kind: "in-progress",
    time: "15:00",
  });
});
