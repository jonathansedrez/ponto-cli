import { readConfig, readTimesheet } from "../storage";
import { buildSessions, totalDurationMinutes } from "../session";
import { formatDuration } from "../shared/time";

function remainingWorkingDaysInMonth(now: Date): number {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    now,
  );
  const [y, m] = todayStr.split("-").map(Number);

  const lastDay = new Date(y!, m!, 0);

  let count = 0;
  const cursor = new Date(todayStr + "T00:00:00");
  while (cursor <= lastDay) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export async function left(): Promise<void> {
  const config = await readConfig();
  const timesheet = await readTimesheet();
  const now = new Date();

  const contractMinutes = config.contractHours * 60;

  const loggedMinutes = timesheet.reduce((total, day) => {
    const sessions = buildSessions(day.stamps, now);
    return total + totalDurationMinutes(sessions);
  }, 0);

  const remainingMinutes = Math.max(0, contractMinutes - loggedMinutes);
  const remainingDays = remainingWorkingDaysInMonth(now);

  console.log(`  Contract total : ${formatDuration(contractMinutes)}`);
  console.log(`  Logged so far  : ${formatDuration(loggedMinutes)}`);
  console.log(`  Remaining      : ${formatDuration(remainingMinutes)}`);
  console.log(`  Remaining days : ${remainingDays}`);
}
