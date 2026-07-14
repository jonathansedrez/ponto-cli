import { Box } from "@opentui/core";
import { colors } from "../shared/colors";
import { Header, type HeaderData } from "./header";
import { Body, type BodyData } from "./body";
import { Footer } from "./footer";

export interface DashboardData {
  header: HeaderData;
  body: BodyData;
}

export function Dashboard(data: DashboardData) {
  return Box(
    { flexDirection: "column", backgroundColor: colors.background },
    Header(data.header),
    Body(data.body),
    Footer(),
  );
}
