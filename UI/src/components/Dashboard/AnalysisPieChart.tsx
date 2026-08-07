import { useEffect, useMemo, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import * as echarts from "echarts";
import { borderedSurfaceSx, dashboardAnalysisPieChartBoxSx1, dashboardAnalysisPieChartBoxSx2, dashboardAnalysisPieChartBoxSx3, dashboardAnalysisPieChartDonutLargeRoundedIconSx1, dashboardAnalysisPieChartDynamicDynamicBoxSx1, dashboardAnalysisPieChartDynamicDynamicPaperSx1, formatStatusLabel, getStatusColor } from "../../styles/common";

interface AnalysisPieChartProps {
  title: string;
  data: Record<string, number>;
  height?: number;
}

export default function AnalysisPieChart({ title, data, height = 300 }: AnalysisPieChartProps) {
  const chartElement = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const chartData = useMemo(
    () => Object.entries(data).map(([label, value]) => ({
      name: formatStatusLabel(label),
      value,
      itemStyle: { color: getStatusColor(label) },
    })),
    [data],
  );

  useEffect(() => {
    const element = chartElement.current;
    if (!element || !chartData.length) return;

    const chart = echarts.init(element, undefined, { renderer: "canvas" });
    chart.setOption({
      animationDuration: 450,
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
        textStyle: { color: theme.palette.text.secondary, fontSize: 11 },
      },
      series: [{
        type: "pie",
        radius: ["46%", "72%"],
        center: ["36%", "50%"],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderColor: theme.palette.background.paper, borderWidth: 3, borderRadius: 5 },
        label: { show: false },
        labelLine: { show: false },
        data: chartData,
      }],
      graphic: [{
        type: "text",
        left: "36%",
        top: "44%",
        style: {
          text: String(chartData.reduce((total, item) => total + item.value, 0)),
          fill: theme.palette.text.primary,
          fontSize: 25,
          fontWeight: 800,
          textAlign: "center",
        },
      }],
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [chartData, theme]);

  return (
    <Paper elevation={0} sx={dashboardAnalysisPieChartDynamicDynamicPaperSx1({ borderedSurfaceSx })}>
      <Box sx={dashboardAnalysisPieChartBoxSx1}>
        <Box sx={dashboardAnalysisPieChartBoxSx2}>
          <DonutLargeRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography fontWeight={800}>Ticket status</Typography>
          <Typography variant="caption" color="text.secondary">{title}</Typography>
        </Box>
      </Box>
      {chartData.length ? (
        <Box ref={chartElement} sx={dashboardAnalysisPieChartDynamicDynamicBoxSx1({ height })} />
      ) : (
        <Box sx={dashboardAnalysisPieChartBoxSx3}>
          <Box><DonutLargeRoundedIcon sx={dashboardAnalysisPieChartDonutLargeRoundedIconSx1} /><Typography fontWeight={700}>No status data yet</Typography></Box>
        </Box>
      )}
    </Paper>
  );
}
