import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import api from "../../api/axios";

import Approval from "./Approval";
import Submission, { type TimesheetSubmitEntry } from "./Submission";
import Temp from "./Temp";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import { useCallback, useEffect, useState } from "react";
import {
  AssignmentOutlined,
  WorkOutline,
  HelpOutline,
  ConfirmationNumberOutlined,
  LockOpenOutlined,
  UpdateOutlined,
  SendOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { marginBottomSectionSx, modalActionButtonSx, modalPrimaryActionButtonSx, pageHeaderSx, reportsPageBoxSx5, reportsPageFilterDrawerPaperSx, responsiveRightActionsSx } from "../../styles/common";
import { Button, Divider, Drawer, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showNotification } from "../../api/NotificationService";
import type {
  ERPQuotation
} from "../../types/dataTypes";
import ERPQuotationModal from "../../components/Timesheet/erpQuotaion";
import TimeSheetPreviewModal, { type TimeSheetDay } from "../../components/Timesheet/TimeSheetPreviewModal"
import TimeSheetUnlockRequestModal from "../../components/Timesheet/TimeSheetUnlockRequestModal";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;



  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TimeSheet() {
  const [value, setValue] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(dayjs());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [timeSheetPreviewOpen, setTimeSheetPreviewOpen] = useState(false);
  const [timeSheetPreviewDays, setTimeSheetPreviewDays] = useState<TimeSheetDay[]>([]);
  const [timeSheetSubmitEntries, setTimeSheetSubmitEntries] = useState<TimesheetSubmitEntry[]>([]);
  const [submittingTimeSheet, setSubmittingTimeSheet] = useState(false);

  const [quotations, setQuotations] = useState<ERPQuotation[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [assigningQuotations, setAssigningQuotations] = useState(false);

  const openQuotationModal = async () => {
    handleClose();
    setQuotationModalOpen(true);

    if (quotations.length > 0) {
      return;
    }

    setLoadingQuotations(true);
    try {
      const response = await api.get<ERPQuotation[]>("/erp/quotations/");
      setQuotations(Array.isArray(response.data) ? response.data : []);
    } finally {
      setLoadingQuotations(false);
    }
  };

  const getQuotationDescription = (quotation: ERPQuotation) => {
    return (
      quotation.custom_project_name ||
      quotation.system_name ||
      quotation.project__name ||
      quotation.quotation_no
    );
  };

  const handleQuotationSelect = async (selectedQuotations: ERPQuotation[]) => {
    setAssigningQuotations(true);

    try {
      await Promise.all(
        selectedQuotations.map((quotation) =>
          api.post("/projects/", {
            quotation_id: quotation.id,
            name: quotation.quotation_no,
            description: getQuotationDescription(quotation),
          }),
        ),
      );

      showNotification({
        type: "success",
        message: "ERP quotation tasks assigned successfully.",
      });
      setQuotationModalOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setAssigningQuotations(false);
    }
  };

  const [selectedAssignedTaskIds, setSelectedAssignedTaskIds] = useState<number[]>([]);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extendingTasks, setExtendingTasks] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removingTasks, setRemovingTasks] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const [requestingUnlock, setRequestingUnlock] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Monday - Sunday
  const weekStart = selectedWeek.startOf("isoWeek");
  const weekEnd = weekStart.add(6, "day");
  const weekStartKey = weekStart.format("YYYY-MM-DD");

  const weekNumber = weekStart.isoWeek();

  const previousWeek = () => {
    setSelectedWeek((prev) => prev.subtract(1, "week"));
  };

  const nextWeek = () => {
    setSelectedWeek((prev) => prev.add(1, "week"));
  };

  const nextWeekEnd = weekEnd.add(1, "week");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openTimeSheetPreview = () => {
    handleClose();
    setTimeSheetPreviewOpen(true);
  };

  const handlePreviewDaysChange = useCallback((days: TimeSheetDay[]) => {
    setTimeSheetPreviewDays(days);
  }, []);

  const handleSubmitEntriesChange = useCallback((entries: TimesheetSubmitEntry[]) => {
    setTimeSheetSubmitEntries(entries);
  }, []);

  const submitTimeSheet = async (comments: string) => {
    setSubmittingTimeSheet(true);

    try {
      await api.post("/timesheet-entries/submit/", {
        week_start: weekStartKey,
        comments,
        entries: timeSheetSubmitEntries,
      });

      showNotification({
        type: "success",
        message: "Time sheet submitted successfully.",
      });
      setTimeSheetPreviewOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setSubmittingTimeSheet(false);
    }
  };

  const toggleAssignedTaskSelection = (assignedTaskId: number, checked: boolean) => {
    setSelectedAssignedTaskIds((current) => {
      if (checked) {
        return current.includes(assignedTaskId) ? current : [...current, assignedTaskId];
      }

      return current.filter((id) => id !== assignedTaskId);
    });
  };

  const openExtendDialog = () => {
    handleClose();
    setExtendDialogOpen(true);
  };

  const openRemoveDialog = () => {
    handleClose();
    setRemoveDialogOpen(true);
  };

  const openUnlockDialog = () => {
    handleClose();
    setFilterDrawerOpen(false);
    setUnlockDialogOpen(true);
  };

  const extendSelectedTasks = async () => {
    setExtendingTasks(true);

    try {
      await api.post("/timesheet-entries/extend-tasks/", {
        assigned_task_ids: selectedAssignedTaskIds,
        end_date: nextWeekEnd.format("YYYY-MM-DD"),
      });

      showNotification({
        type: "success",
        message: "Selected tasks extended to next week successfully.",
      });
      setSelectedAssignedTaskIds([]);
      setExtendDialogOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setExtendingTasks(false);
    }
  };

  const removeSelectedTasks = async () => {
    setRemovingTasks(true);

    try {
      const response = await api.post("/timesheet-entries/remove-tasks/", {
        assigned_task_ids: selectedAssignedTaskIds,
        week_start: weekStartKey,
      });

      const blockedCount = Array.isArray(response.data?.blocked_task_ids)
        ? response.data.blocked_task_ids.length
        : 0;

      if (blockedCount > 0) {
        showNotification({
          type: "warning",
          message: "Some selected tasks have time entries and cannot be removed.",
        });
      } else {
        showNotification({
          type: "success",
          message: "Selected tasks removed successfully.",
        });
      }

      setSelectedAssignedTaskIds([]);
      setRemoveDialogOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setRemovingTasks(false);
    }
  };

  const requestUnlock = async () => {
    setRequestingUnlock(true);

    try {
      await api.post("/timesheet-statuses/request-unlock/", {
        week_start: weekStartKey,
        unlock_reason: unlockReason.trim(),
      });

      showNotification({
        type: "success",
        message: "Unlock request submitted successfully.",
      });
      setUnlockReason("");
      setUnlockDialogOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setRequestingUnlock(false);
    }
  };
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // const permissionList = JSON.parse(
  //   localStorage.getItem("permissionList") ?? "[]",
  // ) as string[];

  const permissionList = [
    "view_ticket",
    "add_ticket",
    "view_self_tickets",
    "view_managementoverview",
    "view_report",
    "view_submission",
    "view_approval",
    "New",
  ];

  const tabConfig = [
    {
      permission: "view_submission",
      label: "Submission",
      component: (
        <Submission
          weekStart={weekStartKey}
          refreshKey={refreshKey}
          selectedAssignedTaskIds={selectedAssignedTaskIds}
          onAssignedTaskSelectionChange={toggleAssignedTaskSelection}
          onPreviewDaysChange={handlePreviewDaysChange}
          onSubmitEntriesChange={handleSubmitEntriesChange}
        />
      ),
    },
    {
      permission: "view_approval",
      label: "Approval",
      component: <Approval />,
    },
    {
      permission: "New",
      label: "New",
      component: <Temp />,
    },
  ];

  const availableTabs = tabConfig.filter((tab) =>
    permissionList.includes(tab.permission),
  );

  useEffect(() => {
    if (availableTabs.length && value >= availableTabs.length) {
      setValue(0);
    }
  }, [availableTabs.length, value]);

  useEffect(() => {
    setSelectedAssignedTaskIds([]);
  }, [weekStartKey]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={pageHeaderSx}>
        <Box>
          <Typography variant="h5">Time Sheet</Typography>
          <Typography variant="body2" color="text.secondary">
            submit and approve time sheets for your team.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={responsiveRightActionsSx}>
          {/* Previous Week */}
          <IconButton
            onClick={previousWeek}
            size="small"
            sx={{
              width: 36,
              height: 36,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Week Number */}
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{ minWidth: 70, textAlign: "center" }}
          >
            Week : {weekNumber}
          </Typography>

          <Divider orientation="vertical" flexItem />

          {/* Date Range */}
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              whiteSpace: "nowrap",
              minWidth: 190,
              textAlign: "center",
            }}
          >
            {weekStart.format("DD-MMM-YYYY")}
            {"  |  "}
            {weekEnd.format("DD-MMM-YYYY")}
          </Typography>

          {/* Next Week */}
          <IconButton
            onClick={nextWeek}
            size="small"
            sx={{
              width: 36,
              height: 36,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ChevronRight />
          </IconButton>

          <Button
            sx={modalPrimaryActionButtonSx}
            variant="contained"
            onClick={handleClick}
          >
            Actions
          </Button>

          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.8,
                  minWidth: 250,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 4,
                  overflow: "hidden",
                  "& .MuiMenuItem-root": {
                    minHeight: 40,
                    px: 1.5,
                    py: 0.75,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    transition: "background-color 0.15s ease",

                    "&:last-child": {
                      borderBottom: "none",
                    },

                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  },
                },
              },
            }}
          >
            <MenuItem onClick={openQuotationModal}>
              <ListItemIcon>
                <WorkOutline fontSize="small" />
              </ListItemIcon>
              Assign Jobs From ERP
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <HelpOutline fontSize="small" />
              </ListItemIcon>
              Create Undefined Jobs
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AssignmentOutlined fontSize="small" />
              </ListItemIcon>
              Undefined Tasks Import To Job
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <ConfirmationNumberOutlined fontSize="small" />
              </ListItemIcon>
              Assigned Tickets
            </MenuItem>

            <MenuItem onClick={openUnlockDialog}>
              <ListItemIcon>
                <LockOpenOutlined fontSize="small" />
              </ListItemIcon>
              Unlock Time Sheet Request
            </MenuItem>

            <MenuItem onClick={openExtendDialog}>
              <ListItemIcon>
                <UpdateOutlined fontSize="small" />
              </ListItemIcon>
              Extend Task To Next Week
            </MenuItem>

            <MenuItem onClick={openRemoveDialog}>
              <ListItemIcon>
                <DeleteOutline fontSize="small" />
              </ListItemIcon>
              Remove Task/project
            </MenuItem>
            <MenuItem onClick={openTimeSheetPreview}>
              <ListItemIcon>
                <SendOutlined fontSize="small" />
              </ListItemIcon>
              Preview / Submit
            </MenuItem>
          </Menu>

        </Stack>
      </Box>

      <Box sx={{ mx: 2 }}>
        {availableTabs.length > 0 && (
          <Tabs value={value} onChange={handleChange}>
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.permission}
                label={tab.label}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        )}
      </Box>

      {availableTabs.map((tab, index) => (
        <CustomTabPanel key={tab.permission} value={value} index={index}>
          {tab.component}
        </CustomTabPanel>
      ))}

      <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: reportsPageFilterDrawerPaperSx }}>
        <Box sx={reportsPageBoxSx5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={marginBottomSectionSx} spacing={1.5}>
            <Typography variant="h6">Assign / Submit</Typography>
            <IconButton aria-label="Close filters" onClick={() => setFilterDrawerOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Stack
            direction={{ xs: "column" }}
            justifyContent="space-between"
            spacing={1.5}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Jobs
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Job Undefined
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Task Undefined
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Tickets
            </Button>
            <Button fullWidth variant="contained"
              onClick={openUnlockDialog}
              sx={modalActionButtonSx}>
              Unlock Time Sheet Request
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Extend Task To Next Week
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={modalActionButtonSx}>
              Preview /Submit
            </Button>
          </Stack>
        </Box>
      </Drawer>
      <ConfirmDialog
        open={extendDialogOpen}
        title="Extend Tasks"
        description={`Update ${selectedAssignedTaskIds.length} selected assigned task(s) end date to ${nextWeekEnd.format("DD-MMM-YYYY")}?`}
        confirmLabel={extendingTasks ? "Extending..." : "Extend"}
        confirmDisabled={extendingTasks || selectedAssignedTaskIds.length === 0}
        titleIcon={<UpdateOutlined fontSize="small" />}
        onClose={() => setExtendDialogOpen(false)}
        onConfirm={extendSelectedTasks}
      />
      <ConfirmDialog
        open={removeDialogOpen}
        title="Remove Tasks"
        description={`Remove ${selectedAssignedTaskIds.length} selected assigned task(s) from this week? Tasks with entries in this week cannot be removed.`}
        confirmLabel={removingTasks ? "Removing..." : "Remove"}
        confirmColor="error"
        confirmDisabled={removingTasks || selectedAssignedTaskIds.length === 0}
        titleIcon={<SendOutlined fontSize="small" />}
        onClose={() => setRemoveDialogOpen(false)}
        onConfirm={removeSelectedTasks}
      />
      <TimeSheetUnlockRequestModal
        open={unlockDialogOpen}
        weekNumber={weekNumber}
        weekRange={`${weekStart.format("DD-MMM-YYYY")} | ${weekEnd.format("DD-MMM-YYYY")}`}
        reason={unlockReason}
        submitting={requestingUnlock}
        onReasonChange={setUnlockReason}
        onClose={() => setUnlockDialogOpen(false)}
        onSubmit={requestUnlock}
      />
      <ERPQuotationModal
        open={quotationModalOpen}
        onClose={() => setQuotationModalOpen(false)}
        quotations={quotations}
        loading={loadingQuotations}
        submitting={assigningQuotations}
        onSelect={handleQuotationSelect}
      />
      <TimeSheetPreviewModal
        open={timeSheetPreviewOpen}
        onClose={() => setTimeSheetPreviewOpen(false)}
        days={timeSheetPreviewDays}
        submitting={submittingTimeSheet}
        onSubmit={(data) => void submitTimeSheet(data.comments)}
      />
    </Box>
  );
}

export default TimeSheet;
