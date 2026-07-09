import { test, expect, beforeAll, beforeEach, mock, spyOn } from "bun:test";
import type { DayEntry } from "../storage/types";

let store: DayEntry[] = [];

mock.module("../storage", () => ({
  readTimesheet: async () => structuredClone(store),
  writeTimesheet: async (data: DayEntry[]) => {
    store = structuredClone(data);
  },
}));

let stamp: (timeArg: string | undefined) => Promise<void>;

beforeAll(async () => {
  ({ stamp } = await import("./stamp"));
});

const today = new Date().toISOString().slice(0, 10);

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

test("rejects out-of-order stamp", async () => {
  store = [{ date: today, stamps: ["10:00"] }];
  const exit = spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });

  await expect(stamp("09:00")).rejects.toThrow("process.exit");
  exit.mockRestore();
});
