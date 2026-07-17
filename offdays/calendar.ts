import { Box, Text, RGBA } from "@opentui/core";
import type { Offdays } from "../storage/types";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();
const RED = RGBA.fromIndex(1);
const GRAY = RGBA.fromIndex(8);
const CURSOR = RGBA.fromIndex(15);

const DAYS_HEADER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export type DayState = "off-weekday" | "off-weekend" | "on-weekend" | "normal";

export function getDayState(
  day: number,
  year: number,
  month: number,
  _todayStr: string,
  offdays: Offdays,
): DayState {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(year, month - 1, day);
  const isWknd = date.getDay() === 0 || date.getDay() === 6;
  const isOff = offdays.includes(dateStr);
  if (isWknd) return isOff ? "off-weekend" : "on-weekend";
  return isOff ? "off-weekday" : "normal";
}

function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month - 1, 1);
  const startPad = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function WeekRows(params: {
  days: (number | null)[];
  cursorDay: number;
  year: number;
  month: number;
  todayStr: string;
  offdays: Offdays;
}) {
  const { days, cursorDay, year, month, todayStr, offdays } = params;

  const cells = days.map((day) => {
    if (day === null) return { indicator: "    ", number: "    ", fg: FG };
    const state = getDayState(day, year, month, todayStr, offdays);
    const focused = day === cursorDay;
    const isOff = state === "off-weekday" || state === "off-weekend";
    const num = String(day).padStart(2, " ");
    return {
      indicator: isOff ? "  × " : "    ",
      number: focused ? `[${num}]` : ` ${num} `,
      fg: focused ? CURSOR : isOff ? RED : FG,
    };
  });

  return Box(
    { flexDirection: "column", backgroundColor: BG },
    Box(
      { flexDirection: "row", backgroundColor: BG },
      ...cells.map((c) => Text({ content: c.indicator, fg: RED })),
    ),
    Box(
      { flexDirection: "row", backgroundColor: BG },
      ...cells.map((c) => Text({ content: c.number, fg: c.fg })),
    ),
  );
}

function HeaderRow() {
  return Box(
    { flexDirection: "row", backgroundColor: BG },
    ...DAYS_HEADER.map((d) => Text({ content: ` ${d} `, fg: GRAY })),
  );
}

export function Calendar(params: {
  year: number;
  month: number;
  cursorDay: number;
  todayStr: string;
  offdays: Offdays;
}) {
  const { year, month, cursorDay, todayStr, offdays } = params;
  const weeks = buildCalendarGrid(year, month);

  return Box(
    { flexDirection: "column", backgroundColor: BG, gap: 1 },
    HeaderRow(),
    ...weeks.map((days) =>
      WeekRows({ days, cursorDay, year, month, todayStr, offdays }),
    ),
  );
}
