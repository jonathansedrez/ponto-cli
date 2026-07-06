import { Box, Text } from "@opentui/core";
import { PONTO_ASCII } from "../shared/ascii-art";
import { colors } from "../shared/colors";

const DASH_WIDTH = 62;

export function Header() {
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
      Text({ content: "Mon, 19 May 2026", fg: colors.text }),
    ),
    Text({ content: "" }),
    Text({ content: "Status : ● CLOCKED IN  (1h 23m ago)", fg: colors.text }),
    Text({ content: "Leave  : 18:15  to hit daily goal", fg: colors.text }),
  );
}
