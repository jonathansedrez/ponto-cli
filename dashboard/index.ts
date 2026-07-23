import { Box, RGBA } from "@opentui/core";
import { Header, type HeaderData } from "./header";
import { Body, type BodyData } from "./body";
import { Footer } from "./footer";

const BG = RGBA.defaultBackground();

export interface DashboardData {
  header: HeaderData;
  body: BodyData;
}

export function Dashboard(data: DashboardData) {
  return Box(
    {
      flexDirection: "column",
      backgroundColor: BG,
      paddingX: 2,
      paddingY: 1,
      gap: 2,
    },
    Header(data.header),
    Body(data.body),
    Footer(),
  );
}
