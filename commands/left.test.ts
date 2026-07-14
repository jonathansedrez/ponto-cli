import { test, expect, beforeAll, beforeEach, mock, spyOn } from "bun:test";
import type { Config, DayEntry } from "../storage/types";

let store: DayEntry[] = [];
let config: Config = {
  contractHours: 160,
  clockType: "24h",
  workingDaysCurrentMonth: 21,
};

mock.module("../storage", () => ({
  readConfig: async () => structuredClone(config),
  readTimesheet: async () => structuredClone(store),
}));

let left: () => Promise<void>;

beforeAll(async () => {
  ({ left } = await import("./left"));
});

beforeEach(() => {
  store = [];
  config = {
    contractHours: 160,
    clockType: "24h",
    workingDaysCurrentMonth: 21,
  };
});

function captureLog(): { lines: string[]; restore: () => void } {
  const lines: string[] = [];
  const spy = spyOn(console, "log").mockImplementation((msg: string) => {
    lines.push(msg);
  });
  return { lines, restore: () => spy.mockRestore() };
}

test("prints contract total from config", async () => {
  config.contractHours = 80;
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[0]).toBe("  Contract total : 80h 00m");
});

test("shows 0h logged when timesheet is empty", async () => {
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[1]).toBe("  Logged so far  : 0h 00m");
});

test("sums completed sessions across multiple days", async () => {
  store = [
    { date: "2026-07-01", stamps: ["09:00", "17:00"] }, // 8h
    { date: "2026-07-02", stamps: ["09:00", "12:00", "13:00", "17:00"] }, // 7h
  ];
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[1]).toBe("  Logged so far  : 15h 00m");
});

test("shows remaining = contract minus logged", async () => {
  config.contractHours = 10;
  store = [{ date: "2026-07-01", stamps: ["09:00", "11:00"] }]; // 2h
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[2]).toBe("  Remaining      : 8h 00m");
});

test("clamps remaining to 0 when logged exceeds contract", async () => {
  config.contractHours = 1;
  store = [{ date: "2026-07-01", stamps: ["09:00", "17:00"] }]; // 8h > 1h
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[2]).toBe("  Remaining      : 0h 00m");
});

test("includes ongoing session in logged hours", async () => {
  const today = new Date().toLocaleDateString("en-CA");
  store = [{ date: today, stamps: ["00:00"] }]; // open since midnight
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[1]).not.toBe("  Logged so far  : 0h 00m");
});

test("remaining days is a non-negative integer", async () => {
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines[3]).toMatch(/^  Remaining days : \d+$/);
});

test("outputs exactly four lines", async () => {
  const { lines, restore } = captureLog();

  await left();
  restore();

  expect(lines).toHaveLength(4);
});
