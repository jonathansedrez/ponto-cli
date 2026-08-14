import { test, expect, describe } from "bun:test";
import { buildReviewEntries } from "./index";

describe("buildReviewEntries", () => {
  test("includes only current-month incomplete days, excluding today", () => {
    const timesheet = [
      { date: "2026-08-04", stamps: ["09:00"] }, // incomplete → include
      { date: "2026-08-05", stamps: ["09:00", "18:00"] }, // complete → exclude
      { date: "2026-08-13", stamps: ["09:00"] }, // today → exclude
      { date: "2026-07-31", stamps: ["09:00"] }, // prev month → exclude
    ];
    const entries = buildReviewEntries(timesheet, "2026-08-13");
    expect(entries).toHaveLength(1);
    expect(entries[0]!.date).toBe("2026-08-04");
  });

  test("sorts entries chronologically", () => {
    const timesheet = [
      { date: "2026-08-10", stamps: ["09:00"] },
      { date: "2026-08-04", stamps: ["09:00"] },
    ];
    const entries = buildReviewEntries(timesheet, "2026-08-13");
    expect(entries[0]!.date).toBe("2026-08-04");
    expect(entries[1]!.date).toBe("2026-08-10");
  });

  test("originalStamps and stagedStamps are independent copies", () => {
    const timesheet = [{ date: "2026-08-04", stamps: ["09:00"] }];
    const entries = buildReviewEntries(timesheet, "2026-08-13");
    entries[0]!.stagedStamps.push("18:00");
    expect(entries[0]!.originalStamps).toEqual(["09:00"]);
  });

  test("newStamps set starts empty", () => {
    const timesheet = [{ date: "2026-08-04", stamps: ["09:00"] }];
    const entries = buildReviewEntries(timesheet, "2026-08-13");
    expect(entries[0]!.newStamps.size).toBe(0);
  });

  test("returns empty array when no incomplete days exist", () => {
    const timesheet = [{ date: "2026-08-05", stamps: ["09:00", "18:00"] }];
    const entries = buildReviewEntries(timesheet, "2026-08-13");
    expect(entries).toHaveLength(0);
  });

  test("includes days with 3 stamps (multiple pairs, one missing exit)", () => {
    const timesheet = [
      { date: "2026-08-04", stamps: ["09:00", "12:00", "13:00"] },
    ];
    const entries = buildReviewEntries(timesheet, "2026-08-13");
    expect(entries).toHaveLength(1);
    expect(entries[0]!.stagedStamps).toEqual(["09:00", "12:00", "13:00"]);
  });
});
