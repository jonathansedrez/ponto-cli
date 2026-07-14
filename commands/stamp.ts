import { readTimesheet, writeTimesheet } from "../storage";
import {
  parseTimeInput,
  parseDateInput,
  minutesToStamp,
  nowMinutes,
  parseMinutes,
} from "../shared/time";

export async function stamp(
  timeArg: string | undefined,
  dateArg?: string,
): Promise<void> {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    now,
  );

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
    const isClockIn = newStamps.indexOf(stampTime) % 2 === 0;
    day.stamps = newStamps;
    await writeTimesheet(timesheet);
    console.log(`${stampTime}  ${isClockIn ? "IN " : "OUT"}`);
    return;
  }

  const lastStamp = day.stamps.at(-1);
  if (lastStamp && parseMinutes(stampTime) < parseMinutes(lastStamp)) {
    console.error(
      `  Error: ${stampTime} is before the last stamp (${lastStamp}).`,
    );
    process.exit(1);
  }

  const isClockIn = day.stamps.length % 2 === 0;
  day.stamps = [...day.stamps, stampTime];

  await writeTimesheet(timesheet);

  const label = isClockIn ? "IN " : "OUT";
  console.log(`${stampTime}  ${label}`);
}
