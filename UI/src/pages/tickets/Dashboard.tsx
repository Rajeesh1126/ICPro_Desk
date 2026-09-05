import { useEffect, useMemo, useState } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AnalysisPieChart from "../../components/dashboard/AnalysisPieChart";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import type { TicketData } from "../../types/dataTypes";
import api from "../../api/axios";
import {
  compactStackGap,
  contentFill,
  dividerListRow,
  emptyStateSx,
  fillContainer,
  inlineProgress,
  largeMutedIcon,
  minWidthZeroSx,
  page,
  pageContent,
  overviewFullGridItem,
  overviewGrid,
  overviewPrimaryGridItem,
  overviewSecondaryGridItem,
  pageHeader,
  pageHeaderContent,
  pageSubtitle,
  pageTitle,
  panelIconBadge,
  panelTitleRow,
  rightMetric,
  scrollColumn,
  statusDot,
  surfacePanel,
} from "../../styles/common";

type DepartmentLoad = { name: string; count: number; color?: string };
type TicketSummary = {
  total: number;
  statuses: Record<string, number>;
  departments: Record<string, number>;
  weekly_target_tickets: TicketData[];
  deptData: DepartmentLoad[];
};

const emptySummary: TicketSummary = {
  total: 0,
  statuses: {},
  departments: {},
  weekly_target_tickets: [],
  deptData: [],
};

export default function Dashboard() {
  const [summary, setSummary] = useState<TicketSummary>(emptySummary);

  useEffect(() => {
    let active = true;
    void api
      .get("/summary/?include_executive=true")
      .then((response) => {
        if (active) setSummary({ ...emptySummary, ...response.data });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const columns = useMemo<ColumnData<TicketData>[]>(
    () => [
      {
        label: "#",
        width: 10,
        render: (_row, index) => index + 1,
        numeric: true,
      },
      { label: "Ticket Number", dataKey: "number", width: 200 },
      { label: "Subject", dataKey: "task", width: "auto" },
      { label: "Status", dataKey: "current_status" },
      { label: "Assigned By", dataKey: "creator_name" },
      { label: "Assigned To", dataKey: "assigned_to_name" },
      { label: "Priority", dataKey: "priority" },
      { label: "Est Hrs", dataKey: "est_hours" },
      { label: "Act Hrs", dataKey: "act_hours" },
      { label: "Target Completion", dataKey: "target_date" },
      { label: "Actual Completion", dataKey: "actual_end_date" },
    ],
    [],
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>
              Team Analysis
            </Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              A live view of due work, teams load, and overall ticket status.
            </Typography>
          </Box>
        </Box>

        <Box sx={overviewGrid}>
          <Box sx={overviewPrimaryGridItem}>
              <Paper
                elevation={0}
                sx={surfacePanel}
              >
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={panelTitleRow}
                >
                  <Box sx={panelIconBadge}>
                    <BusinessOutlinedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography fontWeight={800}>Teams workload</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tickets by team
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={0} sx={scrollColumn}>
                  {summary.deptData.length ? (
                    summary.deptData.map((department, index) => {
                      const color = department.color || "primary.main";
                      return (
                        <Box
                          key={department.name}
                          sx={dividerListRow(index < summary.deptData.length - 1)}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box sx={contentFill}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={compactStackGap}
                              >
                                <Box
                                  sx={statusDot(color)}
                                />

                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                  noWrap
                                  sx={minWidthZeroSx}
                                >
                                  {department.name}
                                </Typography>
                              </Stack>

                              <LinearProgress
                                variant="determinate"
                                value={Math.min(
                                  100,
                                  (department.count /
                                    Math.max(summary.total, 1)) *
                                    100,
                                )}
                                sx={inlineProgress(color)}
                              />
                            </Box>

                            <Box sx={rightMetric}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={900}
                                lineHeight={1}
                              >
                                {department.count}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                lineHeight={1}
                              >
                                tickets
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={emptyStateSx}>
                      <Box>
                        <EventAvailableOutlinedIcon
                          sx={largeMutedIcon}
                        />
                        <Typography fontWeight={700}>
                          No team workload yet
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Paper>
          </Box>
          <Box sx={overviewSecondaryGridItem}>
            <Box sx={fillContainer}>
              <AnalysisPieChart
                title={`Total ${summary.total}`}
                data={summary.statuses}
                height={210}
              />
            </Box>
          </Box>
          <Box sx={overviewFullGridItem}>
              <VirtualizedTable
                columns={columns}
                rows={summary.weekly_target_tickets}
                tableHead="Tickets due this week"
                tableHeadSub="Upcoming commitments and delivery dates"
                tableMinWidth={1180}
              />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
