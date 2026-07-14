import { Box, Text } from "@opentui/core";
import { PONTO_ASCII } from "../shared/ascii-art";
import { colors } from "../shared/colors";

const DASH_WIDTH = 62;

export interface HeaderData {
  dateLabel: string;
  clockedIn: boolean;
  ongoingDuration: string | null;
  leaveAtLabel: string;
}

export function Header(data: HeaderData) {
  const statusText = data.clockedIn
    ? `● CLOCKED IN  (${data.ongoingDuration})`
    : "○ CLOCKED OUT";

  return Box(
    {
      border: true,
      borderStyle: "double",
      paddingX: 1,
      paddingY: 1,
      flexDirection: "column",
      width: DASH_WIDTH,
    },
    ...PONTO_ASCII.map((line) => Text({ content: line, fg: colors.text })),
    Box(
      { flexDirection: "row", justifyContent: "flex-end", width: "100%" },
      Text({ content: data.dateLabel, fg: colors.text }),
    ),
    Text({ content: "" }),
    Text({ content: `Status : ${statusText}`, fg: colors.text }),
    Text({ content: `Leave  : ${data.leaveAtLabel}`, fg: colors.text }),
  );
}
