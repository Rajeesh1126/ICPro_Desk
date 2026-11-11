import * as echarts from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Registers only the chart types and rendering components used by this application,
// keeping ECharts smaller than importing its full bundle.
echarts.use([
  BarChart,
  PieChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

/** Configured ECharts runtime shared by chart components. */
export { echarts };
/** Instance type used when chart components hold an ECharts reference. */
export type { ECharts } from "echarts/core";
/** Option type used to describe supported chart configuration. */
export type { EChartsOption } from "echarts";
