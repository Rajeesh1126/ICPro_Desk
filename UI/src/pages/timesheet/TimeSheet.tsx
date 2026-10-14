import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import api from "../../api/axios";
import { useApiQuery } from "../../api/useApiQuery";
import { showNotification } from "../../api/notificationService";
import TimeSheetPreviewModal, { type TimeSheetDay } from "../../components/timesheet/TimeSheetPreviewModal";
import {
  pageFill,
  pageHeaderContent,
  pageSubtitle,
  pageTitle,
  tabPanelContent,
  tabs,
  tabsContainer,
  timesheetHeaderActions,
  timesheetPageHeader,
} from "../../styles/common";
import Approval from "./Approval";
import Submission, {
  type BudgetOwnerValidation,
  type DailyHoursValidation,
  type TimesheetSubmitEntry,
} from "./Submission";
import type { WeeklyTimesheetLog } from "./submission/timesheetMath";
import {
  getPreviewBlocker,
  getSubmitBlocker,
  getTimesheetActionState,
  LOCKED_ACTION_MESSAGE,
} from "./sheet/timesheetStatus";
import { useUnsavedNavigationGuard } from "./sheet/useUnsavedNavigationGuard";
import WeekSelector from "./sheet/WeekSelector";
import TimesheetActionsMenu, { type AddWorkKind, type WeekTaskKind } from "./sheet/TimesheetActionsMenu";
import AddWorkDialogs from "./sheet/AddWorkDialogs";
import WeekTaskDialogs from "./sheet/WeekTaskDialogs";
import { getStoredPermissions } from "../../utils/permissions";

dayjs.extend(isoWeek);

function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`timesheet-tabpanel-${index}`}
      aria-labelledby={`timesheet-tab-${index}`}
      style={{ height: value === index ? "100%" : undefined, minHeight: 0 }}
    >
      {value === index && <Box sx={tabPanelContent}>{children}</Box>}
    </div>
  );
}

const showLocked = (message = LOCKED_ACTION_MESSAGE) =>
  showNotification({ type: "warning", message });

/**
 * Time Sheet page: week selection, tabs (Submission / Approval), the Actions
 * menu and submit. Grid, dialogs and rules live in ./submission and ./sheet.
 */
