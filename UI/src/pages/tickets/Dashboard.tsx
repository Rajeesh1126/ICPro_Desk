import { useEffect, useMemo, useState } from "react";
import { Box, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AnalysisPieChart from "../../components/Dashboard/AnalysisPieChart";
import { VirtualizedTable, type ColumnData } from "../../components/common/TableView";
import type { TicketData } from "../../types/dataTypes";
import api from "../../api/axios";
import { appPageSx, 
  borderedSurfaceSx, 
  dashboardDynamicPageDynamicBoxSx1,
  dashboardDynamicPageDynamicBoxSx2, 
  dashboardDynamicPageDynamicLinearProgressSx1, 
  dashboardDynamicPageDynamicPaperSx1, 
  dashboardDynamicPageDynamicPaperSx2, 
  dashboardPageBoxSx1, 
  dashboardPageBoxSx2, 
  dashboardPageBoxSx3, 
  dashboardPageBoxSx4, 
  dashboardPageBoxSx5, 
  dashboardPageBoxSx6, 
  dashboardPageBoxSx7, 
  dashboardPageEventAvailableRoundedIconSx1, 
  dashboardPageStackSx1, 
  dashboardPageStackSx2, 
  dashboardPageStackSx3, 
  dashboardPageStackSx4, 
  emptyStateSx, 
  minWidthZeroSx } from "../../styles/common";

type DepartmentLoad = { name: string; count: number; color?: string };
type TicketSummary = {
  total: number;
  statuses: Record<string, number>;
  departments: Record<string, number>;
  weekly_target_tickets: TicketData[];
  deptData: DepartmentLoad[];
};

const EMPTY_SUMMARY: TicketSummary = {
  total: 0,
  statuses: {},
  departments: {},
  weekly_target_tickets: [],
  deptData: [],
};

export default function Dashboard() {
  const [summary, setSummary] = useState<TicketSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    let active = true;
    void api
      .get("/summary/?include_executive=true")
      .then((response) => {
        if (active) setSummary({ ...EMPTY_SUMMARY, ...response.data });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const columns = useMemo<ColumnData<TicketData>[]>(() => [
    { label: "#",width: 10,render: (_row, index) => index + 1, number:true },
    { label: "Ticket Number", dataKey: "number", width: 200 },
    { label: "Subject", dataKey: "task", width: 500 },
    { label: "Status", dataKey: "current_status" },
    { label: "Assigned By", dataKey: "creator_name" },
    { label: "Assigned To", dataKey: "assigned_to_name" },
    { label: "Priority", dataKey: "priority" },
    { label: "Est Hrs", dataKey: "est_hours" },
    { label: "Act Hrs", dataKey: "act_hours" },
    { label: "Target Completion", dataKey: "target_date" },
    { label: "Actual Completion", dataKey: "actual_end_date" },
  ], []);

  return (
    <Box sx={appPageSx}>
      <Box component="main" sx={dashboardPageBoxSx1}>
        <Box sx={dashboardPageBoxSx2}>
          <Typography variant="h5" fontWeight={900}>
            Team Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A live view of due work, teams load, and overall ticket status.
          </Typography>
        </Box>

        <Grid container spacing={1.5}>

          <Grid size={{ xs: 12, md: 7, lg: 7 }}>
            <Paper
              elevation={0}
              sx={dashboardDynamicPageDynamicPaperSx1({ borderedSurfaceSx })}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={dashboardPageStackSx1}>
                <Box
                  sx={dashboardPageBoxSx3}
                >
                  <BusinessRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography fontWeight={800}>Teams workload</Typography>
                  <Typography variant="caption" color="text.secondary">Tickets by team</Typography>
                </Box>
              </Stack>
              <Stack spacing={0} sx={dashboardPageStackSx2}>
                {summary.deptData.length ? summary.deptData.map((department, index) => {
                  const color = department.color || "primary.main";
                  return (
                    <Box
                      key={department.name}
                      sx={dashboardDynamicPageDynamicBoxSx1({ index, summary })}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box
                          sx={dashboardPageBoxSx4}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={dashboardPageStackSx3}
                          >
                            <Box
                              sx={dashboardDynamicPageDynamicBoxSx2({ color })}
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
                              (department.count / Math.max(summary.total, 1)) * 100
                            )}
                            sx={dashboardDynamicPageDynamicLinearProgressSx1({ color })}
                          />
                        </Box>

                        <Box
                          sx={dashboardPageBoxSx5}
                        >
                          <Typography variant="subtitle2" fontWeight={900} lineHeight={1}>
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
                  )
                }) : (
                  <Box sx={emptyStateSx}>
                    <Box>
                      <EventAvailableRoundedIcon sx={dashboardPageEventAvailableRoundedIconSx1} />
                      <Typography fontWeight={700}>No team workload yet</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 5 }}>
            <Box sx={dashboardPageBoxSx6}>
              <AnalysisPieChart title={`Total ${summary.total}`} data={summary.statuses} height={275} />
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={dashboardDynamicPageDynamicPaperSx2({ borderedSurfaceSx })}>
              <Stack direction="row" spacing={1} alignItems="center" sx={dashboardPageStackSx4}>
                <Box sx={dashboardPageBoxSx7}><CalendarMonthRoundedIcon fontSize="small" /></Box>
                <Box><Typography fontWeight={800}>Tickets due this week</Typography><Typography variant="caption" color="text.secondary">Upcoming commitments and delivery dates</Typography></Box>
              </Stack>
              <VirtualizedTable
                columns={columns}
                rows={summary.weekly_target_tickets}
                height="calc(100% - 58px)"
                tableHead="" />
            </Paper>
          </Grid>

        </Grid>

      </Box>
    </Box>
  );
}
