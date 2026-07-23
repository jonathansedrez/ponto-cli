import { Box, Text, RGBA } from "@opentui/core";
import type { Session } from "../session/types";
import { formatDuration } from "../shared/time";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();
const GRAY = RGBA.fromIndex(8);
const HIGHLIGHT = RGBA.fromIndex(12);

const BAR_WIDTH = 14;

function progressBar(current: number, total: number): string {
  const pct = total > 0 ? Math.min(1, current / total) : 0;
  const filled = Math.round(pct * BAR_WIDTH);
  return "█".repeat(filled) + "░".repeat(BAR_WIDTH - filled);
}

export interface YesterdayData {
  dateLabel: string;
  sessions: Session[];
  totalMinutes: number;
}

export interface BodyData {
  sessions: Session[];
  todayWorkedMinutes: number;
  dailyGoalMinutes: number;
  contractLoggedMinutes: number;
  contractTotalMinutes: number;
  yesterday: YesterdayData | null;
}

export function Body(data: BodyData) {
  const todayPct =
    data.dailyGoalMinutes > 0
      ? Math.round((data.todayWorkedMinutes / data.dailyGoalMinutes) * 100)
      : 0;

  const contractPct =
    data.contractTotalMinutes > 0
      ? Math.round(
          (data.contractLoggedMinutes / data.contractTotalMinutes) * 100,
        )
      : 0;

  const sessionRows =
    data.sessions.length > 0
      ? data.sessions.map((s) => {
          const outStr = s.out ?? "—:—  ";
          const durationStr = formatDuration(s.durationMinutes);
          const runningStr = s.ongoing ? "  ▶ running" : "";
          return Text({
            content: `${s.in}   ${outStr}   ${durationStr}${runningStr}`,
            fg: s.ongoing ? HIGHLIGHT : FG,
          });
        })
      : [Text({ content: "No stamps today.", fg: GRAY })];

  const yesterdayRows = data.yesterday
    ? [
        Box(
          { flexDirection: "column", backgroundColor: BG },
          Text({ content: `Yesterday  ${data.yesterday.dateLabel}`, fg: GRAY }),
          Text({
            content: "─────   ─────   ──────────────",
            fg: GRAY,
          }),
          ...(data.yesterday.sessions.length > 0
            ? data.yesterday.sessions.map((s) =>
                Text({
                  content: `${s.in}   ${s.out ?? "—:—  "}   ${formatDuration(s.durationMinutes)}`,
                  fg: FG,
                }),
              )
            : [Text({ content: "No stamps.", fg: GRAY })]),
          Text({
            content: `Total: ${formatDuration(data.yesterday.totalMinutes)}`,
            fg: GRAY,
          }),
        ),
      ]
    : [];

  return Box(
    { flexDirection: "column", backgroundColor: BG, gap: 1 },
    Box(
      { flexDirection: "column", backgroundColor: BG },
      Text({ content: "Sessions", fg: GRAY }),
      Text({ content: "" }),
      Text({ content: "In      Out     Duration", fg: GRAY }),
      Text({ content: "─────   ─────   ──────────────", fg: GRAY }),
      ...sessionRows,
    ),
    Box(
      { flexDirection: "column", backgroundColor: BG },
      Text({
        content: `Today    ${formatDuration(data.todayWorkedMinutes)} / ${formatDuration(data.dailyGoalMinutes)}  ${progressBar(data.todayWorkedMinutes, data.dailyGoalMinutes)}  ${todayPct}%`,
        fg: FG,
      }),
      Text({
        content: `Contract ${contractPct}% done  ${progressBar(data.contractLoggedMinutes, data.contractTotalMinutes)}  ${formatDuration(data.contractLoggedMinutes)} / ${formatDuration(data.contractTotalMinutes)}`,
        fg: FG,
      }),
    ),
    ...yesterdayRows,
  );
}
