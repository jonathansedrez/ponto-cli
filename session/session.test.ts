import { test, expect } from "bun:test";
import { buildSessions, totalDurationMinutes, isOngoing } from "./index";

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
