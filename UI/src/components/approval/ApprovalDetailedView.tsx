import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";

import type { ApprovalRow, ApiTaskRow, TaskRow } from "../../types/dataTypes";

import api from "../../api/axios";

import { approveDetailDialogPaperSx } from "../../styles/common";
import { useNotification } from "../../context/notificationContext";

interface ApprovalDetailResponse {
  rows: ApiTaskRow[];
  comments?: string;
  action_status?: boolean;
}

interface ApprovalDetailedViewProps {
  open: boolean;
  employee: ApprovalRow | null;
  onClose: () => void;
  weekStart: string;
}

const timeValueToSeconds = (value: number | string) => {
  const rawValue = String(value).trim();

  if (!rawValue) {
    return 0;
  }

  const [hoursPart = "0", minutesPart = ""] = rawValue.split(".");
  const hours = Number(hoursPart || 0);
  const minutes =
    minutesPart === "" ? 0 : Number(minutesPart.padEnd(2, "0").slice(0, 2));

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }

  return hours * 3600 + minutes * 60;
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

const isOthersProject = (project?: string) =>
  (project || "").trim().toLowerCase() === "others";

const ApprovalDetailedView: React.FC<ApprovalDetailedViewProps> = ({
  open,
  employee,
  onClose,
  weekStart,
}) => {
  const { showNotification } = useNotification();

  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const tableMinWidth = 1480;

  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [updatingAction, setUpdatingAction] = useState<
    "Accepted" | "Rejected" | null
  >(null);

  const [comments, setComments] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [rejectReasonError, setRejectReasonError] = useState("");

  const [pendingRejectTask, setPendingRejectTask] = useState<TaskRow | null>(
    null,
  );

  const days = useMemo(() => {
    if (!weekStart) {
      return [];
    }

    const startDate = new Date(`${weekStart}T00:00:00`);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const result: {
      label: string;
      date: string;
    }[] = [];

    for (let index = 0; index < 7; index++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      const dayName = dayNames[currentDate.getDay()];
      const dayNumber = String(currentDate.getDate()).padStart(2, "0");
      result.push({
        label: `${dayName}-${dayNumber}`,
        date: currentDate.toISOString().split("T")[0],
      });
    }
    return result;
  }, [weekStart]);

  useEffect(() => {
    if (!open || !employee?.id || !weekStart) {
      return;
    }
    let active = true;
    setLoading(true);
    setTasks([]);
    setComments("");
    void api
      .get<ApprovalDetailResponse>("/approval-detail-data/", {
        params: {
          weekStart,
          employeeId: employee.id,
        },
      })
      .then((response) => {
        if (!active) {
          return;
        }
        console.log("Approval Detail Data:", response.data);
        const apiRows = response.data?.rows || [];
        setComments(response.data?.comments || "");
        const projectMap = new Map<
          number,
          {
            projectId: number;
            project: string;
            tasks: ApiTaskRow[];
          }
        >();

        apiRows.forEach((row) => {
          if (row.projectId === null || row.projectId === undefined) {
            return;
          }

          if (!projectMap.has(row.projectId)) {
            projectMap.set(row.projectId, {
              projectId: row.projectId,
              project: row.project,
              tasks: [],
            });
          }
          projectMap.get(row.projectId)!.tasks.push(row);
        });

        const tableRows: TaskRow[] = [];

        projectMap.forEach((projectData) => {
          tableRows.push({
            id: projectData.projectId,
            projectId: projectData.projectId,
            project: projectData.project,
            task: "",
            budgetOwner: "",
            hours: ["", "", "", "", "", "", ""],
            rating: "",
            status: "",
            rowType: "project",
          });

          projectData.tasks.forEach((task) => {
            tableRows.push({
              id: task.id,
              projectId: task.projectId,
              project: projectData.project,
              task: task.task,
              budgetOwner: task.budgetOwner,
              hours: Array.isArray(task.hours)
                ? task.hours
                : ["", "", "", "", "", "", ""],

              rating: String(task.rating ?? ""),
              status: task.status || "Pending",
              rowType: "milestone",
              approvedStatus: task.approvedStatus,
              rejectionReason: task.rejectionReason,
            });
          });
        });

        setTasks(tableRows);
        setExpandedProjects(Array.from(projectMap.keys()));
      })
      .catch((error) => {
        console.error("Failed to load approval data", error);

        if (active) {
          setTasks([]);
          setExpandedProjects([]);
          setComments("");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, employee?.id, weekStart]);

  const handleToggleProject = useCallback((projectId: number) => {
    setExpandedProjects((previous) => {
      if (previous.includes(projectId)) {
        return previous.filter((id) => id !== projectId);
      }

      return [...previous, projectId];
    });
  }, []);

  const visibleTasks = useMemo(() => {
    const result: TaskRow[] = [];

    tasks.forEach((row) => {
      if (row.rowType === "project") {
        result.push(row);
        return;
      }

      if (
        row.rowType === "milestone" &&
        expandedProjects.includes(row.projectId)
      ) {
        result.push(row);
      }
    });

    return result;
  }, [tasks, expandedProjects]);

  const totals = useMemo(() => {
    return days.map((_, dayIndex) => {
      return tasks
        .filter((task) => task.rowType === "milestone")
        .reduce((total, task) => {
          return total + timeValueToSeconds(task.hours[dayIndex] || "0");
        }, 0);
    });
  }, [tasks, days]);

  const handleRatingChange = useCallback((taskId: number, value: string) => {
    setTasks((previous) =>
      previous.map((row) => {
        if (row.id !== taskId) {
          return row;
        }

        return {
          ...row,
          rating: value,
        };
      }),
    );
  }, []);

  const handleApprovalAction = useCallback(
    async (
      row: TaskRow,
      action: "Accepted" | "Rejected",
      actionComments = comments,
    ) => {
      if (!employee?.id) {
        return false;
      }

      if (
        !isOthersProject(row.project) &&
        (!row.rating || row.rating === "0")
      ) {
        showNotification(
          "Please select a rating before approving or rejecting.",
          "warning",
        );
        return false;
      }

      const ratingNumber = isOthersProject(row.project)
        ? 0
        : Number(row.rating);

      const requiresRating = !isOthersProject(row.project);

      if (
        requiresRating &&
        (Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5)
      ) {
        showNotification("Please select a valid rating.", "warning");
        return false;
      }

      if (updatingTaskId !== null) {
        return false;
      }

      try {
        setUpdatingTaskId(row.id);
        setUpdatingAction(action);

        const response = await api.patch("/approval-detail-data/", {
          weekStart,
          employeeId: employee.id,
          assignId: row.id,
          action,
          rating: ratingNumber,
          comments: actionComments,
        });

        console.log("Approval updated:", response.data);

        showNotification(
          `Submission ${action.toLowerCase()} successfully.`,
          "success",
        );

        setTasks((previous) =>
          previous.map((task) => {
            if (task.id !== row.id) {
              return task;
            }

            return {
              ...task,
              status: action,
              rating: String(ratingNumber),
              rejectionReason: action === "Rejected" ? actionComments : null,
            };
          }),
        );

        return true;
      } catch (error) {
        console.error(`Failed to ${action.toLowerCase()} submission:`, error);

        showNotification(
          `Failed to ${action.toLowerCase()} submission.`,
          "error",
        );

        return false;
      } finally {
        setUpdatingTaskId(null);
        setUpdatingAction(null);
      }
    },
    [employee?.id, weekStart, comments, updatingTaskId, showNotification],
  );

  const openRejectDialog = useCallback((row: TaskRow) => {
    setPendingRejectTask(row);
    setRejectReason(row.rejectionReason || "");
    setRejectReasonError("");
    setRejectDialogOpen(true);
  }, []);

  const closeRejectDialog = useCallback(() => {
    if (updatingTaskId !== null) {
      return;
    }

    setRejectDialogOpen(false);
    setPendingRejectTask(null);
    setRejectReason("");
    setRejectReasonError("");
  }, [updatingTaskId]);

  const submitRejectReason = useCallback(async () => {
    const reason = rejectReason.trim();

    if (!pendingRejectTask) {
      return;
    }

    if (!reason) {
      setRejectReasonError("Rejection reason is required.");
      showNotification("Please enter a rejection reason.", "warning");
      return;
    }

    const success = await handleApprovalAction(
      pendingRejectTask,
      "Rejected",
      reason,
    );

    if (!success) {
      return;
    }

    setRejectDialogOpen(false);
    setPendingRejectTask(null);
    setRejectReason("");
    setRejectReasonError("");
  }, [handleApprovalAction, pendingRejectTask, rejectReason, showNotification]);

  const columns: ColumnData<TaskRow>[] = useMemo(() => {
    const result: ColumnData<TaskRow>[] = [
      {
        label: "Jobs",
        width: { xs:160, sm: 220},
        render: (row: TaskRow) => {
          if (row.rowType === "project") {
            const isExpanded = expandedProjects.includes(row.projectId);

            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleToggleProject(row.projectId)}
                  sx={{
                    p: 0,
                    mr: 0.5,
                  }}
                >
                  <KeyboardArrowDownOutlinedIcon
                    sx={{
                      fontSize: 18,
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                  />
                </IconButton>

                <Typography
                  component="span"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {row.project}
                </Typography>
              </Box>
            );
          }

          return (
            <Typography
              component="span"
              sx={{
                marginLeft: 4,
                fontSize: 13,
              }}
            >
              {row.task}
            </Typography>
          );
        },
      },

      {
        label: "Budget Owner",
        width: 150,
        render: (row: TaskRow) => {
          if (row.rowType === "project") {
            return null;
          }
          return row.budgetOwner;
        },
      },
    ];

    days.forEach((day, dayIndex) => {
      result.push({
        label: day.label,
        width: 54,
        render: (row: TaskRow) => {
          if (row.rowType === "project") {
            return null;
          }
          return <HourCell value={row.hours[dayIndex] || ""} />;
        },
      });
    });

    result.push({
      label: "Rating",
      width: 120,
      render: (row: TaskRow) => {
        if (row.rowType === "project") {
          return null;
        }

        if (isOthersProject(row.project)) {
          return null;
        }

        const isAccepted = row.status === "Accepted";
        const isRejected = row.status === "Rejected";

        return (
          <Select
            size="small"
            value={row.rating || ""}
            displayEmpty
            disabled={updatingTaskId === row.id || isRejected || isAccepted}
            onChange={(event) => {
              handleRatingChange(
                row.id,
                String(event.target.value),
              );
            }}
            sx={{
              width: 118,
              height: 32,
              fontSize: 12,
              "& .MuiSelect-select": {
                py: 0.5,
                px: 1,
              },
            }}
          >
            <MenuItem value="0">Select</MenuItem>
            <MenuItem value="1">Poor</MenuItem>
            <MenuItem value="2">Average</MenuItem>
            <MenuItem value="3">Good</MenuItem>
            <MenuItem value="4">Very Good</MenuItem>
            <MenuItem value="5">Excellent</MenuItem>
          </Select>
        );
      },
    });

    result.push({
      label: "Status",
      width: 80,
      render: (row: TaskRow) => {
        if (row.rowType === "project") {
          return null;
        }

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 26,
              px: 1,
              borderRadius: 1,
              bgcolor:
                row.status === "Accepted"
                  ? "rgba(46, 125, 50, 0.12)"
                  : "rgba(211, 47, 47, 0.12)",
              color: row.status === "Accepted" ? "success.main" : "error.main",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {row.status}
          </Box>
        );
      },
    });

    result.push({
      label: "Accept",
      width: 100,
      render: (row: TaskRow) => {
        if (row.rowType === "project") {
          return null;
        }

        const isRowUpdating = updatingTaskId === row.id;
        const isAcceptUpdating =
          isRowUpdating && updatingAction === "Accepted";
          console.log("isAcceptUpdating:", isAcceptUpdating, "updatingTaskId:", updatingTaskId, "updatingAction:", updatingAction, "row.id:", row.id);
        const isAccepted = row.status === "Accepted";
        const isRejected = row.status === "Rejected";

        return (
          <Button
            variant="contained"
            color="success"
            startIcon={isAcceptUpdating ? undefined : <CheckCircleOutlinedIcon />}
            disabled={isAccepted || isRejected || isRowUpdating}
            onClick={() => void handleApprovalAction(row, "Accepted")}
            sx={{
              textTransform: "none",
              boxShadow: "none",
              "& .MuiButton-startIcon": {
                mr: 0.5,
              },
            }}
          >
            {isAcceptUpdating ? "..." : "Accept"}
          </Button>
        );
      },
    });

    result.push({
      label: "Reject",
      width: 100,
      render: (row: TaskRow) => {
        if (row.rowType === "project") {
          return null;
        }

        const isRowUpdating = updatingTaskId === row.id;
        const isRejectUpdating =
          isRowUpdating && updatingAction === "Rejected";
        const isRejected = row.status === "Rejected";
        const isAccepted = row.status === "Accepted";
        return (
          <Button
            variant="contained"
            color="error"
            startIcon={isRejectUpdating ? undefined : <HighlightOffOutlinedIcon />}
            disabled={isRejected || isAccepted || isRowUpdating}
            onClick={() => openRejectDialog(row)}
            sx={{
              textTransform: "none",
              boxShadow: "none",
              "& .MuiButton-startIcon": {
                mr: 0.5,
              },
            }}
          >
            {isRejectUpdating ? "..." : "Reject"}
          </Button>
        );
      },
    });
    return result;
  }, [
    days,
    expandedProjects,
    handleToggleProject,
    handleRatingChange,
    handleApprovalAction,
    openRejectDialog,
    updatingTaskId,
    updatingAction,
  ]);

  const footerContent = useCallback(
    () => (
      <TableRow>
        {columns.map((column, index) => {
          const dayIndex = days.findIndex((day) => day.label === column.label);

          return (
            <TableCell
              key={column.label}
              align={dayIndex >= 0 ? "center" : "left"}
              sx={(theme) => ({
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                fontSize: 12,
                fontWeight: 700,
                color: theme.palette.text.primary,

                backgroundColor:
                  index === 0
                    ? `${theme.palette.background.paper} !important`
                    : theme.palette.background.paper,

                backgroundImage: "none",
                borderTop: `1px solid ${theme.palette.divider}`,
                position: index === 0 ? "sticky" : "static",
                left: index === 0 ? 0 : "auto",
                zIndex: index === 0 ? 16 : 1,
                overflow: "hidden",
                boxShadow:
                  index === 0
                    ? `1px 0 0 ${theme.palette.divider}, 10px 0 12px -14px ${theme.palette.text.primary}`
                    : undefined,
              })}
            >
              {column.label === "Budget Owner"
                ? "Total"
                : dayIndex >= 0
                  ? secondsToTimeValue(totals[dayIndex]).toFixed(2)
                  : ""}
            </TableCell>
          );
        })}
      </TableRow>
    ),
    [columns, days, totals],
  );

  if (!employee) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: () => ({
            ...approveDetailDialogPaperSx,
            height: "min(92dvh, 760px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }),
        }}
      >
        <Box
          sx={(theme) => ({
            minHeight: 58,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            // flexWrap: { xs: "wrap", md: "nowrap" },
            px: { xs: 1.5, sm: 2 },
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Typography
            sx={(theme) => ({
              fontSize: 13,
              fontWeight: 600,
              textwrap: "wrap",
              lineHeight: 1.25,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: theme.palette.text.primary,
            })}
          >
            Project Detailed View of {employee.name}
          </Typography>

          <Typography
            sx={(theme) => ({
              ml: "auto",
              mr: { xs: 0, sm: 1 },
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: theme.palette.primary.main,
            })}
          >
            {employee.overview === "Accepted"
              ? "Timesheet is already Accepted"
              : employee.approval_status}
          </Typography>

          <IconButton
            size="small"
            onClick={onClose}
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            })}
          >
            <CloseOutlinedIcon
              sx={{
                fontSize: 20,
              }}
            />
          </IconButton>
        </Box>

        <Box
          sx={(theme) => ({
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            p: { xs: 1, sm: 1.5 },
            overflow: "hidden",
            backgroundColor: theme.palette.background.default,
          })}
        >
          {loading ? (
            <Box
              sx={{
                height: "40dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                }}
              >
                Loading...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                overflowY: "hidden",
                pb: 0.25,
              }}
            >
              <Box sx={{ height: "100%" }}>
                <VirtualizedTable<TaskRow>
                  columns={columns}
                  rows={visibleTasks}
                  tableHead="Submitted Data"
                  height="100%"
                  tableMinWidth={tableMinWidth}
                  fixedFooterContent={footerContent}
                  stickyFirstColumn
                />
              </Box>
            </Box>
          )}
          {comments.trim() && (
            <Box
              sx={{
                flexShrink: 0,
              }}
            >
              <Typography
                sx={(theme) => ({
                  fontSize: 12,
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  mb: 0.5,
                })}
              >
                Comments
              </Typography>

              <Box
                component="textarea"
                value={comments}
                disabled
                onChange={(event) => setComments(event.target.value)}
                placeholder={"NO comments..."}
                sx={(theme) => ({
                  width: "100%",
                  minHeight: 65,
                  resize: "vertical",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  outline: "none",
                  p: 1,
                  fontFamily: "inherit",
                  fontSize: 12,
                  boxSizing: "border-box",
                  "&::placeholder": {
                    color: theme.palette.text.secondary,
                    opacity: 0.7,
                  },
                  "&:focus": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                  },
                })}
              />
            </Box>
          )}
        </Box>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onClose={closeRejectDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Rejection Reason
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            {pendingRejectTask?.task}
          </Typography>

          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value);
              if (rejectReasonError) {
                setRejectReasonError("");
              }
            }}
            error={Boolean(rejectReasonError)}
            helperText={rejectReasonError}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            startIcon={<CancelOutlinedIcon />}
            onClick={closeRejectDialog}
            disabled={updatingTaskId !== null}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => void submitRejectReason()}
            disabled={updatingTaskId !== null}
            startIcon={updatingTaskId !== null ? undefined : <SendOutlinedIcon />}
          >
            {updatingTaskId !== null ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const HourCell: React.FC<{
  value: string;
}> = ({ value }) => {
  if (!value) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        width: 48,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[100],
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        fontSize: 11.5,
        fontWeight: 500,
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
        },
      })}
    >
      {value}
    </Box>
  );
};

export default ApprovalDetailedView;
