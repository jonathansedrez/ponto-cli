import { Box, Text, RGBA } from "@opentui/core";
import type { Offdays } from "../storage/types";
import { todayString } from "../shared/time";
import { Calendar } from "./calendar";
import { OffdaysFooter } from "./footer";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();

export interface OffdaysViewData {
  year: number;
  month: number;
  cursorDay: number;
  todayStr: string;
  offdays: Offdays;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function MonthHeader(data: OffdaysViewData) {
  const label = monthLabel(data.year, data.month);
  const gridW = 7 * 4;
  const pad = Math.max(0, Math.floor((gridW - label.length) / 2));
  return Text({ content: " ".repeat(pad) + label, fg: FG });
}

export function OffdaysView(data: OffdaysViewData) {
  return Box(
    {
      flexDirection: "column",
      backgroundColor: BG,
      paddingX: 2,
      paddingY: 1,
      gap: 2,
    },
    MonthHeader(data),
    Calendar(data),
    OffdaysFooter(),
  );
}

export function seedWeekends(
  year: number,
  month: number,
  offdays: Offdays,
): Offdays {
  const result = [...offdays];
  const total = new Date(year, month, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getDay() === 0 || date.getDay() === 6) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (!result.includes(dateStr)) result.push(dateStr);
    }
  }
  return result.sort();
}

export function toggleDay(
  day: number,
  year: number,
  month: number,
  offdays: Offdays,
): Offdays {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (offdays.includes(dateStr)) {
    return offdays.filter((d) => d !== dateStr);
  }
  return [...offdays, dateStr].sort();
}

export function workingDaysInMonth(
  year: number,
  month: number,
  offdays: Offdays,
): number {
  const seeded = seedWeekends(year, month, offdays);
  const total = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (!seeded.includes(dateStr)) count++;
  }
  return count;
}

export function remainingWorkingDaysInMonth(
  now: Date,
  offdays: Offdays,
): number {
  const today = todayString(now);
  const [y, m] = today.split("-").map(Number);
  const seeded = seedWeekends(y!, m!, offdays);
  const lastDay = new Date(y!, m!, 0);
  let count = 0;
  const cursor = new Date(today + "T00:00:00");
  while (cursor <= lastDay) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!seeded.includes(dateStr)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function prevDay(
  cursorDay: number,
  year: number,
  month: number,
  minYear: number,
  minMonth: number,
): { cursorDay: number; year: number; month: number } {
  if (cursorDay > 1) return { cursorDay: cursorDay - 1, year, month };
  // Don't wrap to a previous month before the minimum
  if (year === minYear && month === minMonth) return { cursorDay, year, month };
  const newMonth = month === 1 ? 12 : month - 1;
  const newYear = month === 1 ? year - 1 : year;
  return {
    cursorDay: daysInMonth(newYear, newMonth),
    year: newYear,
    month: newMonth,
  };
}

export function nextDay(
  cursorDay: number,
  year: number,
  month: number,
): { cursorDay: number; year: number; month: number } {
  if (cursorDay < daysInMonth(year, month))
    return { cursorDay: cursorDay + 1, year, month };
  const newMonth = month === 12 ? 1 : month + 1;
  const newYear = month === 12 ? year + 1 : year;
  return { cursorDay: 1, year: newYear, month: newMonth };
}

export function prevWeek(
  cursorDay: number,
  year: number,
  month: number,
  minYear: number,
  minMonth: number,
): { cursorDay: number; year: number; month: number } {
  const newDay = cursorDay - 7;
  if (newDay >= 1) return { cursorDay: newDay, year, month };
  // Don't wrap before minimum month — clamp to day 1
  if (year === minYear && month === minMonth)
    return { cursorDay: 1, year, month };
  const newMonth = month === 1 ? 12 : month - 1;
  const newYear = month === 1 ? year - 1 : year;
  const prevMonthDays = daysInMonth(newYear, newMonth);
  return { cursorDay: prevMonthDays + newDay, year: newYear, month: newMonth };
}

export function nextWeek(
  cursorDay: number,
  year: number,
  month: number,
): { cursorDay: number; year: number; month: number } {
  const newDay = cursorDay + 7;
  const total = daysInMonth(year, month);
  if (newDay <= total) return { cursorDay: newDay, year, month };
  const newMonth = month === 12 ? 1 : month + 1;
  const newYear = month === 12 ? year + 1 : year;
  return { cursorDay: newDay - total, year: newYear, month: newMonth };
}

export function prevMonth(
  cursorDay: number,
  year: number,
  month: number,
): { cursorDay: number; year: number; month: number } {
  const newMonth = month === 1 ? 12 : month - 1;
  const newYear = month === 1 ? year - 1 : year;
  const clampedDay = Math.min(cursorDay, daysInMonth(newYear, newMonth));
  return { cursorDay: clampedDay, year: newYear, month: newMonth };
}

export function nextMonth(
  cursorDay: number,
  year: number,
  month: number,
): { cursorDay: number; year: number; month: number } {
  const newMonth = month === 12 ? 1 : month + 1;
  const newYear = month === 12 ? year + 1 : year;
  const clampedDay = Math.min(cursorDay, daysInMonth(newYear, newMonth));
  return { cursorDay: clampedDay, year: newYear, month: newMonth };
}
