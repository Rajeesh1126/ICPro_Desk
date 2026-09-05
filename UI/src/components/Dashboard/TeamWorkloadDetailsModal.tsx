import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import type { TicketData } from "../../types/dataTypes";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { VirtualizedTable, type ColumnData, } from "../../components/common/TableView";

import api from "../../api/axios"; // <-- use your actual api import


export interface DepartmentData {
  name: string;
  color?: string;

  completed: number;
  inprogress: number;
  delayed: number;
}

interface TeamWorkloadDetailsModalProps {
  open: boolean;
  department: DepartmentData | null;
  onClose: () => void;
}

/* =========================================================
   DATE HELPERS
========================================================= */

const getToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

const normalizeDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};


/* =========================================================
   TICKET TABLE
========================================================= */

interface TicketTableProps {
  tickets: TicketData[];
  type: "delayed" | "inprogress" | "completed";
}

const TicketTable = ({
  tickets,
  type,
}: TicketTableProps) => {

const columns = useMemo<ColumnData<TicketData>[]>(() => [
      { label: "#",width: 10,render: (_row, index) => index + 1, number:true},
      {
        label: "Ticket Number",
        width: 180,
        render: (row) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                size="small"
                // onClick={() => openDetails(row)}
              >
                <VisibilityRoundedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{row.number}</Typography>
          </Stack>
        ),
      },
      { label: "Subject", dataKey: "task", width: 500 },
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
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >

      {tickets.length > 0 ? (

        <VirtualizedTable<TicketData>
          columns={columns}
          rows={tickets}
          height="300px"
        />

      ) : (

        <Box
          sx={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No tickets found
          </Typography>
        </Box>

      )}

    </Box>
  );
};


/* =========================================================
   MODAL
========================================================= */

const TeamWorkloadDetailsModal = ({
  open,
  department,
  onClose,
}: TeamWorkloadDetailsModalProps) => {

  const [tickets, setTickets] = useState<TicketData[]>([]);

  const [loading, setLoading] = useState(false);


  /* =======================================================
     GET ALL TICKETS
  ======================================================= */

  useEffect(() => {

    if (!open || !department) {
      return;
    }

    let active = true;

    setLoading(true);

    void api
      .get("/tickets/")
      .then((response) => {

        if (!active) {
          return;
        }

        console.log(
          "Team workload tickets:",
          response.data
        );

        const source = (
          Array.isArray(response.data)
            ? response.data
            : []
        ) as TicketData[];

        setTickets(source);
      })
      .catch((error) => {

        console.error(
          "Failed to load tickets:",
          error
        );

        if (active) {
          setTickets([]);
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

  }, [open, department]);


  /* =======================================================
     CURRENT DATE
  ======================================================= */

  const today = useMemo(
    () => getToday(),
    []
  );


  /* =======================================================
     FILTER DEPARTMENT
  ======================================================= */

  const departmentTickets = useMemo(() => {

    if (!department) {
      return [];
    }

    return tickets.filter(
      (ticket) =>
        ticket.department_name === department.name
    );

  }, [tickets, department]);


  /* =======================================================
     COMPLETED
  ======================================================= */

  const completedTickets = useMemo(() => {

    return departmentTickets.filter(
      (ticket) =>
        ticket.current_status?.toLowerCase() ===
        "completed"
    );

  }, [departmentTickets]);


  /* =======================================================
     DELAYED
  ======================================================= */

  const delayedTickets = useMemo(() => {

    return departmentTickets.filter((ticket) => {

      const status =
        ticket.current_status?.toLowerCase();

      // Completed tickets cannot be delayed
      if (status === "completed") {
        return false;
      }

      if (!ticket.target_date) {
        return false;
      }

      const targetDate =
        normalizeDate(ticket.target_date);

      if (!targetDate) {
        return false;
      }

      return targetDate < today;
    });

  }, [departmentTickets, today]);


  /* =======================================================
     IN PROGRESS
  ======================================================= */

  const inprogressTickets = useMemo(() => {

    const inactiveStatuses = [
      "rejected",
      "closed",
      "recall successful",
      "completed",
    ];

    return departmentTickets.filter((ticket) => {

      const status =
        ticket.current_status?.toLowerCase();

      // Don't show inactive tickets
      if (
        inactiveStatuses.includes(status || "")
      ) {
        return false;
      }

      // If target date has passed,
      // it belongs to Delayed instead.
      if (ticket.target_date) {

        const targetDate =
          normalizeDate(ticket.target_date);

        if (
          targetDate &&
          targetDate < today
        ) {
          return false;
        }
      }

      return true;
    });

  }, [departmentTickets, today]);


  /* =======================================================
     TOTAL
  ======================================================= */

  const totalTickets =
    completedTickets.length +
    inprogressTickets.length +
    delayedTickets.length;


  /* =======================================================
     NO DEPARTMENT
  ======================================================= */

  if (!department) {
    return null;
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >

      <DialogTitle
        sx={{
          px: 3,
          py: 2,
        }}
      >

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >

          <Box>

            <Typography
              fontWeight={800}
              fontSize={20}
            >
              {department.name} — Ticket Details
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Detailed team workload
            </Typography>

          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>

        </Stack>

      </DialogTitle>


      <DialogContent
        dividers
        sx={{
          backgroundColor: "#fafafa",
          p: 3,
        }}
      >

        <Stack spacing={3}>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: 1.5,

              "@media (max-width: 800px)": {
                gridTemplateColumns:
                  "repeat(2, 1fr)",
              },

              "@media (max-width: 500px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >

            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid #e5e7eb",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                Total Tickets
              </Typography>

              <Typography
                fontSize={24}
                fontWeight={800}
              >
                {totalTickets}
              </Typography>
            </Paper>


            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid #fecaca",
                borderRadius: 2,
                backgroundColor: "#fff7f7",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: "#ef4444",
                }}
              >
                Delayed
              </Typography>

              <Typography
                fontSize={24}
                fontWeight={800}
                sx={{
                  color: "#ef4444",
                }}
              >
                {delayedTickets.length}
              </Typography>
            </Paper>


            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid #bfdbfe",
                borderRadius: 2,
                backgroundColor: "#f7faff",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: "#3b82f6",
                }}
              >
                In Progress
              </Typography>

              <Typography
                fontSize={24}
                fontWeight={800}
                sx={{
                  color: "#3b82f6",
                }}
              >
                {inprogressTickets.length}
              </Typography>
            </Paper>


            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid #bbf7d0",
                borderRadius: 2,
                backgroundColor: "#f7fff9",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: "#22c55e",
                }}
              >
                Completed
              </Typography>

              <Typography
                fontSize={24}
                fontWeight={800}
                sx={{
                  color: "#22c55e",
                }}
              >
                {completedTickets.length}
              </Typography>
            </Paper>

          </Box>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <Box
              sx={{
                py: 3,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Loading tickets...
              </Typography>
            </Box>
          )}


          {/* =================================================
              DELAYED
          ================================================= */}

          {!loading && (
            <Box>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.25 }}
              >

                <Box>

                  <Typography
                    fontWeight={800}
                    fontSize={16}
                    sx={{
                      color: "#ef4444",
                    }}
                  >
                    1. Delayed Tickets
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Tickets that have passed their target date
                  </Typography>

                </Box>

                <Chip
                  label={delayedTickets.length}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: "#ef4444",
                    backgroundColor: "#fee2e2",
                  }}
                />

              </Stack>

              <TicketTable
                tickets={delayedTickets}
                type="delayed"
              />

            </Box>
          )}


          {/* =================================================
              IN PROGRESS
          ================================================= */}

          {!loading && (
            <Box>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.25 }}
              >

                <Box>

                  <Typography
                    fontWeight={800}
                    fontSize={16}
                    sx={{
                      color: "#3b82f6",
                    }}
                  >
                    2. In Progress Tickets
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Tickets currently being worked on
                  </Typography>

                </Box>

                <Chip
                  label={inprogressTickets.length}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: "#3b82f6",
                    backgroundColor: "#dbeafe",
                  }}
                />

              </Stack>

              <TicketTable
                tickets={inprogressTickets}
                type="inprogress"
              />

            </Box>
          )}


          {/* =================================================
              COMPLETED
          ================================================= */}

          {!loading && (
            <Box>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.25 }}
              >

                <Box>

                  <Typography
                    fontWeight={800}
                    fontSize={16}
                    sx={{
                      color: "#22c55e",
                    }}
                  >
                    3. Completed Tickets
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Tickets successfully completed
                  </Typography>

                </Box>

                <Chip
                  label={completedTickets.length}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: "#22c55e",
                    backgroundColor: "#dcfce7",
                  }}
                />

              </Stack>

              <TicketTable
                tickets={completedTickets}
                type="completed"
              />

            </Box>
          )}

        </Stack>

      </DialogContent>

    </Dialog>
  );
};


export default TeamWorkloadDetailsModal;