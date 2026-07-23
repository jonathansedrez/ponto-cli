import { Box, Text, RGBA } from "@opentui/core";
import { PONTO_ASCII } from "../shared/ascii-art";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();
const GRAY = RGBA.fromIndex(8);
const HIGHLIGHT = RGBA.fromIndex(12);

export interface HeaderData {
  dateLabel: string;
  currentTime: string;
  clockedIn: boolean;
  ongoingDuration: string | null;
  leaveAtLabel: string;
}

export function Header(data: HeaderData) {
  const statusText = data.clockedIn
    ? `● CLOCKED IN  (${data.ongoingDuration})`
    : "○ CLOCKED OUT";
  const statusColor = data.clockedIn ? HIGHLIGHT : GRAY;

  return Box(
    { flexDirection: "column", backgroundColor: BG, gap: 1 },
    Box(
      { flexDirection: "column", backgroundColor: BG },
      ...PONTO_ASCII.map((line) => Text({ content: line, fg: FG })),
    ),
    Box(
      { flexDirection: "row", justifyContent: "flex-end" },
      Text({ content: `${data.dateLabel}  ${data.currentTime}`, fg: GRAY }),
    ),
    Box(
      { flexDirection: "column", backgroundColor: BG },
      Text({ content: `Status : ${statusText}`, fg: statusColor }),
      Text({ content: `Leave  : ${data.leaveAtLabel}`, fg: FG }),
    ),
  );
}
