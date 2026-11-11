import { FONT, TYPOGRAPHY } from "@/styles/tokens";
import { useEffect, useMemo, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import { echarts, type ECharts } from "@/utils/charts";
import ChartDataTable from "@/components/common/ChartDataTable";
import { summariseSeries } from "@/utils/chartSummary";
import {
  borderedSurfaceSx,
  pieChartHeaderSx,
  pieChartEmptyStateSx,
  pieChartEmptyIconSx,
  pieChartCanvasSx,
  pieChartPanelSx,
  formatStatusLabel,
  getStatusColor,
} from "@/styles/common";
import { chartMotion } from "@/animations/presets";

interface AnalysisPieChartProps {
  title: string;
  heading?: string;
  caption?: string;
  valueLabel?: string;
  data: Record<string, number>;
  height?: number;
}

export default function AnalysisPieChart({
  title,
  heading = "Ticket status",
  caption = "Tickets by status",
  valueLabel = "Tickets",
  data,
  height = 300,
}: AnalysisPieChartProps) {
  const chartElement = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const theme = useTheme();
  const chartData = useMemo(
    () =>
      Object.entries(data).map(([label, value]) => ({
        name: formatStatusLabel(label),
        value,
        itemStyle: { color: getStatusColor(label) },
      })),
    [data],
  );

  useEffect(() => {
    const element = chartElement.current;
    if (!element || !chartData.length) return;

    if (element.clientWidth === 0 || element.clientHeight === 0) {
      return;
    }

    const chart =
      chartInstance.current ??
      echarts.getInstanceByDom(element) ??
      echarts.init(element, undefined, { renderer: "canvas" });
    chartInstance.current = chart;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    chart.setOption(
      {
        ...chartMotion(),
        // Canvas text uses the app font too (ECharts defaults to sans-serif).
        textStyle: { fontFamily: TYPOGRAPHY.fontFamily },
        tooltip: {
          trigger: "item",
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          textStyle: { color: theme.palette.text.primary },
        },
        legend: {
          orient: "vertical",
          right: 0,
          top: "middle",
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          textStyle: { color: theme.palette.text.secondary, fontSize: FONT.xs },
        },
        series: [
          {
            type: "pie",
            radius: ["46%", "72%"],
            center: ["36%", "50%"],
            avoidLabelOverlap: true,
            // A single status draws a full ring, with no gap at its seam.
            padAngle: chartData.length > 1 ? 2 : 0,
            // Slices sweep open around the ring; the hovered one lifts out.
            animationType: "expansion",
            emphasis: { scale: true, scaleSize: 6 },
            itemStyle: {
              borderColor: theme.palette.background.paper,
              borderWidth: 3,
              borderRadius: 5,
            },
            label: {
              show: true,
              position: "center",
              formatter: () => String(total),
              color: theme.palette.text.primary,
              fontSize: FONT.xl,
              fontWeight: 600,
            },
            labelLine: { show: false },
            data: chartData,
          },
        ],
      },
      true,
    );

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, [chartData, theme]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return (
    <Paper
      elevation={0}
      sx={pieChartPanelSx({
        borderedSurfaceSx,
      })}
    >
      <Box sx={pieChartHeaderSx}>
        <Box>
          <Typography fontWeight={600}>{heading}</Typography>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      <Box
        ref={chartElement}
        role="img"
        aria-label={
          chartData.length
            ? `${heading} chart. ${summariseSeries(chartData)}`
            : undefined
        }
        sx={pieChartCanvasSx({ height, visible: chartData.length > 0 })}
      />
      <ChartDataTable
        caption={caption}
        rowHeader="Status"
        rows={chartData.map((item) => item.name)}
        columns={[
          { label: valueLabel, values: chartData.map((item) => item.value) },
        ]}
      />
      {!chartData.length && (
        <Box sx={pieChartEmptyStateSx}>
          <Box>
            <DonutLargeOutlinedIcon sx={pieChartEmptyIconSx} />
            <Typography fontWeight={600}>No status data yet</Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
