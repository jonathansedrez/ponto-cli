import { Box, Text, RGBA } from "@opentui/core";

const BG = RGBA.defaultBackground();
const GRAY = RGBA.fromIndex(8);
const RED = RGBA.fromIndex(1);

function key(label: string, color: RGBA) {
  return Text({ content: `[${label}]`, fg: color });
}

function hint(label: string) {
  return Text({ content: label, fg: GRAY });
}

export function Footer() {
  return Box(
    { flexDirection: "row", backgroundColor: BG, gap: 2 },
    key("q", RED),
    hint("quit"),
  );
}
