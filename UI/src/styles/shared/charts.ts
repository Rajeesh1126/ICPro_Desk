/** Analysis pie chart. */
import { type StaticStyleObject } from "@/styles/shared/base";
import { type SxProps } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { FONT, insetSx } from "@/styles/tokens";

// components/dashboard/AnalysisPieChart.dynamic.styles.ts
/** Chart panel layout reserves responsive space for the canvas and header states. */
export const pieChartPanelSx = ({
  borderedSurfaceSx,
}: {
  borderedSurfaceSx: StaticStyleObject;
}): SxProps<Theme> => ({
  ...borderedSurfaceSx,
  ...insetSx,
  height: "100%",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

/** Shared pie chart canvas  styles style or helper for the related interface. */
export const pieChartCanvasSx = ({
  height,
  visible = true,
}: {
  height: number | string;
  /** Hidden (but kept mounted for ECharts) when there is nothing to plot. */
  visible?: boolean;
}): SxProps<Theme> => ({
  height,
  width: "100%",
  minWidth: 0,
  flex: 1,
  display: visible ? "block" : "none",
});

// components/dashboard/AnalysisPieChart.styles.ts
export const pieChartHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.1,
  mb: 0.5,
};

/** Shared pie chart empty state  styles style or helper for the related interface. */
export const pieChartEmptyStateSx: SxProps<Theme> = {
  flex: 1,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "text.secondary",
};

/** Shared pie chart empty icon  styles style or helper for the related interface. */
export const pieChartEmptyIconSx: SxProps<Theme> = {
  fontSize: FONT.xxxl,
  opacity: 0.35,
};
