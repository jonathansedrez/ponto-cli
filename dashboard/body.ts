import { Box, Text } from "@opentui/core";
import { colors } from "../shared/colors";
import type { Session } from "../session/types";
import { formatDuration } from "../shared/time";

const DASH_WIDTH = 62;
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
            fg: colors.text,
          });
        })
      : [Text({ content: "No stamps today.", fg: colors.text })];

  const yesterdayRows = data.yesterday
    ? [
        Text({ content: "" }),
        Text({
          content: `Yesterday  ${data.yesterday.dateLabel}`,
          fg: colors.text,
        }),
        Text({
          content: "─────   ─────   ──────────────",
          fg: colors.text,
        }),
        ...(data.yesterday.sessions.length > 0
          ? data.yesterday.sessions.map((s) => {
              const outStr = s.out ?? "—:—  ";
              return Text({
                content: `${s.in}   ${outStr}   ${formatDuration(s.durationMinutes)}`,
                fg: colors.text,
              });
            })
          : [Text({ content: "No stamps.", fg: colors.text })]),
        Text({
          content: `Total: ${formatDuration(data.yesterday.totalMinutes)}`,
          fg: colors.text,
        }),
      ]
    : [];

  return Box(
    {
      border: true,
      borderStyle: "double",
      paddingX: 1,
      paddingY: 1,
      flexDirection: "column",
      width: DASH_WIDTH,
    },
    Text({ content: "Sessions", fg: colors.text }),
    Text({ content: "" }),
    Text({ content: "In      Out     Duration", fg: colors.text }),
    Text({ content: "─────   ─────   ──────────────", fg: colors.text }),
    ...sessionRows,
    Text({ content: "" }),
    Text({
      content: `Today    ${formatDuration(data.todayWorkedMinutes)} / ${formatDuration(data.dailyGoalMinutes)}  ${progressBar(data.todayWorkedMinutes, data.dailyGoalMinutes)}  ${todayPct}%`,
      fg: colors.text,
    }),
    Text({
      content: `Contract ${contractPct}% done  ${progressBar(data.contractLoggedMinutes, data.contractTotalMinutes)}  ${formatDuration(data.contractLoggedMinutes)} / ${formatDuration(data.contractTotalMinutes)}`,
      fg: colors.text,
    }),
    ...yesterdayRows,
  );
}
