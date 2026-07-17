import { Box, Text, RGBA } from "@opentui/core";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();
const RED = RGBA.fromIndex(1);
const GRAY = RGBA.fromIndex(8);

function key(label: string, color: RGBA) {
  return Text({ content: `[${label}]`, fg: color });
}

function hint(label: string) {
  return Text({ content: label, fg: GRAY });
}

export function OffdaysFooter() {
  return Box(
    { flexDirection: "row", backgroundColor: BG, gap: 2 },
    key("←→", FG),
    hint("day"),
    key("↑↓", FG),
    hint("week"),
    key("space", FG),
    hint("toggle"),
    key("q", RED),
    hint("back"),
  );
}
