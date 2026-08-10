import { readTimesheet, writeTimesheet } from "../storage";
import type { Timesheet } from "../storage/types";
import {
  parseTimeInput,
  parseDateInput,
  minutesToStamp,
  nowMinutes,
  parseMinutes,
  todayString,
  formatDuration,
} from "../shared/time";

const g = (s: string) => `\x1b[38;5;8m${s}\x1b[0m`;
const b = (s: string) => `\x1b[38;5;12m${s}\x1b[0m`;
const grn = (s: string) => `\x1b[38;5;10m${s}\x1b[0m`;
const ylw = (s: string) => `\x1b[38;5;11m${s}\x1b[0m`;

function fmtDate(dateStr: string, todayStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, mo! - 1, d!);
  const label = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return dateStr === todayStr ? `${label}  (today)` : label;
}

function elapsedBetween(
  pd: string,
  pt: string,
  cd: string,
  ct: string,
): number {
  const fromMs = new Date(pd).getTime() + parseMinutes(pt) * 60_000;
  const toMs = new Date(cd).getTime() + parseMinutes(ct) * 60_000;
  return Math.round((toMs - fromMs) / 60_000);
}

type StampInfo = { date: string; time: string; label: "IN" | "OUT" };

function findPrev(
  timesheet: Timesheet,
  date: string,
  time: string,
): StampInfo | null {
  const sorted = [...timesheet].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = sorted[i]!;
    if (day.date > date) continue;
    const stamps =
      day.date === date
        ? day.stamps.filter((s) => s !== time)
        : [...day.stamps];
    if (stamps.length === 0) continue;
    const last = stamps.at(-1)!;
    const lastIdx = day.stamps.indexOf(last);
    return {
      date: day.date,
      time: last,
      label: lastIdx % 2 === 0 ? "IN" : "OUT",
    };
  }
  return null;
}

function printResult(
  prev: StampInfo | null,
  curr: StampInfo,
  todayStr: string,
) {
  const div = g("  " + "─".repeat(41));
  const row = (s: StampInfo, isNow: boolean) => {
    const pfx = isNow ? b("  now  ▶") : g("  prev   ");
    const t = isNow ? b(s.time) : g(s.time);
    const lbl = s.label === "IN" ? grn("IN ") : ylw("OUT");
    const dt = g(fmtDate(s.date, todayStr));
    return `${pfx}  ${t}  ${lbl}   ${dt}`;
  };
  console.log(div);
  if (prev) console.log(row(prev, false));
  console.log(row(curr, true));
  console.log(div);
  if (prev) {
    const elapsed = elapsedBetween(prev.date, prev.time, curr.date, curr.time);
    if (elapsed > 0) console.log(g(`  elapsed: ${formatDuration(elapsed)}`));
  }
}

export async function stamp(
  timeArg: string | undefined,
  dateArg?: string,
): Promise<void> {
  const now = new Date();
  const todayStr = todayString(now);
  const dateStr = dateArg ? parseDateInput(dateArg) : todayStr;
  const stampTime = timeArg
    ? parseTimeInput(timeArg)
    : minutesToStamp(nowMinutes(now));

  const timesheet = await readTimesheet();

  let day = timesheet.find((d: { date: string }) => d.date === dateStr);
  if (!day) {
    day = { date: dateStr, stamps: [] };
    timesheet.push(day);
  }

  if (day.stamps.includes(stampTime)) {
    console.error(`  Error: ${stampTime} is already stamped for ${dateStr}.`);
    process.exit(1);
  }

  if (dateArg) {
    const newStamps = [...day.stamps, stampTime].sort(
      (a, b) => parseMinutes(a) - parseMinutes(b),
    );
    const stampIdx = newStamps.indexOf(stampTime);
    const isClockIn = stampIdx % 2 === 0;
    day.stamps = newStamps;
    await writeTimesheet(timesheet);

    const prev: StampInfo | null =
      stampIdx > 0
        ? {
            date: dateStr,
            time: newStamps[stampIdx - 1]!,
            label: (stampIdx - 1) % 2 === 0 ? "IN" : "OUT",
          }
        : findPrev(timesheet, dateStr, stampTime);
    printResult(
      prev,
      { date: dateStr, time: stampTime, label: isClockIn ? "IN" : "OUT" },
      todayStr,
    );
    return;
  }

  const lastStamp = day.stamps.at(-1);
  if (lastStamp && parseMinutes(stampTime) < parseMinutes(lastStamp)) {
    console.error(
      `  Error: ${stampTime} is before the last stamp (${lastStamp}).`,
    );
    process.exit(1);
  }

  const prevTime = day.stamps.at(-1);
  const prevIdx = day.stamps.length - 1;
  const prevLabel: "IN" | "OUT" = prevIdx % 2 === 0 ? "IN" : "OUT";
  const isClockIn = day.stamps.length % 2 === 0;
  day.stamps = [...day.stamps, stampTime];
  await writeTimesheet(timesheet);

  const prev: StampInfo | null =
    prevTime !== undefined
      ? { date: dateStr, time: prevTime, label: prevLabel }
      : findPrev(timesheet, dateStr, stampTime);

  printResult(
    prev,
    { date: dateStr, time: stampTime, label: isClockIn ? "IN" : "OUT" },
    todayStr,
  );
}
