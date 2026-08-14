import { Box, Text, RGBA } from "@opentui/core";
import type { Timesheet } from "../storage/types";

export interface ReviewEntry {
  date: string;
  originalStamps: string[];
  stagedStamps: string[];
  newStamps: Set<string>;
}

export function buildReviewEntries(
  timesheet: Timesheet,
  todayStr: string,
): ReviewEntry[] {
  const [y, m] = todayStr.split("-").map(Number);
  const monthPrefix = `${y}-${String(m).padStart(2, "0")}-`;

  return timesheet
    .filter(
      (day) =>
        day.date.startsWith(monthPrefix) &&
        day.date !== todayStr &&
        day.stamps.length % 2 !== 0,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      date: day.date,
      originalStamps: [...day.stamps],
      stagedStamps: [...day.stamps],
      newStamps: new Set<string>(),
    }));
}

// Placeholder so the file is valid — render functions added in Task 2
export function ReviewView(_state: unknown) {
  return Box({
    flexDirection: "column",
    backgroundColor: RGBA.defaultBackground(),
  });
}
