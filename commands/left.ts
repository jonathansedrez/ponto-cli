import { readConfig, readTimesheet, readOffdays } from "../storage";
import { buildSessions, totalDurationMinutes } from "../session";
import { formatDuration, todayString } from "../shared/time";
import { workingDaysInMonth, remainingWorkingDaysInMonth } from "../offdays";

export async function left(): Promise<void> {
  const [config, timesheet, offdays] = await Promise.all([
    readConfig(),
    readTimesheet(),
    readOffdays(),
  ]);
  const now = new Date();
  const [y, m] = todayString(now).split("-").map(Number);

  const contractMinutes = config.contractHours * 60;

  const loggedMinutes = timesheet.reduce((total, day) => {
    const sessions = buildSessions(day.stamps, now);
    return total + totalDurationMinutes(sessions);
  }, 0);

  const remainingMinutes = Math.max(0, contractMinutes - loggedMinutes);
  const remainingDays = remainingWorkingDaysInMonth(now, offdays);
  const totalWorkingDays = workingDaysInMonth(y!, m!, offdays);

  console.log(`  Contract total : ${formatDuration(contractMinutes)}`);
  console.log(`  Logged so far  : ${formatDuration(loggedMinutes)}`);
  console.log(`  Remaining      : ${formatDuration(remainingMinutes)}`);
  console.log(
    `  Working days   : ${totalWorkingDays} total, ${remainingDays} remaining`,
  );
}
