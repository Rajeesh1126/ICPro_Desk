import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import api from "../../api/axios";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  stickyFirstColumnCell,
  stickyFirstColumnHeaderCell,
  stickyTableCellSx,
  tableHeaderCellSx,
  tableHeadSx,
} from "../../styles/common";

import type {
  TaskEntry,
  AssignedTask,
  Milestone,
  SubmissionProject,
  UsersData
} from "../../types/dataTypes";
import { showNotification } from "../../api/notificationService";

// =========================================================
// Week
// =========================================================

type WeekDay = {
  label: string;
  date: string;
};

type SubmissionProps = {
  weekStart: string;
  refreshKey: number;
  selectedAssignedTaskIds: number[];
  onAssignedTaskSelectionChange: (assignedTaskId: number, checked: boolean) => void;
  onPreviewDaysChange?: (days: { day: string; hours: number }[]) => void;
  onSubmitEntriesChange?: (entries: TimesheetSubmitEntry[]) => void;
  onBudgetOwnerValidationChange?: (validation: BudgetOwnerValidation) => void;
  onDailyHoursValidationChange?: (validation: DailyHoursValidation) => void;
  onWeeklyHoursValidationChange?: (validation: WeeklyHoursValidation) => void;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type TimesheetSubmitEntry = {
  assignId: number;
  date: string;
  hours: number;
};

export type BudgetOwnerValidation = {
  missingCount: number;
  missingTaskNames: string[];
};

export type DailyHoursValidation = {
  exceededDays: string[];
};

export type WeeklyHoursValidation = {
  estimatedHours: number;
  actualHours: number;
  isSatisfied: boolean;
};

type WeeklyTimesheetStatus = {
  timesheet_status: string;
  submission_status?: boolean;
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
};

const createWeekDays = (weekStart: string): WeekDay[] => {
  const startDate = new Date(`${weekStart}T00:00:00`);

  return dayLabels.map((label, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const dayNumber = String(date.getDate()).padStart(2, "0");

    return {
      label: `${label}-${dayNumber}`,
      date: formatLocalDate(date),
    };
  });
};

// =========================================================
// Common Column Widths
// =========================================================

const columnWidths = {
  job: {xs: 200, sm: 300 },
  budgetOwner: 160,
  day: 100,
  total: 90,
  select: 70,
};

// =========================================================
// Helpers
// =========================================================

const getTaskTotal = (task: AssignedTask, weekDays: WeekDay[]) => {
  return weekDays.reduce(
    (total, day) => total + timeValueToSeconds(task.entries[day.date] ?? 0),
    0,
  );
};

const getMilestoneTotal = (milestone: Milestone, weekDays: WeekDay[]) => {
  return milestone.assigned_tasks.reduce(
    (total, task) => total + getTaskTotal(task, weekDays),
    0,
  );
};

const getProjectTotal = (project: SubmissionProject, weekDays: WeekDay[]) => {
  return project.milestones.reduce(
    (total, milestone) => total + getMilestoneTotal(milestone, weekDays),
    0,
  );
};

const getProjectAssignedTaskIds = (project: SubmissionProject) => {
  return project.milestones.flatMap((milestone) =>
    milestone.assigned_tasks.map((task) => task.assign_id),
  );
};

const getWeekDayTotals = (projects: SubmissionProject[], weekDays: WeekDay[]) => {
  return weekDays.map((day) => ({
    date: day.date,
    hours: projects.reduce(
      (dayTotal, project) =>
        dayTotal +
        project.milestones.reduce(
          (projectTotal, milestone) =>
            projectTotal +
            milestone.assigned_tasks.reduce(
              (milestoneTotal, task) =>
                milestoneTotal + timeValueToSeconds(task.entries[day.date] ?? 0),
              0,
            ),
          0,
        ),
      0,
    ),
  }));
};

const timeValueToSeconds = (value: number | string) => {
  const rawValue = String(value).trim();

  if (!rawValue) {
    return 0;
  }

  const [hoursPart = "0", minutesPart = ""] = rawValue.split(".");
  const hours = Number(hoursPart || 0);
  const minutes = minutesPart === "" ? 0 : Number(minutesPart.padEnd(2, "0").slice(0, 2));

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }

  return (hours * 3600) + (minutes * 60);
};

