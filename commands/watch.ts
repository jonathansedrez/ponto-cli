import { createCliRenderer } from "@opentui/core";
import { readConfig, readTimesheet } from "../storage";
import {
  buildSessions,
  totalDurationMinutes,
  isOngoing,
  computeLeaveAt,
  formatDuration,
} from "../session";
import { Dashboard, type DashboardData } from "../dashboard";

function todayString(now: Date): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
}

function formatDateLabel(now: Date): string {
  return now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function buildDashboardData(): Promise<DashboardData> {
  const [config, timesheet] = await Promise.all([
    readConfig(),
    readTimesheet(),
  ]);
  const now = new Date();
  const todayStr = todayString(now);
  const todayEntry = timesheet.find((d) => d.date === todayStr);
  const sessions = todayEntry ? buildSessions(todayEntry.stamps, now) : [];

  const todayWorkedMinutes = totalDurationMinutes(sessions);
  const dailyGoalMinutes = Math.round(
    (config.contractHours * 60) / config.workingDaysCurrentMonth,
  );
  const contractLoggedMinutes = timesheet.reduce((total, day) => {
    return total + totalDurationMinutes(buildSessions(day.stamps, now));
  }, 0);
  const contractTotalMinutes = config.contractHours * 60;
  const clockedIn = isOngoing(sessions);

  let ongoingDuration: string | null = null;
  if (clockedIn) {
    const last = sessions[sessions.length - 1]!;
    ongoingDuration = formatDuration(last.durationMinutes);
  }

  const leaveResult = computeLeaveAt(sessions, dailyGoalMinutes);
  let leaveAtLabel: string;
  if (leaveResult.kind === "goal-met") {
    leaveAtLabel = "Daily goal achieved!";
  } else if (leaveResult.kind === "in-progress") {
    leaveAtLabel = `${leaveResult.time}  to hit daily goal`;
  } else {
    leaveAtLabel = "Clock in to see leave time";
  }

  const currentTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    header: {
      dateLabel: formatDateLabel(now),
      currentTime,
      clockedIn,
      ongoingDuration,
      leaveAtLabel,
    },
    body: {
      sessions,
      todayWorkedMinutes,
      dailyGoalMinutes,
      contractLoggedMinutes,
      contractTotalMinutes,
    },
  };
}

function setTabTitle(title: string) {
  process.stdout.write(`\x1b]0;${title}\x07`);
}

function restoreTabTitle() {
  setTabTitle("");
}

export async function watch(): Promise<void> {
  setTabTitle("ponto --watch");

  const renderer = await createCliRenderer({ exitOnCtrlC: false });

  let refreshing = false;

  const refresh = async () => {
    if (refreshing) return;
    refreshing = true;
    try {
      const data = await buildDashboardData();
      for (const child of [...renderer.root.getChildren()]) {
        renderer.root.remove(child);
      }
      renderer.root.add(Dashboard(data));
    } finally {
      refreshing = false;
    }
  };

  await refresh();
  renderer.requestLive();
  renderer.start();

  const interval = setInterval(refresh, 1000);

  renderer.keyInput.on("keypress", async (event) => {
    if (event.name === "q" || (event.ctrl && event.name === "c")) {
      clearInterval(interval);
      restoreTabTitle();
      renderer.destroy();
      process.exit(0);
    } else if (event.name === "r") {
      await refresh();
    }
  });
}
