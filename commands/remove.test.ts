import { test, expect, beforeAll, beforeEach, mock, spyOn } from "bun:test";
import type { DayEntry } from "../storage/types";

let store: DayEntry[] = [];

mock.module("../storage", () => ({
  readTimesheet: async () => structuredClone(store),
  writeTimesheet: async (data: DayEntry[]) => {
    store = structuredClone(data);
  },
}));

let remove: (indexArg: string | undefined, dateArg?: string) => Promise<void>;

beforeAll(async () => {
  ({ remove } = await import("./remove"));
});

const today = new Date().toLocaleDateString("en-CA");

beforeEach(() => {
  store = [];
});

test("removes last stamp of today by default", async () => {
  store = [{ date: today, stamps: ["09:00", "12:00", "13:00", "18:00"] }];

  await remove(undefined);

  expect(store[0]?.stamps).toEqual(["09:00", "12:00", "13:00"]);
});

test("removes stamp at given index", async () => {
  store = [{ date: today, stamps: ["09:00", "12:00", "13:00", "18:00"] }];

  await remove("1");

  expect(store[0]?.stamps).toEqual(["09:00", "13:00", "18:00"]);
});

test("removes first stamp (index 0)", async () => {
  store = [{ date: today, stamps: ["09:00", "18:00"] }];

  await remove("0");

  expect(store[0]?.stamps).toEqual(["18:00"]);
});

test("prints removed stamp and date", async () => {
  store = [{ date: today, stamps: ["09:00", "17:00"] }];
  const log = spyOn(console, "log");

  await remove(undefined);

  expect(log).toHaveBeenCalledWith(`  Removed 17:00 from ${today}.`);
  log.mockRestore();
});

test("removes last stamp for a specific --date", async () => {
  store = [
    { date: "2026-05-15", stamps: ["08:00", "12:00", "13:00", "17:00"] },
  ];

  await remove(undefined, "2026-05-15");

  expect(store[0]?.stamps).toEqual(["08:00", "12:00", "13:00"]);
});

test("removes stamp at index for a specific --date", async () => {
  store = [
    { date: "2026-05-15", stamps: ["08:00", "12:00", "13:00", "17:00"] },
  ];

  await remove("2", "2026-05-15");

  expect(store[0]?.stamps).toEqual(["08:00", "12:00", "17:00"]);
});

test("exits with error when no stamps exist for today", async () => {
  store = [];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(remove(undefined)).rejects.toThrow("process.exit");
  exit.mockRestore();
});

test("exits with error when index is out of range", async () => {
  store = [{ date: today, stamps: ["09:00"] }];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(remove("5")).rejects.toThrow("process.exit");
  exit.mockRestore();
});

test("exits with error when index is negative", async () => {
  store = [{ date: today, stamps: ["09:00"] }];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(remove("-1")).rejects.toThrow("process.exit");
  exit.mockRestore();
});

test("leaves other days untouched", async () => {
  store = [
    { date: "2026-05-14", stamps: ["08:00", "17:00"] },
    { date: today, stamps: ["09:00", "18:00"] },
  ];

  await remove(undefined);

  expect(store.find((d) => d.date === "2026-05-14")?.stamps).toEqual([
    "08:00",
    "17:00",
  ]);
  expect(store.find((d) => d.date === today)?.stamps).toEqual(["09:00"]);
});