const secondsToTimeValue = (seconds: number) => {
  const totalSeconds = Number(seconds || 0);

  if (totalSeconds <= 0) {
    return 0;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  return Number(`${hours}.${String(minutes).padStart(2, "0")}`);
};

const secondsToDecimalHours = (seconds: number) => Number((seconds / 3600).toFixed(2));

const getSaturdayOfMonthOccurrence = (date: Date) =>
  Math.ceil(date.getDate() / 7);

const getEstimatedWeekHours = (weekStart: string) => {
  const startDate = new Date(`${weekStart}T00:00:00`);

  for (let index = 0; index < 7; index++) {
    const currentDate = addDays(startDate, index);

    if (
      currentDate.getDay() === 6 &&
      [2, 4].includes(getSaturdayOfMonthOccurrence(currentDate))
    ) {
      return 45;
    }
  }

  return 54;
};

// =========================================================
// Component
// =========================================================

export default function Submission({
  weekStart,
  refreshKey,
  selectedAssignedTaskIds,
  onAssignedTaskSelectionChange,
  onPreviewDaysChange,
  onSubmitEntriesChange,
  onBudgetOwnerValidationChange,
  onDailyHoursValidationChange,
  onWeeklyHoursValidationChange,
}: SubmissionProps) {

  const theme = useTheme();
  const weekDays = useMemo(() => createWeekDays(weekStart), [weekStart]);

  const [projects, setProjects] =
    useState<SubmissionProject[]>([]);

  const [budgetOwners, setBudgetOwners] =
    useState<UsersData[]>([]);

  const [expandedProjects, setExpandedProjects] =
    useState<number[]>([1]);

  const [expandedMilestones, setExpandedMilestones] =
    useState<number[]>([1]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [hasUnsavedHourChanges, setHasUnsavedHourChanges] = useState(false);
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyTimesheetStatus>({
    timesheet_status: "Not Submitted",
    submission_status: false,
  });

  const weekDayTotals = useMemo(
    () => getWeekDayTotals(projects, weekDays),
    [projects, weekDays],
  );

  const weekTotal = useMemo(
    () => weekDayTotals.reduce((total, day) => total + day.hours, 0),
    [weekDayTotals],
  );

  const estimatedWeekHours = useMemo(
    () => getEstimatedWeekHours(weekStart),
    [weekStart],
  );

  const weeklyHoursValidation = useMemo<WeeklyHoursValidation>(
    () => {
      const actualHours = secondsToDecimalHours(weekTotal);

      return {
        estimatedHours: estimatedWeekHours,
        actualHours,
        isSatisfied: actualHours >= estimatedWeekHours,
      };
    },
    [estimatedWeekHours, weekTotal],
  );

  const dailyHoursValidation = useMemo<DailyHoursValidation>(
    () => ({
      exceededDays: weekDayTotals
        .map((dayTotal, index) => ({
          label: weekDays[index]?.label ?? dayTotal.date,
          hours: dayTotal.hours,
        }))
        .filter((dayTotal) => dayTotal.hours > 14 * 3600)
        .map(
          (dayTotal) =>
            `${dayTotal.label} (${secondsToTimeValue(dayTotal.hours).toFixed(2)} hrs)`,
        ),
    }),
    [weekDayTotals, weekDays],
  );

  const submitEntries = useMemo(
    () =>
      projects.flatMap((project) =>
        project.milestones.flatMap((milestone) =>
          milestone.assigned_tasks.flatMap((task) =>
            weekDays
              .map((day) => ({
                entry: {
                  assignId: task.assign_id,
                  date: day.date,
                  hours: timeValueToSeconds(task.entries[day.date] ?? 0),
                },
                hasEntry: Object.prototype.hasOwnProperty.call(task.entries, day.date),
              }))
              .filter((item) => item.hasEntry || item.entry.hours > 0)
              .map((item) => item.entry),
          ),
        ),
      ),
    [projects, weekDays],
  );

  const missingBudgetOwnerTaskNames = useMemo(
    () =>
      projects.flatMap((project) =>
        project.milestones.flatMap((milestone) =>
          milestone.assigned_tasks
            .filter((task) =>
              !task.assign_by &&
              weekDays.some((day) => timeValueToSeconds(task.entries[day.date] ?? 0) > 0),
            )
            .map((task) => task.name || `Assigned task ${task.assign_id}`),
        ),
      ),
    [projects, weekDays],
  );

  const getBudgetOwnerMessage = (action: string) => {
    const visibleNames = missingBudgetOwnerTaskNames.slice(0, 3).join(", ");
    const remainingCount = missingBudgetOwnerTaskNames.length - 3;
    const remainingText = remainingCount > 0 ? ` and ${remainingCount} more` : "";

    return `Select Budget Owner before ${action}: ${visibleNames}${remainingText}.`;
  };

  const getDailyHoursMessage = (action: string) => {
    const visibleDays = dailyHoursValidation.exceededDays.slice(0, 3).join(", ");
    const remainingCount = dailyHoursValidation.exceededDays.length - 3;
    const remainingText = remainingCount > 0 ? ` and ${remainingCount} more` : "";

    return `Daily total cannot exceed 14 hours before ${action}: ${visibleDays}${remainingText}.`;
  };


  useEffect(() => {
    let active = true;
    void api
      .get("/timesheet-entries/", {
        params: {
          week_start: weekStart,
        },
      })
      .then((response) => {
        console.log(response)
        if (active) setProjects((Array.isArray(response.data) ? response.data : []) as SubmissionProject[]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [weekStart, refreshKey]);

  useEffect(() => {
    let active = true;

    void api
      .get<WeeklyTimesheetStatus>("/timesheet-statuses/current/", {
        params: {
          week_start: weekStart,
        },
      })
      .then((response) => {
        if (!active) return;
        setWeeklyStatus(response.data);
      })
      .catch(() => {
        if (!active) return;
        setWeeklyStatus({
          timesheet_status: "Not Submitted",
          submission_status: false,
        });
      });

    return () => {
      active = false;
    };
  }, [weekStart, refreshKey]);

  useEffect(() => {
    onPreviewDaysChange?.(
      weekDays.map((day, index) => ({
        day: fullDayLabels[index],
        hours: secondsToDecimalHours(
          projects.reduce(
            (dayTotal, project) =>
              dayTotal +
              project.milestones.reduce(
                (projectTotal, milestone) =>
                  projectTotal +
                  milestone.assigned_tasks.reduce(
                    (milestoneTotal, task) =>
                      milestoneTotal + timeValueToSeconds(task.entries[day.date] ?? 0),
                    0,
                  ),
                0,
              ),
            0,
          ),
        ),
      })),
    );
  }, [onPreviewDaysChange, projects, weekDays]);

  useEffect(() => {
    onSubmitEntriesChange?.(submitEntries);
  }, [onSubmitEntriesChange, submitEntries]);

  useEffect(() => {
    onBudgetOwnerValidationChange?.({
      missingCount: missingBudgetOwnerTaskNames.length,
      missingTaskNames: missingBudgetOwnerTaskNames,
    });
  }, [missingBudgetOwnerTaskNames, onBudgetOwnerValidationChange]);

  useEffect(() => {
    onDailyHoursValidationChange?.(dailyHoursValidation);
  }, [dailyHoursValidation, onDailyHoursValidationChange]);

  useEffect(() => {
    onWeeklyHoursValidationChange?.(weeklyHoursValidation);
  }, [weeklyHoursValidation, onWeeklyHoursValidationChange]);

  useEffect(() => {
    let active = true;

    void api
      .get<UsersData[]>("/users/")
      .then((response) => {
        if (!active) return;
        setBudgetOwners(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Failed to load users", error);
      });

    return () => {
      active = false;
    };
  }, []);
  // =======================================================
  // Project Expand / Collapse
  // =======================================================

  const toggleProject = (projectId: number) => {
    setExpandedProjects((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );
  };

  // =======================================================
  // Milestone Expand / Collapse
  // =======================================================

  const toggleMilestone = (milestoneId: number) => {
    setExpandedMilestones((current) =>
      current.includes(milestoneId)
        ? current.filter((id) => id !== milestoneId)
        : [...current, milestoneId],
    );
  };

  // =======================================================
  // Update Daily Hours
  // =======================================================

  const updateHours = (
    projectId: number,
    milestoneId: number,
    taskId: number,
    date: string,
    value: string,
  ) => {
    const normalizedValue = value === "" ? 0 : value;

    if (value !== "" && !/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    if (value !== "" && value.includes(".")) {
      const minutes = Number(value.split(".")[1].padEnd(2, "0").slice(0, 2));

      if (minutes > 59) {
        return;
      }
    }

    if (timeValueToSeconds(value) > 14 * 3600) {
      return;
    }

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,

          milestones: project.milestones.map(
            (milestone) => {
              if (milestone.id !== milestoneId) {
                return milestone;
              }

              return {
                ...milestone,

                assigned_tasks:
                  milestone.assigned_tasks.map(
                    (task) => {
                      if (
                        task.assign_id !== taskId
                      ) {
                        return task;
                      }

                      if (String(task.entries[date] ?? 0) !== String(normalizedValue)) {
                        setHasUnsavedHourChanges(true);
                      }

                      return {
                        ...task,

                        entries: {
                          ...task.entries,
                          [date]: normalizedValue,
                        },
                      };
                    },
                  ),
              };
            },
          ),
        };
      }),
    );
  };

  // =======================================================
  // Update Budget Owner
  // =======================================================

  const updateBudgetOwner = async (
    projectId: number,
    milestoneId: number,
    taskId: number,
    owner: string,
  ) => {
    let previousOwner: string | null = null;

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,

          milestones: project.milestones.map(
            (milestone) => {
              if (milestone.id !== milestoneId) {
                return milestone;
              }

              return {
                ...milestone,

                assigned_tasks:
                  milestone.assigned_tasks.map(
                    (task) => {
                      if (
                        task.assign_id !== taskId
                      ) {
                        return task;
                      }

                      previousOwner = task.assign_by;

                      return {
                        ...task,
                        assign_by: owner,
                      };
                    },
                  ),
              };
            },
          ),
        };
      }),
    );

    try {
      await api.patch(`/assigned-tasks/${taskId}/`, {
        assign_by: owner || null,
      });
       showNotification({
        type: "success",
        message: "Updated the Budget Owner successfully .",
      });
    } catch {
      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) {
            return project;
          }

          return {
            ...project,
            milestones: project.milestones.map((milestone) => {
              if (milestone.id !== milestoneId) {
                return milestone;
              }

              return {
                ...milestone,
                assigned_tasks: milestone.assigned_tasks.map((task) =>
                  task.assign_id === taskId
                    ? {
                      ...task,
                      assign_by: previousOwner,
                    }
                    : task,
                ),
              };
            }),
          };
        }),
      );
    }
  };

  // =======================================================
  // Save Draft
  // =======================================================

  const saveDraft = async () => {
    if (dailyHoursValidation.exceededDays.length > 0) {
      showNotification({
        type: "error",
        message: getDailyHoursMessage("saving draft"),
      });
      return;
    }

    if (missingBudgetOwnerTaskNames.length > 0) {
      showNotification({
        type: "error",
        message: getBudgetOwnerMessage("saving draft"),
      });
      return;
    }

    setSavingDraft(true);
    try {
      const response = await api.post("/timesheet-entries/save-draft/", {
        entries: submitEntries,
      });

      const savedEntries = Array.isArray(response.data?.entries)
        ? response.data.entries
        : [];
      const deletedEntries = Array.isArray(response.data?.deleted_entries)
        ? response.data.deleted_entries
        : [];

      setProjects((current) =>
        current.map((project) => ({
          ...project,
          milestones: project.milestones.map((milestone) => ({
            ...milestone,
            assigned_tasks: milestone.assigned_tasks.map((task) => {
              const taskEntries = savedEntries.filter(
                (entry: { assignId: number }) => entry.assignId === task.assign_id,
              );
              const taskDeletedEntries = deletedEntries.filter(
                (entry: { assignId: number }) => entry.assignId === task.assign_id,
              );

              if (taskEntries.length === 0 && taskDeletedEntries.length === 0) {
                return task;
              }

              const nextEntries = { ...task.entries };

              taskDeletedEntries.forEach((entry: { date: string }) => {
                delete nextEntries[entry.date];
              });

              return {
                ...task,
                entries: taskEntries.reduce(
                  (
                    entriesMap: TaskEntry,
                    entry: { date: string; hours: number },
                  ) => ({
                    ...entriesMap,
                    [entry.date]: entry.hours,
                  }),
                  nextEntries,
                ),
              };
            }),
          })),
        })),
      );

      showNotification({
        type: "success",
        message: "Time sheet saved as draft successfully .",
      });
      setHasUnsavedHourChanges(false);
    } catch {
      // Global axios error handling shows API failures.
    } finally {
      setSavingDraft(false);
    }
  };

  const today = new Date();
  const editableDates = new Set([
    formatLocalDate(addDays(today, -1)),
    formatLocalDate(today),
    formatLocalDate(addDays(today, 1)),
  ]);
  const isUnlocked = ["Unlocked"].includes(weeklyStatus.timesheet_status);
  const isSubmitted = weeklyStatus.timesheet_status === "Submitted" || Boolean(weeklyStatus.submission_status);
  const isOthersProject = (project: SubmissionProject) => project.code?.toLowerCase() === "others";
  const canEditDate = (date: string, project: SubmissionProject) =>
    isUnlocked || (!isSubmitted && (isOthersProject(project) || editableDates.has(date)));

  // =======================================================
  // Render
  // =======================================================

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* =================================================
          TABLE
      ================================================= */}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          boxShadow: "none",
          bgcolor: "background.paper",
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: "100%",
            minWidth: { xs: 1180, md: 1320, lg: 1450 },
            tableLayout: "fixed",

            "& .MuiTableCell-root": {
              boxSizing: "border-box",
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
              fontSize: "0.8125rem",
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              position: "sticky",
              top: 0,
            },
          }}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <TableHead sx={tableHeadSx(theme)}>
            <TableRow>
              {/* Jobs */}

              <TableCell
                sx={{
                  ...stickyFirstColumnHeaderCell(theme),
                  width: columnWidths.job,
                  minWidth: columnWidths.job,
                }}
                className="timesheet-jobs-cell"
              >
                Jobs
              </TableCell>

              {/* Budget Owner */}

              <TableCell
                sx={{
                  ...tableHeaderCellSx(theme),
                  width: columnWidths.budgetOwner,
                  minWidth: columnWidths.budgetOwner,
                }}
              >
                Budget Owner
              </TableCell>

              {/* Days */}

              {weekDays.map((day) => (
                <TableCell
                  key={day.date}
                  align="center"
                  sx={{
                    ...tableHeaderCellSx(theme),
                    width: columnWidths.day,
                    minWidth: columnWidths.day,
                  }}
                >
                  {day.label}
                </TableCell>
              ))}

              {/* Total */}

              <TableCell
                align="center"
                sx={{
                  ...tableHeaderCellSx(theme),
                  width: columnWidths.total,
                  minWidth: columnWidths.total,
                }}
              >
                Total
              </TableCell>

              {/* Action */}

              <TableCell
                align="center"
                sx={{
                  ...tableHeaderCellSx(theme),
                  width: columnWidths.select,
                  minWidth: columnWidths.select,
                }}
              >
                Actions
              </TableCell>

            </TableRow>
          </TableHead >

          {/* =================================================
              BODY
          ================================================= */}

          <TableBody>
            {projects.map((project) => {
              const projectExpanded =
                expandedProjects.includes(
                  project.id,
                );

              const projectTotal =
                getProjectTotal(project, weekDays);
              const projectAssignedTaskIds = getProjectAssignedTaskIds(project);
              const selectedProjectTaskCount = projectAssignedTaskIds.filter((taskId) =>
                selectedAssignedTaskIds.includes(taskId),
              ).length;
              const allProjectTasksSelected =
                projectAssignedTaskIds.length > 0 &&
                selectedProjectTaskCount === projectAssignedTaskIds.length;
              const someProjectTasksSelected =
                selectedProjectTaskCount > 0 &&
                selectedProjectTaskCount < projectAssignedTaskIds.length;

              return (
                <React.Fragment
                  key={project.id}
                >
                  {/* =================================================
                      PROJECT ROW
                  ================================================= */}

                  <TableRow>
                    {/* Project */}

                    <TableCell
                      sx={{
                        ...stickyFirstColumnCell(theme),
                        width: columnWidths.job,
                        minWidth: columnWidths.job,
                        fontWeight: 600,
                      }}
                      className="timesheet-jobs-cell"
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            toggleProject(
                              project.id,
                            )
                          }
                        >
                          {projectExpanded ? (
                            <ExpandMoreOutlinedIcon />
                          ) : (
                            <ChevronRightOutlinedIcon />
                          )}
                        </IconButton>

                        <Box>
                          <Box
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {project.description}
                          </Box>

                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {project.code}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Empty Budget Owner */}

                    <TableCell
                      sx={{
                        ...stickyTableCellSx(theme),
                        width:
                          columnWidths.budgetOwner,
                        minWidth:
                          columnWidths.budgetOwner,
                      }}
                    />

                    {/* Project Daily Cells */}

                    {weekDays.map((day) => (
                      <TableCell
                        key={day.date}
                        sx={{
                          ...stickyTableCellSx(theme),
                          width: columnWidths.day,
                          minWidth: columnWidths.day,
                        }}
                      />
                    ))}

                    {/* Project Total */}

                    <TableCell
                      align="center"
                      sx={{
                        ...stickyTableCellSx(theme),
                        width: columnWidths.total,
                        minWidth: columnWidths.total,
                        fontWeight: 600,
                      }}
                    >
                      {secondsToTimeValue(projectTotal).toFixed(2)}
                    </TableCell>

                    {/* Project Select */}

                    <TableCell
                      align="center"
                      sx={{
                        ...stickyTableCellSx(theme),
                        width: columnWidths.select,
                        minWidth: columnWidths.select,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allProjectTasksSelected}
                        indeterminate={someProjectTasksSelected}
                        disabled={projectAssignedTaskIds.length === 0}
                        onChange={(event) => {
                          projectAssignedTaskIds.forEach((taskId) => {
                            onAssignedTaskSelectionChange(
                              taskId,
                              event.target.checked,
                            );
                          });
                        }}
                        inputProps={{
                          "aria-label": `Select all tasks for ${project.description || project.code}`,
                        }}
                      />
                    </TableCell>

                  </TableRow>

                  {/* =================================================
                      PROJECT CONTENT
                  ================================================= */}

                  {projectExpanded && (
                    <TableRow>
                      <TableCell
                        colSpan={
                          2 +
                          weekDays.length +
                          2
                        }
                        sx={{
                          p: 0,
                          borderBottom: 0,
                        }}
                      >
                        <Collapse
                          in={projectExpanded}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Table
                            size="small"
                            sx={{
                              width: "100%",
                              minWidth: { xs: 1180, md: 1320, lg: 1450 },
                              tableLayout: "fixed",

                              "& .MuiTableCell-root": {
                                boxSizing: "border-box",
                                color: theme.palette.text.primary,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              },
                            }}
                          >
                            <TableBody>
                              {project.milestones.map(
                                (milestone) => {
                                  const milestoneExpanded =
                                    expandedMilestones.includes(
                                      milestone.id,
                                    );

                                  const milestoneTotal =
                                    getMilestoneTotal(
                                      milestone,
                                      weekDays,
                                    );

                                  return (
                                    <React.Fragment
                                      key={
                                        milestone.id
                                      }
                                    >
                                      {/* =================================================
                                          MILESTONE
                                      ================================================= */}

                                      <TableRow>
                                        {/* Milestone */}

                                        <TableCell
                                          sx={{
                                            ...stickyFirstColumnCell(theme),
                                            width:
                                              columnWidths.job,
                                            minWidth:
                                              columnWidths.job,
                                            pl: 5,

                                          }}
                                          className="timesheet-jobs-cell"
                                        >
                                          <Box
                                            sx={{
                                              display:
                                                "flex",
                                              alignItems:
                                                "center",
                                            }}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                toggleMilestone(
                                                  milestone.id,
                                                )
                                              }
                                            >
                                              {milestoneExpanded ? (
                                                <ExpandMoreOutlinedIcon />
                                              ) : (
                                                <ChevronRightOutlinedIcon />
                                              )}
                                            </IconButton>

                                            <Box
                                              sx={{
                                                fontSize:
                                                  "0.875rem",
                                              }}
                                            >
                                              {
                                                milestone.name
                                              }
                                            </Box>
                                          </Box>
                                        </TableCell>

                                        {/* Budget Owner */}

                                        <TableCell
                                          sx={{
                                            ...stickyTableCellSx(theme),
                                            width:
                                              columnWidths.budgetOwner,
                                            minWidth:
                                              columnWidths.budgetOwner,
                                          }}
                                        />

                                        {/* Days */}

                                        {weekDays.map(
                                          (day) => (
                                            <TableCell
                                              key={
                                                day.date
                                              }
                                              sx={{
                                                ...stickyTableCellSx(theme),
                                                width:
                                                  columnWidths.day,
                                                minWidth:
                                                  columnWidths.day,
                                              }}
                                            />
                                          ),
                                        )}

                                        {/* Total */}

                                        <TableCell
                                          align="center"
                                          sx={{
                                            ...stickyTableCellSx(theme),
                                            width:
                                              columnWidths.total,
                                            minWidth:
                                              columnWidths.total,
                                            fontWeight:
                                              600,
                                          }}
                                        >
                                          {
                                            secondsToTimeValue(milestoneTotal).toFixed(2)
                                          }
                                        </TableCell>

                                        {/* Action */}

                                        <TableCell
                                          align="center"
                                          sx={{
                                            ...stickyTableCellSx(theme),
                                            width:
                                              columnWidths.select,
                                            minWidth:
                                              columnWidths.select,
                                          }}
                                        />

                                      </TableRow>

                                      {/* =================================================
                                          TASKS
                                      ================================================= */}

                                      {milestoneExpanded &&
                                        milestone.assigned_tasks.map(
                                          (task) => {
                                            const taskTotal =
                                              getTaskTotal(
                                                task,
                                                weekDays,
                                              );

                                            return (
                                              <TableRow
                                                key={
                                                  task.assign_id
                                                }
                                              >
                                                {/* Task */}

                                                <TableCell
                                                  sx={{
                                                    ...stickyFirstColumnCell(theme),
                                                    pl: 10,
                                                    width:
                                                      columnWidths.job,
                                                    minWidth:
                                                      columnWidths.job,
                                                  }}
                                                  className="timesheet-jobs-cell"
                                                >
                                                  <Box
                                                    sx={{
                                                      fontSize:
                                                        "0.875rem",
                                                    }}
                                                  >
                                                    {
                                                      task.name
                                                    }
                                                  </Box>
                                                </TableCell>

                                                {/* Budget Owner */}

                                                <TableCell
                                                  sx={{
                                                    ...stickyTableCellSx(theme),
                                                    width:
                                                      columnWidths.budgetOwner,
                                                    minWidth:
                                                      columnWidths.budgetOwner,
                                                    p: 0.6,
                                                  }}
                                                >
                                                  <FormControl
                                                    size="small"
                                                    fullWidth
                                                  >
                                                    <Select
                                                      value={task.assign_by ?? ""}
                                                      onChange={(
                                                        event,
                                                      ) =>
                                                        updateBudgetOwner(
                                                          project.id,
                                                          milestone.id,
                                                          task.assign_id,
                                                          event
                                                            .target
                                                            .value,
                                                        )
                                                      }
                                                      sx={{
                                                        fontSize:
                                                          "0.8rem",
                                                      }}
                                                    >
                                                      {budgetOwners.map((owner) => {
                                                        const ownerName = [
                                                          owner.first_name,
                                                          owner.last_name,
                                                        ]
                                                          .filter(Boolean)
                                                          .join(" ")
                                                          .trim();
                                                        const label = ownerName || owner.username;

                                                        return (
                                                          <MenuItem
                                                            key={owner.id}
                                                            value={owner.username}
                                                            sx={{
                                                              fontSize:
                                                                "0.8rem",
                                                            }}
                                                          >
                                                            {label}
                                                          </MenuItem>
                                                        );
                                                      })}
                                                    </Select>
                                                  </FormControl>
                                                </TableCell>

                                                {/* Daily Hours */}

                                                {weekDays.map(
                                                  (
                                                    day,
                                                  ) => {
                                                    const value =
                                                      task
                                                        .entries[
                                                      day
                                                        .date
                                                      ] ??
                                                      "";
                                                    const isEditable =
                                                      canEditDate(
                                                        day.date,
                                                        project,
                                                      );

                                                    return (
                                                      <TableCell
                                                        key={
                                                          day.date
                                                        }
                                                        align="center"
                                                        sx={{
                                                          width:
                                                            columnWidths.day,
                                                          minWidth:
                                                            columnWidths.day,
                                                          p: 0.6,
                                                        }}
                                                      >
                                                        <TextField
                                                          value={
                                                            value
                                                          }
                                                          disabled={!isEditable}
                                                          onChange={(
                                                            event,
                                                          ) =>
                                                            updateHours(
                                                              project.id,
                                                              milestone.id,
                                                              task.assign_id,
                                                              day.date,
                                                              event
                                                                .target
                                                                .value,
                                                            )
                                                          }
                                                          type="text"
                                                          size="small"
                                                          inputProps={{
                                                            inputMode:
                                                              "decimal",
                                                            placeholder:
                                                              "0.00",
                                                          }}
                                                          sx={{
                                                            width: 90,

                                                            "& .MuiOutlinedInput-root.Mui-disabled":
                                                            {
                                                              bgcolor:
                                                                theme.palette
                                                                  .action
                                                                  .disabledBackground,
                                                              cursor:
                                                                "not-allowed",
                                                            },

                                                            "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
                                                            {
                                                              borderColor:
                                                                theme.palette
                                                                  .action
                                                                  .disabled,
                                                            },

                                                            "& input":
                                                            {
                                                              textAlign:
                                                                "center",
                                                              py: 0.8,
                                                            },

                                                            "& .MuiInputBase-input.Mui-disabled":
                                                            {
                                                              WebkitTextFillColor:
                                                                theme.palette
                                                                  .text
                                                                  .disabled,
                                                              cursor:
                                                                "not-allowed",
                                                            },
                                                          }}
                                                        />
                                                      </TableCell>
                                                    );
                                                  },
                                                )}

                                                {/* Total */}

                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    ...stickyTableCellSx(theme),
                                                    width:
                                                      columnWidths.total,
                                                    minWidth:
                                                      columnWidths.total,
                                                    fontWeight:
                                                      600,
                                                  }}
                                                >
                                                  {
                                                    secondsToTimeValue(taskTotal).toFixed(2)
                                                  }
                                                </TableCell>

                                                {/* Delete */}

                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    width:
                                                      columnWidths.select,
                                                    minWidth:
                                                      columnWidths.select,
                                                  }}
                                                >
                                                  <Checkbox
                                                    size="small"
                                                    checked={selectedAssignedTaskIds.includes(task.assign_id)}
                                                    onChange={(event) =>
                                                      onAssignedTaskSelectionChange(
                                                        task.assign_id,
                                                        event.target.checked,
                                                      )
                                                    }
                                                    inputProps={{
                                                      "aria-label": `Select ${task.name}`,
                                                    }}
                                                  />
                                                </TableCell>

                                              </TableRow>
                                            );
                                          },
                                        )}
                                    </React.Fragment>
                                  );
                                },
                              )}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                sx={{
                  ...stickyFirstColumnCell(theme),
                  width: columnWidths.job,
                  minWidth: columnWidths.job,
                  fontWeight: 700,
                  bgcolor: "background.default",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
                className="timesheet-jobs-cell"
              >
                Total
              </TableCell>

              <TableCell
                sx={{
                  ...stickyTableCellSx(theme),
                  width: columnWidths.budgetOwner,
                  minWidth: columnWidths.budgetOwner,
                  bgcolor: "background.default",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              />

              {weekDayTotals.map((dayTotal) => (
                <TableCell
                  key={dayTotal.date}
                  align="center"
                  sx={{
                    ...stickyTableCellSx(theme),
                    width: columnWidths.day,
                    minWidth: columnWidths.day,
                    fontWeight: 700,
                    bgcolor: "background.default",
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {secondsToTimeValue(dayTotal.hours).toFixed(2)}
                </TableCell>
              ))}

              <TableCell
                align="center"
                sx={{
                  ...stickyTableCellSx(theme),
                  width: columnWidths.total,
                  minWidth: columnWidths.total,
                  fontWeight: 700,
                  bgcolor: "background.default",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                {secondsToTimeValue(weekTotal).toFixed(2)}
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  ...stickyTableCellSx(theme),
                  width: columnWidths.select,
                  minWidth: columnWidths.select,
                  bgcolor: "background.default",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 1.25,
          borderRadius: 1,
          flexWrap: "wrap",
          mt: 1.5, 
          py: { xs: 1, sm: 1.25 },
          px: { xs: 1, sm: 1.5 },
          borderTop: "1px solid",
          borderColor: hasUnsavedHourChanges
            ? theme.palette.warning.main
            : theme.palette.divider,
          backgroundColor: hasUnsavedHourChanges
            ? theme.palette.mode === "dark"
              ? "rgba(251, 140, 0, 0.14)"
              : "rgba(251, 140, 0, 0.08)"
            : theme.palette.background.paper,
          boxShadow: hasUnsavedHourChanges
            ? `0 -6px 18px ${theme.palette.mode === "dark" ? "rgba(251, 140, 0, 0.12)" : "rgba(251, 140, 0, 0.14)"}`
            : "none",
          transition: theme.transitions.create(["background-color", "border-color", "box-shadow"], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Box
          sx={{
            minWidth: { xs: "100%", md: 360 },
            flex: 1,
          }}
        >
          <Typography
            sx={(theme) => ({
              fontSize: 13,
              fontWeight: 800,
              color: weeklyHoursValidation.isSatisfied
                ? theme.palette.success.main
                : theme.palette.warning.main,
            })}
          >
            Estimated: {estimatedWeekHours} hrs / Entered: {weeklyHoursValidation.actualHours.toFixed(2)} hrs
          </Typography>
          <Typography
            variant="caption"
            color={hasUnsavedHourChanges ? "warning.main" : "text.secondary"}
            sx={{
              display: "block",
              mt: 0.25,
              lineHeight: 1.35,
              fontWeight: hasUnsavedHourChanges ? 800 : 400,
            }}
          >
            {hasUnsavedHourChanges
              ? "Daily hours changed. Click Save Draft before closing or switching work."
              : "Save as draft or submit before closing. Auto-save is not available."}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            gap: 1,
            width: { xs: "100%", md: "auto" },
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label={
              hasUnsavedHourChanges
                ? "Unsaved hours"
                : `Status: ${weeklyStatus.timesheet_status || "Not Submitted"}`
            }
            color={hasUnsavedHourChanges ? "warning" : isSubmitted ? "success" : "default"}
            variant={hasUnsavedHourChanges || isSubmitted ? "filled" : "outlined"}
            sx={{
              borderRadius: 5,
              fontWeight: 700,
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={saveDraft}
            disabled={savingDraft || (isSubmitted && !isUnlocked)}
            sx={{
              bgcolor: hasUnsavedHourChanges ? "warning.main" : undefined,
              color: hasUnsavedHourChanges ? "warning.contrastText" : undefined,
              "&:hover": {
                bgcolor: hasUnsavedHourChanges ? "warning.dark" : undefined,
              },
            }}
          >
            {savingDraft ? "Saving..." : "Save Draft"}
          </Button>
         
        </Box>
      </Box>
    </Box>
  );
}
