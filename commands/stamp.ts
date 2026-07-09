import { readTimesheet, writeTimesheet } from "../storage";
import {
  parseTimeInput,
  minutesToStamp,
  nowMinutes,
  parseMinutes,
} from "../shared/time";

export async function stamp(timeArg: string | undefined): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const stampTime = timeArg
    ? parseTimeInput(timeArg)
    : minutesToStamp(nowMinutes(now));

  const timesheet = await readTimesheet();

  let day = timesheet.find((d: { date: string }) => d.date === dateStr);
  if (!day) {
    day = { date: dateStr, stamps: [] };
    timesheet.push(day);
  }

  const isClockIn = day.stamps.length % 2 === 0;

  const lastStamp = day.stamps[day.stamps.length - 1];
  if (lastStamp && parseMinutes(stampTime) < parseMinutes(lastStamp)) {
    console.error(
      `  Error: ${stampTime} is before the last stamp (${lastStamp}).`,
    );
    process.exit(1);
  }

  day.stamps.push(stampTime);
  await writeTimesheet(timesheet);

  const label = isClockIn ? "IN " : "OUT";
  console.log(`${stampTime}  ${label}`);
}
