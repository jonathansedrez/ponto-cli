import { test, expect, beforeAll, beforeEach, mock, spyOn } from "bun:test";
import type { DayEntry } from "../storage/types";

let store: DayEntry[] = [];

mock.module("../storage", () => ({
  readTimesheet: async () => structuredClone(store),
  writeTimesheet: async (data: DayEntry[]) => {
    store = structuredClone(data);
  },
}));

let stamp: (timeArg: string | undefined, dateArg?: string) => Promise<void>;

beforeAll(async () => {
  ({ stamp } = await import("./stamp"));
});

const today = new Date().toLocaleDateString("en-CA");

beforeEach(() => {
  store = [];
});

test("creates a new day entry on first stamp", async () => {
  await stamp("09:00");

  expect(store).toEqual([{ date: today, stamps: ["09:00"] }]);
});

test("appends to an existing day entry", async () => {
  store = [{ date: today, stamps: ["09:00"] }];

  await stamp("17:00");

  expect(store[0]?.stamps).toEqual(["09:00", "17:00"]);
});

test("alternates clock-in and clock-out", async () => {
  await stamp("09:00");
  await stamp("12:00");
  await stamp("13:00");
  await stamp("18:00");

  expect(store[0]?.stamps).toEqual(["09:00", "12:00", "13:00", "18:00"]);
});

test("logs IN on clock-in", async () => {
  const log = spyOn(console, "log");

  await stamp("09:00");

  expect(log).toHaveBeenCalledWith("09:00  IN ");
  log.mockRestore();
});

test("logs OUT on clock-out", async () => {
  store = [{ date: today, stamps: ["09:00"] }];
  const log = spyOn(console, "log");

  await stamp("17:00");

  expect(log).toHaveBeenCalledWith("17:00  OUT");
  log.mockRestore();
});

test("uses current time when no arg given", async () => {
  await stamp(undefined);

  expect(store[0]?.stamps).toHaveLength(1);
  expect(store[0]?.stamps[0]).toMatch(/^\d{2}:\d{2}$/);
});

test("rejects duplicate stamp on same minute", async () => {
  store = [{ date: today, stamps: ["10:00"] }];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(stamp("10:00")).rejects.toThrow("process.exit");
  exit.mockRestore();
});

test("rejects out-of-order stamp", async () => {
  store = [{ date: today, stamps: ["10:00"] }];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(stamp("09:00")).rejects.toThrow("process.exit");
  exit.mockRestore();
});

test("--date creates entry for a specific date", async () => {
  await stamp("09:00", "2026-05-15");

  expect(store).toEqual([{ date: "2026-05-15", stamps: ["09:00"] }]);
});

test("--date appends to existing entry for that date", async () => {
  store = [{ date: "2026-05-15", stamps: ["09:00"] }];

  await stamp("17:00", "2026-05-15");

  expect(store[0]?.stamps).toEqual(["09:00", "17:00"]);
});

test("--date inserts stamp in chronological order", async () => {
  store = [
    { date: "2026-05-15", stamps: ["08:00", "12:00", "13:00", "18:00"] },
  ];

  await stamp("10:00", "2026-05-15");

  expect(store[0]?.stamps).toEqual([
    "08:00",
    "10:00",
    "12:00",
    "13:00",
    "18:00",
  ]);
});

test("--date rejects duplicate stamp", async () => {
  store = [{ date: "2026-05-15", stamps: ["09:00"] }];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(stamp("09:00", "2026-05-15")).rejects.toThrow("process.exit");
  exit.mockRestore();
});
