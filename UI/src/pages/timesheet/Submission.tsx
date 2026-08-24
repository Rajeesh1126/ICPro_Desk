import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
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
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import api from "../../api/axios";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { modalActionButtonSx, stickyTableCellSx, tableHeaderCellSx, tableHeadSx } from "../../styles/common";

import type {
  TaskEntry,
  AssignedTask,
  Milestone,
  SubmissionProject,
  UsersData
} from "../../types/dataTypes";
import { showNotification } from "../../api/NotificationService";

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
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  job: 430,
  budgetOwner: 190,
  day: 100,
  total: 90,
  select: 70,
};

// =========================================================
// Helpers
// =========================================================

const getTaskTotal = (task: AssignedTask, weekDays: WeekDay[]) => {
  return weekDays.reduce(
    (total, day) => total + (task.entries[day.date] ?? 0),
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

// =========================================================
// Component
// =========================================================

export default function Submission({
  weekStart,
  refreshKey,
  selectedAssignedTaskIds,
  onAssignedTaskSelectionChange,
}: SubmissionProps) {

  const theme = useTheme();
  const weekDays = createWeekDays(weekStart);

  const [projects, setProjects] =
    useState<SubmissionProject[]>([]);

  const [budgetOwners, setBudgetOwners] =
    useState<UsersData[]>([]);

  const [expandedProjects, setExpandedProjects] =
    useState<number[]>([1]);

  const [expandedMilestones, setExpandedMilestones] =
    useState<number[]>([1]);

  const [savingDraft, setSavingDraft] = useState(false);


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
    if (value !== "" && Number.isNaN(Number(value))) {
      return;
    }

    const hours =
      value === ""
        ? 0
        : Number(value);

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

                      return {
                        ...task,

                        entries: {
                          ...task.entries,
                          [date]: hours,
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
    let previousOwner = "";

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
    const entries = projects.flatMap((project) =>
      project.milestones.flatMap((milestone) =>
        milestone.assigned_tasks.flatMap((task) =>
          weekDays
            .map((day) => ({
              assignId: task.assign_id,
              date: day.date,
              hours: task.entries[day.date] ?? 0,
              hasEntry: Object.prototype.hasOwnProperty.call(task.entries, day.date),
            }))
            .filter((entry) => entry.hasEntry || entry.hours > 0)
            .map(({ hasEntry: _hasEntry, ...entry }) => entry),
        ),
      ),
    );

    setSavingDraft(true);
    try {
      const response = await api.post("/timesheet-entries/save-draft/", {
        entries,
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
    } catch {
      // Global axios error handling shows API failures.
    } finally {
      setSavingDraft(false);
    }
  };

  // =======================================================
  // Render
  // =======================================================

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
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
          overflow: "auto",
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: "100%",
            minWidth: 1450,
            tableLayout: "fixed",

            "& .MuiTableCell-root": {
              boxSizing: "border-box",
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
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
                  ...tableHeaderCellSx(theme),
                  width: columnWidths.job,
                  minWidth: columnWidths.job,
                }}
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
                        ...stickyTableCellSx(theme),
                        width: columnWidths.job,
                        minWidth: columnWidths.job,
                        fontWeight: 600,
                      }}
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
                            <ExpandMoreRoundedIcon />
                          ) : (
                            <ChevronRightRoundedIcon />
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
                            {project.name}
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
                      {projectTotal}
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
                          "aria-label": `Select all tasks for ${project.description || project.name}`,
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
                              minWidth: 1450,
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
                                            ...stickyTableCellSx(theme),
                                            width:
                                              columnWidths.job,
                                            minWidth:
                                              columnWidths.job,
                                            pl: 5,

                                          }}
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
                                                <ExpandMoreRoundedIcon />
                                              ) : (
                                                <ChevronRightRoundedIcon />
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
                                            milestoneTotal
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
                                                    pl: 10,
                                                    width:
                                                      columnWidths.job,
                                                    minWidth:
                                                      columnWidths.job,
                                                  }}
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
                                                          type="number"
                                                          size="small"
                                                          inputProps={{
                                                            min: 0,
                                                            max: 14,
                                                            step: 0.5,
                                                          }}
                                                          sx={{
                                                            width: 90,

                                                            "& input":
                                                            {
                                                              textAlign:
                                                                "center",
                                                              py: 0.8,
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
                                                    taskTotal
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
        </Table>
      </TableContainer>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          py: 1.5,
          px: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={saveDraft}
          disabled={savingDraft}
          sx={modalActionButtonSx}
        >
          {savingDraft ? "Saving..." : "Save Draft"}
        </Button>
      </Box>
    </Box>
  );
}
