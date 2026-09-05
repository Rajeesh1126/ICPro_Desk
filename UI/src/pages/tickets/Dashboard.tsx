import { useEffect, useMemo, useState } from "react";
import { Box, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AnalysisPieChart from "../../components/Dashboard/AnalysisPieChart";
import TeamWorkloadDetailsModal from "../../components/Dashboard/TeamWorkloadDetailsModal";
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

// type DepartmentLoad = { name: string; count: number; color?: string };
type DepartmentLoad = {
  name: string;
  completed: number;
  delayed: number;
  inprogress: number;
  color?: string;
};
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
  const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);
  const [openWorkloadModal, setOpenWorkloadModal] = useState(false);

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

  const handleDepartmentClick = (department: any) => {
    setSelectedDepartment(department);
    setOpenWorkloadModal(true);
  };

  const handleCloseWorkloadModal = () => {
    setOpenWorkloadModal(false);
    setSelectedDepartment(null);
  };

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

          {/* <Grid size={{ xs: 12, md: 7, lg: 7 }}>
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
          </Grid> */}

          {/* SINGLE WORKLOAD BAR */}
          <Grid size={{ xs: 12, md: 7, lg: 7 }}>
            <Paper
              elevation={0}
              sx={dashboardDynamicPageDynamicPaperSx1({ borderedSurfaceSx })}
            >
              {/* HEADER */}
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={dashboardPageStackSx1}
              >
                <Box sx={dashboardPageBoxSx3}>
                  <BusinessRoundedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography fontWeight={800}>
                    Teams workload
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Tickets by team
                  </Typography>
                </Box>
              </Stack>

              {/* DEPARTMENTS */}
              <Stack spacing={0} sx={dashboardPageStackSx2}>
                {summary.deptData.length ? (
                  summary.deptData.map((department, index) => {
                    const color = department.color || "primary.main";

                    const totalTickets =
                      department.completed +
                      department.inprogress +
                      department.delayed;

                    const total = Math.max(totalTickets, 1);

                    return (
                      <Box
                        key={department.name}
                        onClick={() => handleDepartmentClick(department)}
                        sx={{
                          ...dashboardDynamicPageDynamicBoxSx1({
                            index,
                            summary,
                          }),
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(8, 141, 165, 0.04)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {/* TEAM NAME + TOTAL */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Box
                              sx={dashboardDynamicPageDynamicBoxSx2({
                                color,
                              })}
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

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                          >
                            {totalTickets} tickets
                          </Typography>
                        </Stack>

                        {/* VALUES */}
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          sx={{
                            mb: 0.75,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: "#22c55e" }}
                          >
                            ✓ {department.completed} Completed
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: "#3b82f6" }}
                          >
                            ● {department.inprogress} In Progress
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: "#ef4444" }}
                          >
                            ! {department.delayed} Delayed
                          </Typography>
                        </Stack>

                        {/* SINGLE STACKED PROGRESS BAR */}
                        <Box
                          sx={{
                            height: 8,
                            width: "100%",
                            borderRadius: 10,
                            overflow: "hidden",
                            display: "flex",
                            backgroundColor: "#eef2f7",
                          }}
                        >
                          {/* COMPLETED */}
                          {department.completed > 0 && (
                            <Box
                              sx={{
                                width: `${(department.completed / total) * 100}%`,
                                backgroundColor: "#22c55e",
                              }}
                            />
                          )}

                          {/* IN PROGRESS */}
                          {department.inprogress > 0 && (
                            <Box
                              sx={{
                                width: `${(department.inprogress / total) * 100}%`,
                                backgroundColor: "#3b82f6",
                              }}
                            />
                          )}

                          {/* DELAYED */}
                          {department.delayed > 0 && (
                            <Box
                              sx={{
                                width: `${(department.delayed / total) * 100}%`,
                                backgroundColor: "#ef4444",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={emptyStateSx}>
                    <Box>
                      <EventAvailableRoundedIcon
                        sx={dashboardPageEventAvailableRoundedIconSx1}
                      />

                      <Typography fontWeight={700}>
                        No team workload yet
                      </Typography>
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
      <TeamWorkloadDetailsModal
        open={openWorkloadModal}
        department={selectedDepartment}
        onClose={handleCloseWorkloadModal}
      />
    </Box>
  );
}
