import React, { useState } from "react";
import {
  Box,
  Button,
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

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { modalActionButtonSx, stickyTableCellSx, tableHeaderCellSx, tableHeadSx } from "../../styles/common";

// =========================================================
// Types
// =========================================================

interface TaskEntry {
  [date: string]: number;
}

interface AssignedTask {
  assign_id: number;
  assign_by: string;
  name: string;
  entries: TaskEntry;
}

interface Milestone {
  id: number;
  name: string;
  assigned_tasks: AssignedTask[];
}

interface SubmissionProject {
  id: number;
  name: string;
  quotation: string;
  milestones: Milestone[];
}

// =========================================================
// Sample API Response
// =========================================================

const initialData: SubmissionProject[] = [
  {
    id: 1,
    name: "HMI Migration",
    quotation: "ICP/PR/2091",

    milestones: [
      {
        id: 1,
        name: "HMI Programing",

        assigned_tasks: [
          {
            assign_id: 1,
            assign_by: "Admin",
            name: "HMI Scada programing",
            entries: {
              "2026-08-07": 4,
            },
          },

          {
            assign_id: 2,
            assign_by: "Anoop Balamohan",
            name: "HMI Screen Development",
            entries: {
              "2026-08-10": 5,
              "2026-08-11": 2,
            },
          },

          {
            assign_id: 3,
            assign_by: "Muralikrishnan R",
            name: "HMI Testing",
            entries: {
              "2026-08-12": 3,
            },
          },
        ],
      },

      {
        id: 2,
        name: "Engineering, Design & Documentation",

        assigned_tasks: [
          {
            assign_id: 4,
            assign_by: "Admin",
            name: "Requirement Study / Site Visits",
            entries: {
              "2026-08-10": 2,
              "2026-08-11": 4,
            },
          },
        ],
      },
    ],
  },

  {
    id: 2,
    name: "ERP Software Improvements",
    quotation: "ICP/PR/2092",

    milestones: [
      {
        id: 3,
        name: "ERP Development",

        assigned_tasks: [
          {
            assign_id: 5,
            assign_by: "Libina",
            name: "ERP API Development",
            entries: {
              "2026-08-10": 4,
              "2026-08-11": 4,
            },
          },
        ],
      },
    ],
  },
];

// =========================================================
// Week
// =========================================================

const weekDays = [
  {
    label: "Mon-10",
    date: "2026-08-10",
  },
  {
    label: "Tue-11",
    date: "2026-08-11",
  },
  {
    label: "Wed-12",
    date: "2026-08-12",
  },
  {
    label: "Thu-13",
    date: "2026-08-13",
  },
  {
    label: "Fri-14",
    date: "2026-08-14",
  },
  {
    label: "Sat-15",
    date: "2026-08-15",
  },
  {
    label: "Sun-16",
    date: "2026-08-16",
  },
];

// =========================================================
// Budget Owners
// =========================================================

const budgetOwners = [
  "Admin",
  "Anoop Balamohan",
  "Muralikrishnan R",
  "Libina",
  "Adritha",
];

// =========================================================
// Common Column Widths
// =========================================================

const columnWidths = {
  job: 430,
  budgetOwner: 190,
  day: 100,
  total: 90,
  action: 45,
};

// =========================================================
// Helpers
// =========================================================

const getTaskTotal = (task: AssignedTask) => {
  return weekDays.reduce(
    (total, day) => total + (task.entries[day.date] ?? 0),
    0,
  );
};

const getMilestoneTotal = (milestone: Milestone) => {
  return milestone.assigned_tasks.reduce(
    (total, task) => total + getTaskTotal(task),
    0,
  );
};

const getProjectTotal = (project: SubmissionProject) => {
  return project.milestones.reduce(
    (total, milestone) => total + getMilestoneTotal(milestone),
    0,
  );
};

// =========================================================
// Component
// =========================================================

export default function Submission() {

  const theme = useTheme();

  const [projects, setProjects] =
    useState<SubmissionProject[]>(initialData);

  const [expandedProjects, setExpandedProjects] =
    useState<number[]>([1]);

  const [expandedMilestones, setExpandedMilestones] =
    useState<number[]>([1]);

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

  const updateBudgetOwner = (
    projectId: number,
    milestoneId: number,
    taskId: number,
    owner: string,
  ) => {
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
  };

  // =======================================================
  // Delete Task
  // =======================================================

  const removeTask = (
    projectId: number,
    milestoneId: number,
    taskId: number,
  ) => {
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
                  milestone.assigned_tasks.filter(
                    (task) =>
                      task.assign_id !== taskId,
                  ),
              };
            },
          ),
        };
      }),
    );
  };

  // =======================================================
  // Save Draft
  // =======================================================

  const saveDraft = () => {
    console.log("Saving draft:", projects);

    // API call can be added here
    //
    // axios.post("/api/submissions/draft/", {
    //   projects,
    // });
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
                sx={{
                  ...tableHeaderCellSx(theme),
                  width: columnWidths.action,
                  minWidth: columnWidths.action,
                }}
              />
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
                getProjectTotal(project);

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
                            {project.name}
                          </Box>

                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {project.quotation}
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

                    {/* Project Action */}

                    <TableCell
                      align="center"
                      sx={{
                        ...stickyTableCellSx(theme),
                        width: columnWidths.action,
                        minWidth: columnWidths.action,
                      }}
                    >
                      <IconButton size="small">
                        <CloseRoundedIcon
                          fontSize="small"
                          sx={{
                            color: "error.main",
                          }}
                        />
                      </IconButton>
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
                                          sx={{
                                            ...stickyTableCellSx(theme),
                                            width:
                                              columnWidths.action,
                                            minWidth:
                                              columnWidths.action,
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
                                                      value={
                                                        task.assign_by
                                                      }
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
                                                      {budgetOwners.map(
                                                        (
                                                          owner,
                                                        ) => (
                                                          <MenuItem
                                                            key={
                                                              owner
                                                            }
                                                            value={
                                                              owner
                                                            }
                                                            sx={{
                                                              fontSize:
                                                                "0.8rem",
                                                            }}
                                                          >
                                                            {
                                                              owner
                                                            }
                                                          </MenuItem>
                                                        ),
                                                      )}
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
                                                      columnWidths.action,
                                                    minWidth:
                                                      columnWidths.action,
                                                  }}
                                                >
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      removeTask(
                                                        project.id,
                                                        milestone.id,
                                                        task.assign_id,
                                                      )
                                                    }
                                                  >
                                                    <CloseRoundedIcon
                                                      fontSize="small"
                                                      sx={{
                                                        color:
                                                          "error.main",
                                                      }}
                                                    />
                                                  </IconButton>
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
          sx={modalActionButtonSx}
        >
          Save Draft
        </Button>
      </Box>
    </Box>
  );
}