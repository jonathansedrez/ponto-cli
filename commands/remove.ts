import { readTimesheet, writeTimesheet } from "../storage";
import { parseDateInput } from "../shared/time";

export async function remove(
  indexArg: string | undefined,
  dateArg?: string,
): Promise<void> {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    now,
  );
  const dateStr = dateArg ? parseDateInput(dateArg) : todayStr;

  const timesheet = await readTimesheet();
  const day = timesheet.find((d) => d.date === dateStr);

  if (!day || day.stamps.length === 0) {
    console.error(`  Error: no stamps found for ${dateStr}.`);
    process.exit(1);
  }

  let index: number;
  if (indexArg !== undefined) {
    const parsed = parseInt(indexArg, 10);
    if (isNaN(parsed) || parsed < 0 || parsed >= day.stamps.length) {
      console.error(
        `  Error: index ${indexArg} is out of range (0–${day.stamps.length - 1}).`,
      );
      process.exit(1);
    }
    index = parsed;
  } else {
    index = day.stamps.length - 1;
  }

  const removed = day.stamps[index]!;
  day.stamps.splice(index, 1);

  await writeTimesheet(timesheet);
  console.log(`  Removed ${removed} from ${dateStr}.`);
}
