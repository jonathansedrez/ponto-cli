import { Box, Text, RGBA } from "@opentui/core";

const BG = RGBA.defaultBackground();
const FG = RGBA.defaultForeground();
const RED = RGBA.fromIndex(1);
const GRAY = RGBA.fromIndex(8);
const YELLOW = RGBA.fromIndex(11);

function key(label: string) {
  return Text({ content: `[${label}]`, fg: FG });
}
function hint(label: string) {
  return Text({ content: label, fg: GRAY });
}

export function ReviewFooter(
  mode: "navigating" | "editing" | "confirming",
  errorMessage: string | null,
) {
  if (errorMessage) {
    return Box(
      { flexDirection: "row", backgroundColor: BG },
      Text({ content: errorMessage, fg: RED }),
    );
  }

  if (mode === "confirming") {
    return Box(
      { flexDirection: "row", backgroundColor: BG, gap: 1 },
      Text({ content: "Discard unsaved changes?", fg: YELLOW }),
      key("y"),
      hint("yes"),
      key("n"),
      hint("no"),
    );
  }

  if (mode === "editing") {
    return Box(
      { flexDirection: "row", backgroundColor: BG, gap: 2 },
      key("Enter"),
      hint("confirm"),
      key("Esc"),
      hint("cancel"),
    );
  }

  return Box(
    { flexDirection: "row", backgroundColor: BG, gap: 2 },
    key("↑↓"),
    hint("navigate"),
    key("Enter"),
    hint("add stamp"),
    key("s"),
    hint("save"),
    key("q"),
    hint("quit"),
  );
}
