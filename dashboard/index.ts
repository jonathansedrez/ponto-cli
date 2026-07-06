import { Box } from "@opentui/core";
import { colors } from "../shared/colors";
import { Header } from "./header";
import { Body } from "./body";
import { Footer } from "./footer";

export function Dashboard() {
  return Box(
    { flexDirection: "column", backgroundColor: colors.background },
    Header(),
    Body(),
    Footer(),
  );
}
