import { Text } from "@opentui/core";
import { colors } from "../shared/colors";

export function Footer() {
  return Text({
    content: "  [q] quit   [r] refresh",
    fg: colors.text,
  });
}
