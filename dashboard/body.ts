import { Box, Text } from "@opentui/core";
import { colors } from "../shared/colors";

const DASH_WIDTH = 62;
const BAR = "██████████░░░░";

export function Body() {
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
    Text({ content: "10:30   13:00   2h 30m", fg: colors.text }),
    Text({ content: "14:00   —:—     3h 47m  ▶ running", fg: colors.text }),
    Text({ content: "" }),
    Text({ content: `Today    6h 17m / 8h 00m  ${BAR}  78%`, fg: colors.text }),
    Text({
      content: `Contract 74% done  ${BAR}  118h / 160h`,
      fg: colors.text,
    }),
  );
}
