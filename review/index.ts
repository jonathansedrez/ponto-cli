import { Box, Text, RGBA } from "@opentui/core";
import type { Timesheet } from "../storage/types";
import { ReviewFooter } from "./footer";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();
const GRAY = RGBA.fromIndex(8);
const GREEN = RGBA.fromIndex(10);
const YELLOW = RGBA.fromIndex(11);
const CYAN = RGBA.fromIndex(14);
const HIGHLIGHT_BG = RGBA.fromIndex(12);

export interface ReviewEntry {
  date: string;
  originalStamps: string[];
  stagedStamps: string[];
  newStamps: Set<string>;
}

export interface ReviewViewState {
  entries: ReviewEntry[];
  cursorIndex: number;
  mode: "navigating" | "editing" | "confirming";
  inputBuffer: string;
  errorMessage: string | null;
}

export function buildReviewEntries(
  timesheet: Timesheet,
  todayStr: string,
): ReviewEntry[] {
  const [y, m] = todayStr.split("-").map(Number);
  const monthPrefix = `${y}-${String(m).padStart(2, "0")}-`;

  return timesheet
    .filter(
      (day) =>
        day.date.startsWith(monthPrefix) &&
        day.date !== todayStr &&
        day.stamps.length % 2 !== 0,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      date: day.date,
      originalStamps: [...day.stamps],
      stagedStamps: [...day.stamps],
      newStamps: new Set<string>(),
    }));
}

function formatDateLabel(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, mo! - 1, d!);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function StampRow(
  entry: ReviewEntry,
  isSelected: boolean,
  isEditing: boolean,
  inputBuffer: string,
) {
  const bg = isSelected ? HIGHLIGHT_BG : BG;
  const isComplete = entry.stagedStamps.length % 2 === 0;

  const prefix = Text({
    content: isSelected ? "▶  " : "   ",
    fg: isSelected ? FG : GRAY,
    bg,
  });

  const dateText = Text({
    content: formatDateLabel(entry.date).padEnd(14),
    fg: isComplete ? GREEN : isSelected ? FG : GRAY,
    bg,
  });

  // Build stamp tokens: pairs separated by →, with gap between pairs
  const stampTokens: ReturnType<typeof Text>[] = [];
  const { stagedStamps, newStamps } = entry;

  for (let i = 0; i < stagedStamps.length; i++) {
    const stamp = stagedStamps[i]!;
    const isNew = newStamps.has(stamp);
    const stampFg = isNew ? CYAN : isComplete ? GREEN : FG;

    stampTokens.push(Text({ content: stamp, fg: stampFg, bg }));

    if (i % 2 === 0) {
      // IN stamp — always followed by →
      stampTokens.push(Text({ content: " → ", fg: GRAY, bg }));
    } else {
      // OUT stamp — gap before next pair if more stamps follow
      if (i + 1 < stagedStamps.length) {
        stampTokens.push(Text({ content: "   ", fg: FG, bg }));
      }
    }
  }

  // After the last stamp (odd total = missing exit), show ? or input field
  if (stagedStamps.length % 2 !== 0) {
    if (isEditing) {
      stampTokens.push(Text({ content: `[${inputBuffer}_]`, fg: CYAN, bg }));
    } else {
      stampTokens.push(Text({ content: "?", fg: YELLOW, bg }));
    }
  }

  return Box(
    { flexDirection: "row", backgroundColor: bg },
    prefix,
    dateText,
    ...stampTokens,
  );
}

function Header(count: number) {
  const label =
    count === 1
      ? "Review — 1 incomplete day"
      : `Review — ${count} incomplete days`;
  return Text({ content: label, fg: GRAY });
}

export function ReviewView(state: ReviewViewState) {
  const rows = state.entries.map((entry, idx) =>
    StampRow(
      entry,
      idx === state.cursorIndex,
      idx === state.cursorIndex && state.mode === "editing",
      idx === state.cursorIndex ? state.inputBuffer : "",
    ),
  );

  return Box(
    {
      flexDirection: "column",
      backgroundColor: BG,
      paddingX: 2,
      paddingY: 1,
      gap: 1,
    },
    Header(state.entries.length),
    Text({ content: "" }),
    ...rows,
    Text({ content: "" }),
    ReviewFooter(state.mode, state.errorMessage),
  );
}