function TimeSheet() {
  const permissions = getStoredPermissions();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((current) => current + 1);

  // ---- Week ---------------------------------------------------------------------
  const weekStart = selectedWeek.startOf("isoWeek");
  const weekEnd = weekStart.add(6, "day");
  const weekStartKey = weekStart.format("YYYY-MM-DD");
  const weekNumber = weekStart.isoWeek();

  // Week status is cached per week and refreshed after any successful save,
  // submit or unlock request (see invalidateAfterMutation).
  const weeklyStatusQuery = useApiQuery<Partial<WeeklyTimesheetLog>>("/timesheet-week-logs/current/", {
    week_start: weekStartKey,
  });
  const weeklyStatus = useMemo<WeeklyTimesheetLog>(
    () => ({
      timesheet_status: weeklyStatusQuery.data?.timesheet_status || "Not Submitted",
      submission_status: Boolean(weeklyStatusQuery.data?.submission_status),
    }),
    [weeklyStatusQuery.data],
  );
  const weeklyStatusLoading = weeklyStatusQuery.isPending;
  const { actionsDisabled, previewSubmitDisabled, unlockRequestDisabled } = getTimesheetActionState(
    weeklyStatus,
    weeklyStatusLoading,
  );

  // ---- State reported by the Submission tab --------------------------------------
  const [previewDays, setPreviewDays] = useState<TimeSheetDay[]>([]);
  const [submitEntries, setSubmitEntries] = useState<TimesheetSubmitEntry[]>([]);
  const [budgetOwnerValidation, setBudgetOwnerValidation] = useState<BudgetOwnerValidation>({
    missingCount: 0,
    missingTaskNames: [],
  });
  const [dailyHoursValidation, setDailyHoursValidation] = useState<DailyHoursValidation>({
    exceededDays: [],
    missingRequiredDays: [],
  });
  const [hasUnsavedHourChanges, setHasUnsavedHourChanges] = useState(false);
  const [selectedAssignedTaskIds, setSelectedAssignedTaskIds] = useState<number[]>([]);

  const toggleAssignedTaskSelection = useCallback((assignedTaskId: number, checked: boolean) => {
    setSelectedAssignedTaskIds((current) =>
      checked
        ? current.includes(assignedTaskId)
          ? current
          : [...current, assignedTaskId]
        : current.filter((id) => id !== assignedTaskId),
    );
  }, []);

  // A new week starts with nothing selected.
  useEffect(() => {
    setSelectedAssignedTaskIds([]);
  }, [weekStartKey]);

  // ---- Leaving with unsaved hours -------------------------------------------------
  const guard = useUnsavedNavigationGuard(hasUnsavedHourChanges, () => setHasUnsavedHourChanges(false));
  const previousWeek = () => guard.requestNavigation(() => setSelectedWeek((week) => week.subtract(1, "week")));
  const nextWeek = () => guard.requestNavigation(() => setSelectedWeek((week) => week.add(1, "week")));

  // ---- Dialogs ----------------------------------------------------------------------
  const [addWork, setAddWork] = useState<AddWorkKind | null>(null);
  const [weekTask, setWeekTask] = useState<WeekTaskKind | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openAddWork = (kind: AddWorkKind) => (actionsDisabled ? showLocked() : setAddWork(kind));
  const openWeekTask = (kind: WeekTaskKind) => {
    if (kind === "remove" && actionsDisabled) return showLocked();
    if (kind === "unlock" && unlockRequestDisabled) {
      return showLocked("Unlock request is not available for this time sheet status.");
    }
    setWeekTask(kind);
  };

  const openPreview = () => {
    if (previewSubmitDisabled) {
      return showLocked("This time sheet cannot be previewed or submitted again.");
    }
    const blocker = getPreviewBlocker(dailyHoursValidation);
    if (blocker) {
      return showNotification({ type: "error", message: blocker });
    }
    setPreviewOpen(true);
  };

  const submitTimeSheet = async (comments: string) => {
    if (previewSubmitDisabled) {
      showLocked("This time sheet cannot be submitted again.");
      setPreviewOpen(false);
      return;
    }
    const blocker = getSubmitBlocker({
      daily: dailyHoursValidation,
      budgetOwner: budgetOwnerValidation,
    });
    if (blocker) {
      showNotification({ type: "error", message: blocker });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/timesheet-entries/submit/", {
        week_start: weekStartKey,
        comments,
        entries: submitEntries,
      });
      showNotification({ type: "success", message: "Time sheet submitted successfully." });
      setPreviewOpen(false);
      refresh();
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Tabs ---------------------------------------------------------------------------
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
          onPreviewDaysChange={setPreviewDays}
          onSubmitEntriesChange={setSubmitEntries}
          onBudgetOwnerValidationChange={setBudgetOwnerValidation}
          onDailyHoursValidationChange={setDailyHoursValidation}
          onUnsavedHourChangesChange={setHasUnsavedHourChanges}
          weeklyStatus={weeklyStatus}
          weeklyStatusLoading={weeklyStatusLoading}
        />
      ),
    },
    {
      // permission: "view_approval",
      label: "Approval",
      component: <Approval weekStart={weekStartKey} />,
    },
  ];
  // Approval is available to every user who can open this page. Submission is
  // the only tab controlled by a dedicated permission.
  const availableTabs = tabConfig.filter(
    (tab) => tab.permission !== "view_submission" || permissions.has("view_submission"),
  );
  const isApprovalTab = availableTabs[tabIndex]?.permission === "view_approval";

  useEffect(() => {
    if (availableTabs.length && tabIndex >= availableTabs.length) setTabIndex(0);
  }, [availableTabs.length, tabIndex]);

  return (
    <Box sx={pageFill}>
      <Box sx={timesheetPageHeader(isApprovalTab)}>
        <Box sx={pageHeaderContent}>
          <Typography variant="h5" component="h1" sx={pageTitle}>
            Timesheet
          </Typography>
          <Typography variant="body2" sx={pageSubtitle}>
            Submit and approve timesheets for your team.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={timesheetHeaderActions}>
          <WeekSelector
            weekNumber={weekNumber}
            weekStart={weekStart.toDate()}
            weekEnd={weekEnd.toDate()}
            compact={isApprovalTab}
            onPrevious={previousWeek}
            onNext={nextWeek}
          />
          {!isApprovalTab && (
            <TimesheetActionsMenu
              selectedCount={selectedAssignedTaskIds.length}
              actionsDisabled={actionsDisabled}
              unlockDisabled={unlockRequestDisabled}
              previewDisabled={previewSubmitDisabled}
              onAddWork={openAddWork}
              onWeekTask={openWeekTask}
              onPreview={openPreview}
            />
          )}
        </Stack>
      </Box>

      <Box sx={tabsContainer}>
        {availableTabs.length > 1 && (
          <Tabs
            value={tabIndex}
            onChange={(_event, next: number) => guard.requestNavigation(() => setTabIndex(next))}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.permission}
                icon={tab.permission === "view_submission"
                  ? tabIndex === index ? <AssignmentIcon /> : <AssignmentOutlinedIcon />
                  : tabIndex === index ? <FactCheckIcon /> : <FactCheckOutlinedIcon />}
                iconPosition="start"
                label={tab.label}
                id={`timesheet-tab-${index}`}
                aria-controls={`timesheet-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.permission} value={tabIndex} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Box>

      {guard.dialog}

      <AddWorkDialogs
        open={addWork}
        onClose={() => setAddWork(null)}
        weekStartKey={weekStartKey}
        actionsDisabled={actionsDisabled}
        onLocked={showLocked}
        onChanged={refresh}
      />
      <WeekTaskDialogs
        open={weekTask}
        onClose={() => setWeekTask(null)}
        selectedTaskIds={selectedAssignedTaskIds}
        weekStartKey={weekStartKey}
        weekNumber={weekNumber}
        weekStart={weekStart.toDate()}
        weekEnd={weekEnd.toDate()}
        nextWeekEnd={weekEnd.add(1, "week").toDate()}
        actionsDisabled={actionsDisabled}
        unlockDisabled={unlockRequestDisabled}
        onLocked={showLocked}
        onTasksChanged={() => {
          setSelectedAssignedTaskIds([]);
          refresh();
        }}
        onChanged={refresh}
      />
      <TimeSheetPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        days={previewDays}
        submitting={submitting}
        onSubmit={(data) => void submitTimeSheet(data.comments)}
      />
    </Box>
  );
}

export default TimeSheet;
