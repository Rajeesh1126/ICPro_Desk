import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import api from "../../api/axios";

import Approval from "./Approval";
import Submission, { type BudgetOwnerValidation, type DailyHoursValidation, type TimesheetSubmitEntry, type WeeklyHoursValidation } from "./Submission";
import Temp from "./Temp";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import {
  useCallback,
  useEffect,
  useState } from "react";
import {
  AssignmentOutlined as AssignmentOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  WorkOutlineOutlined as WorkOutlineOutlinedIcon,
  HelpOutlineOutlined as HelpOutlineOutlinedIcon,
  ConfirmationNumberOutlined as ConfirmationNumberOutlinedIcon,
  LockOpenOutlined as LockOpenOutlinedIcon,
  UpdateOutlined as UpdateOutlinedIcon,
  SendOutlined as SendOutlinedIcon,
  DeleteOutlineOutlined as DeleteOutlineOutlinedIcon,
  KeyboardArrowDownOutlined as KeyboardArrowDownOutlinedIcon
} from "@mui/icons-material";

import {
  actionMenuItem,
  actionMenuPaper,
  actionMenuSection,
  pageHeaderContent,
  centeredTextGroup,
  compactDivider,
  compactHeaderButton,
  compactWeekChip,
  headerActionBadge,
  nowrapResponsiveText,
  pageFill,
  pageSubtitle,
  pageTitle,
  squareIconButton,
  tabPanelContent,
  tabs,
  tabsContainer,
  timesheetHeaderActions,
  timesheetPageHeader,
  weekSelectorPanel,
} from "../../styles/common";
import { Badge,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography } from "@mui/material";
import {
  ChevronLeftOutlined as ChevronLeftOutlinedIcon,
  ChevronRightOutlined as ChevronRightOutlinedIcon
} from "@mui/icons-material";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showNotification } from "../../api/notificationService";
import type {
  ERPQuotation,
  SubmissionProject,
} from "../../types/dataTypes";
import ERPQuotationModal from "../../components/timesheet/ERPQuotationModal";
import CreateUndefinedModal from "../../components/timesheet/CreateUndefinedModal"
import TimeSheetPreviewModal, { type TimeSheetDay } from "../../components/timesheet/TimeSheetPreviewModal"
import TimeSheetUnlockRequestModal from "../../components/timesheet/TimeSheetUnlockRequestModal";
import TimeSheetTicketsModal, { type TimeSheetTicketOption } from "../../components/timesheet/TimeSheetTicketsModal";
import AssignCostMasterTasksModal, {
  type TimeSheetCostCategory,
  type TimeSheetCostMaster,
  type TimeSheetPhaseMapping,
} from "../../components/timesheet/AssignCostMasterTasksModal";


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
      style={{ height: value === index ? "100%" : undefined, minHeight: 0 }}
      {...other}
    >
      {value === index && (
        <Box sx={tabPanelContent}>
          {children}
        </Box>
      )}
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
  const [budgetOwnerValidation, setBudgetOwnerValidation] = useState<BudgetOwnerValidation>({
    missingCount: 0,
    missingTaskNames: [],
  });
  const [dailyHoursValidation, setDailyHoursValidation] = useState<DailyHoursValidation>({
    exceededDays: [],
  });
  const [weeklyHoursValidation, setWeeklyHoursValidation] = useState<WeeklyHoursValidation>({
    estimatedHours: 54,
    actualHours: 0,
    isSatisfied: false,
  });
  const [submittingTimeSheet, setSubmittingTimeSheet] = useState(false);

  const [quotations, setQuotations] = useState<ERPQuotation[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [assigningQuotations, setAssigningQuotations] = useState(false);


  const [undefinedModalOpen, setUndefinedModalOpen] = useState(false);
  const [creatingUndefinedJob, setCreatingUndefinedJob] = useState(false);
  const [ticketsModalOpen, setTicketsModalOpen] = useState(false);
  const [ticketOptions, setTicketOptions] = useState<TimeSheetTicketOption[]>([]);
  const [loadingTicketOptions, setLoadingTicketOptions] = useState(false);
  const [assigningTickets, setAssigningTickets] = useState(false);
  const [assignTasksModalOpen, setAssignTasksModalOpen] = useState(false);
  const [assignedWeekProjects, setAssignedWeekProjects] = useState<SubmissionProject[]>([]);
  const [phaseMappings, setPhaseMappings] = useState<TimeSheetPhaseMapping[]>([]);
  const [costCategories, setCostCategories] = useState<TimeSheetCostCategory[]>([]);
  const [costMasters, setCostMasters] = useState<TimeSheetCostMaster[]>([]);
  const [loadingAssignTaskOptions, setLoadingAssignTaskOptions] = useState(false);
  const [assignTaskOptionsError, setAssignTaskOptionsError] = useState("");
  const [assigningCostMasterTasks, setAssigningCostMasterTasks] = useState(false);

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

  const openUndefinedModal = () => {
    handleClose();
    setUndefinedModalOpen(true);
  };

  const openTicketsModal = async () => {
    handleClose();
    setTicketsModalOpen(true);
    setLoadingTicketOptions(true);

    try {
      const response = await api.get<TimeSheetTicketOption[]>("/timesheet-entries/ticket-options/");
      setTicketOptions(Array.isArray(response.data) ? response.data : []);
    } finally {
      setLoadingTicketOptions(false);
    }
  };

  const openAssignTasksModal = async () => {
    handleClose();
    setAssignTasksModalOpen(true);
    setLoadingAssignTaskOptions(true);
    setAssignTaskOptionsError("");

    try {
      const [projectsResponse, phasesResponse, categoriesResponse, costMastersResponse] = await Promise.all([
        api.get<SubmissionProject[]>("/timesheet-entries/", {
          params: { week_start: weekStartKey },
        }),
        api.get<TimeSheetPhaseMapping[]>("/phases/"),
        api.get<TimeSheetCostCategory[]>("/erp/cost-categories/"),
        api.get<TimeSheetCostMaster[]>("/erp/cost-masters/"),
      ]);

      setAssignedWeekProjects(Array.isArray(projectsResponse.data) ? projectsResponse.data : []);
      setPhaseMappings(Array.isArray(phasesResponse.data) ? phasesResponse.data : []);
      setCostCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      setCostMasters(Array.isArray(costMastersResponse.data) ? costMastersResponse.data : []);
    } catch {
      setAssignedWeekProjects([]);
      setPhaseMappings([]);
      setCostCategories([]);
      setCostMasters([]);
      setAssignTaskOptionsError("Could not load assigned projects or mapped cost master items.");
    } finally {
      setLoadingAssignTaskOptions(false);
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
            code: quotation.quotation_no,
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

  const createUndefinedJob = async (data: {
    description: string;
    customerName: string;
    jobNumber: string;
  }) => {
    const trimmedDescription = data.description.trim();
    const trimmedCustomerName = data.customerName.trim();
    const trimmedJobNumber = data.jobNumber.trim();
    const description = trimmedJobNumber
      ? `${trimmedDescription} - ${trimmedJobNumber}`
      : trimmedDescription;

    setCreatingUndefinedJob(true);
    try {
      const response = await api.post("/projects/", {
        description,
        customer: trimmedCustomerName || null,
      });
      if (response.data?.id) {
        await api.post("/timesheet-entries/assign-project/", {
          project_id: response.data.id,
        });
      }

      showNotification({
        type: "success",
        message: "Undefined job created successfully.",
      });
      setUndefinedModalOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setCreatingUndefinedJob(false);
    }
  };

  const assignSelectedTickets = async (ticketIds: number[]) => {
    setAssigningTickets(true);

    try {
      await api.post("/timesheet-entries/assign-tickets/", {
        ticket_ids: ticketIds,
      });

      showNotification({
        type: "success",
        message: "Selected tickets assigned to time sheet successfully.",
      });
      setTicketsModalOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setAssigningTickets(false);
    }
  };

  const assignCostMasterTasks = async (selection: Record<number, number[]>) => {
    setAssigningCostMasterTasks(true);

    try {
      await Promise.all(
        Object.entries(selection).map(([projectId, costMasterIds]) =>
          api.post(`/projects/${projectId}/cost-master-tasks/`, {
            cost_master_ids: costMasterIds,
          }),
        ),
      );

      showNotification({
        type: "success",
        message: "Selected cost master tasks assigned successfully.",
      });
      setAssignTasksModalOpen(false);
      setRefreshKey((current) => current + 1);
    } finally {
      setAssigningCostMasterTasks(false);
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

    if (!weeklyHoursValidation.isSatisfied) {
      showNotification({
        type: "error",
        message: `Entered hours must be at least estimated hours before submitting. Estimated: ${weeklyHoursValidation.estimatedHours}, Entered: ${weeklyHoursValidation.actualHours.toFixed(2)}.`,
      });
      return;
    }

    setTimeSheetPreviewOpen(true);
  };

  const handlePreviewDaysChange = useCallback((days: TimeSheetDay[]) => {
    setTimeSheetPreviewDays(days);
  }, []);

  const handleSubmitEntriesChange = useCallback((entries: TimesheetSubmitEntry[]) => {
    setTimeSheetSubmitEntries(entries);
  }, []);

  const handleBudgetOwnerValidationChange = useCallback((validation: BudgetOwnerValidation) => {
    setBudgetOwnerValidation(validation);
  }, []);

  const handleDailyHoursValidationChange = useCallback((validation: DailyHoursValidation) => {
    setDailyHoursValidation(validation);
  }, []);

  const handleWeeklyHoursValidationChange = useCallback((validation: WeeklyHoursValidation) => {
    setWeeklyHoursValidation(validation);
  }, []);

  const submitTimeSheet = async (comments: string) => {
    if (dailyHoursValidation.exceededDays.length > 0) {
      const visibleDays = dailyHoursValidation.exceededDays.slice(0, 3).join(", ");
      const remainingCount = dailyHoursValidation.exceededDays.length - 3;
      const remainingText = remainingCount > 0 ? ` and ${remainingCount} more` : "";

      showNotification({
        type: "error",
        message: `Daily total cannot exceed 14 hours before submitting: ${visibleDays}${remainingText}.`,
      });
      return;
    }

    if (!weeklyHoursValidation.isSatisfied) {
      showNotification({
        type: "error",
        message: `Entered hours must be at least estimated hours before submitting. Estimated: ${weeklyHoursValidation.estimatedHours}, Entered: ${weeklyHoursValidation.actualHours.toFixed(2)}.`,
      });
      return;
    }

    if (budgetOwnerValidation.missingCount > 0) {
      const visibleNames = budgetOwnerValidation.missingTaskNames.slice(0, 3).join(", ");
      const remainingCount = budgetOwnerValidation.missingCount - 3;
      const remainingText = remainingCount > 0 ? ` and ${remainingCount} more` : "";

      showNotification({
        type: "error",
        message: `Select Budget Owner before submitting: ${visibleNames}${remainingText}.`,
      });
      return;
    }

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
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    if (availableTabs[newValue]?.permission === "view_approval") {
      setAnchorEl(null);
    }
  };

  // const permissionList = JSON.parse(
  //   localStorage.getItem("permissionList") ?? "[]",
  // ) as string[];

  const permissionList = [
   
    "view_submission",
    "view_approval",
    // "New",
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
          onBudgetOwnerValidationChange={handleBudgetOwnerValidationChange}
          onDailyHoursValidationChange={handleDailyHoursValidationChange}
          onWeeklyHoursValidationChange={handleWeeklyHoursValidationChange}
        />
      ),
    },
    {
      permission: "view_approval",
      label: "Approval",
      component: (
        <Approval
          weekStart={weekStartKey}
          refreshKey={refreshKey}
        />
      ),
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
  const isApprovalTab = availableTabs[value]?.permission === "view_approval";

  useEffect(() => {
    if (availableTabs.length && value >= availableTabs.length) {
      setValue(0);
    }
  }, [availableTabs.length, value]);

  useEffect(() => {
    setSelectedAssignedTaskIds([]);
  }, [weekStartKey]);

  return (
    <Box sx={pageFill}>
      <Box
        sx={timesheetPageHeader(isApprovalTab)}
      >
        <Box sx={pageHeaderContent}>
          <Typography variant="h5" sx={pageTitle}>Time Sheet</Typography>
          <Typography variant="body2" sx={pageSubtitle}>
            Submit and approve time sheets for your team.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={timesheetHeaderActions}
        >
          <Paper
            elevation={0}
            sx={weekSelectorPanel(isApprovalTab)}
          >
            <IconButton
              aria-label="Previous week"
              onClick={previousWeek}
              size="small"
              sx={squareIconButton}
            >
              <ChevronLeftOutlinedIcon />
            </IconButton>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.25, sm: 1 }}
              alignItems="center"
              justifyContent="center"
              sx={centeredTextGroup}
            >
              <Chip
                icon={<CalendarMonthOutlinedIcon />}
                label={`Week ${weekNumber}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={compactWeekChip}
              />
              <Typography
                variant="body2"
                fontWeight={700}
                sx={nowrapResponsiveText}
              >
                {weekStart.format("DD-MMM-YYYY")} - {weekEnd.format("DD-MMM-YYYY")}
              </Typography>
            </Stack>

            <IconButton
              aria-label="Next week"
              onClick={nextWeek}
              size="small"
              sx={squareIconButton}
            >
              <ChevronRightOutlinedIcon />
            </IconButton>
          </Paper>

          {!isApprovalTab && (
            <>
              <Badge
                badgeContent={selectedAssignedTaskIds.length}
                color="secondary"
                invisible={selectedAssignedTaskIds.length === 0}
                sx={headerActionBadge}
              >
                <Button
                  variant="contained"
                  onClick={handleClick}
                  endIcon={<KeyboardArrowDownOutlinedIcon />}
                  sx={compactHeaderButton}
                >
                  Actions
                </Button>
              </Badge>

              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    sx: actionMenuPaper,
                  },
                }}
              >
                <Box sx={actionMenuSection}>Add work</Box>
                <MenuItem onClick={openQuotationModal} sx={actionMenuItem("primary")}>
                  <ListItemIcon>
                    <WorkOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Assign Jobs From ERP"
                    secondary="Import approved job records into this week."
                  />
                </MenuItem>

                <MenuItem onClick={openUndefinedModal} sx={actionMenuItem("info")}>
                  <ListItemIcon>
                    <HelpOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Create Undefined Jobs"
                    secondary="Add a temporary job when ERP details are unavailable."
                  />
                </MenuItem>

                <MenuItem onClick={openAssignTasksModal} sx={actionMenuItem("success")}>
                  <ListItemIcon>
                    <AssignmentOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Import Undefined Tasks To Job"
                    secondary="Move temporary tasks under mapped job cost masters."
                  />
                </MenuItem>

                <MenuItem onClick={openTicketsModal} sx={actionMenuItem("secondary")}>
                  <ListItemIcon>
                    <ConfirmationNumberOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Assigned Tickets"
                    secondary="Bring ticket work into the current timesheet."
                  />
                </MenuItem>

                <Divider sx={compactDivider} />
                <Box sx={actionMenuSection}>Week controls</Box>

                <MenuItem onClick={openUnlockDialog} sx={actionMenuItem("warning")}>
                  <ListItemIcon>
                    <LockOpenOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Unlock Time Sheet Request"
                    secondary="Ask for edit access after submission is locked."
                  />
                </MenuItem>

                <MenuItem onClick={openExtendDialog} sx={actionMenuItem("info")}>
                  <ListItemIcon>
                    <UpdateOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Extend Task To Next Week"
                    secondary={
                      selectedAssignedTaskIds.length
                        ? `${selectedAssignedTaskIds.length} selected task(s) will move forward.`
                        : "Select tasks in the table before extending."
                    }
                  />
                </MenuItem>

                <MenuItem onClick={openRemoveDialog} sx={actionMenuItem("error")}>
                  <ListItemIcon>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Remove Task / Project"
                    secondary={
                      selectedAssignedTaskIds.length
                        ? `${selectedAssignedTaskIds.length} selected task(s) may be removed.`
                        : "Select removable tasks first."
                    }
                  />
                </MenuItem>

                <Divider sx={compactDivider} />
                <Box sx={actionMenuSection}>Finalize</Box>
                <MenuItem onClick={openTimeSheetPreview} sx={actionMenuItem("success")}>
                  <ListItemIcon>
                    <SendOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Preview / Submit"
                    secondary="Check totals and send this week for approval."
                  />
                </MenuItem>
              </Menu>
            </>
          )}

        </Stack>
      </Box>

      <Box sx={tabsContainer}>
        {availableTabs.length > 0 && (
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
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

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {availableTabs.map((tab, index) => (
          <CustomTabPanel key={tab.permission} value={value} index={index}>
            {tab.component}
          </CustomTabPanel>
        ))}
      </Box>


      <ConfirmDialog
        open={extendDialogOpen}
        title="Extend Tasks"
        description={`Update ${selectedAssignedTaskIds.length} selected assigned task(s) end date to ${nextWeekEnd.format("DD-MMM-YYYY")}?`}
        confirmLabel={extendingTasks ? "Extending..." : "Extend"}
        confirmDisabled={extendingTasks || selectedAssignedTaskIds.length === 0}
        titleIcon={<UpdateOutlinedIcon fontSize="small" />}
        confirmIcon={<UpdateOutlinedIcon fontSize="small" />}
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
        titleIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
        confirmIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
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

      <CreateUndefinedModal
        open={undefinedModalOpen}
        onClose={() => setUndefinedModalOpen(false)}
        submitting={creatingUndefinedJob}
        onSubmit={createUndefinedJob}
      />
      <TimeSheetTicketsModal
        open={ticketsModalOpen}
        tickets={ticketOptions}
        loading={loadingTicketOptions}
        submitting={assigningTickets}
        onClose={() => setTicketsModalOpen(false)}
        onSubmit={assignSelectedTickets}
      />
      <AssignCostMasterTasksModal
        open={assignTasksModalOpen}
        projects={assignedWeekProjects}
        phases={phaseMappings}
        costCategories={costCategories}
        costMasters={costMasters}
        loading={loadingAssignTaskOptions}
        errorMessage={assignTaskOptionsError}
        submitting={assigningCostMasterTasks}
        onClose={() => setAssignTasksModalOpen(false)}
        onSubmit={assignCostMasterTasks}
      />
    </Box>
  );
}

export default TimeSheet;
