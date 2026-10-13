import React, { useEffect, useMemo, useState } from "react";
import { Box, Skeleton, Stack, useMediaQuery, useTheme } from "@mui/material";
import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { showNotification } from "../../api/notificationService";
import MobileDayEntry from "../../components/timesheet/MobileDayEntry";
import { formatHoursMinutes, hoursInputError, secondsToDecimalHours } from "../../utils/hoursMinutes";
import type { SubmissionProject, UsersData } from "../../types/dataTypes";
import SubmissionGrid, { type BudgetOwnerOption } from "./submission/SubmissionGrid";
import SubmissionActionBar from "./submission/SubmissionActionBar";
import {
  applySavedDraft,
  budgetOwnerMessage,
  buildSubmitEntries,
  canEditDate as canEditDateFor,
  createWeekDays,
  dailyLimitMessage,
  findTask,
  findTasksMissingBudgetOwner,
  formatLocalDate,
  FULL_DAY_LABELS,
  getEditableDates,
  getEstimatedWeekHours,
  getExceededDays,
  getTaskTotal,
  getWeekDayTotals,
  getWeekLockState,
  getWeeklyHoursValidation,
  isEntryChange,
  isOthersProject,
  setTaskBudgetOwner,
  setTaskEntry,
  type BudgetOwnerValidation,
  type DailyHoursValidation,
  type SaveDraftResponse,
  type TaskRef,
  type TimesheetSubmitEntry,
  type WeeklyHoursValidation,
  type WeeklyTimesheetLog,
} from "./submission/timesheetMath";

// Types the Time Sheet page consumes.
export type {
  BudgetOwnerValidation,
  DailyHoursValidation,
  TimesheetSubmitEntry,
  WeeklyHoursValidation,
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
  onUnsavedHourChangesChange?: (hasChanges: boolean) => void;
  weeklyStatus: WeeklyTimesheetLog;
  /** True while the selected week's status is loading. */
  weeklyStatusLoading?: boolean;
};

const toggleId = (list: number[], id: number) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

/**
 * Time Sheet submission tab: owns the week's data, the unsaved draft and the
 * save/budget-owner actions. Layout lives in SubmissionGrid (desktop),
 * MobileDayEntry (phones) and SubmissionActionBar; maths in timesheetMath.
 */
function Submission({
  weekStart,
  refreshKey,
  selectedAssignedTaskIds,
  onAssignedTaskSelectionChange,
  onPreviewDaysChange,
  onSubmitEntriesChange,
  onBudgetOwnerValidationChange,
  onDailyHoursValidationChange,
  onWeeklyHoursValidationChange,
  onUnsavedHourChangesChange,
  weeklyStatus,
  weeklyStatusLoading = false,
}: SubmissionProps) {
  const theme = useTheme();
  // Below `sm` the 1,180px grid is replaced by a one-day-at-a-time editor.
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const weekDays = useMemo(() => createWeekDays(weekStart), [weekStart]);

  // ---- Data ------------------------------------------------------------------
  // The sidebar prefetches this response before navigation. Keep that weekly
  // response fresh briefly so mounting this page does not immediately issue a
  // second identical request after the prefetch has finished. Timesheet saves
  // still invalidate this key and refresh the mounted query right away.
  const entriesQuery = useApiQuery<SubmissionProject[]>("/timesheet-entries/", {
    week_start: weekStart,
  }, {
    staleTime: 30_000,
    refetchOnMount: false,
  });
  const loading = entriesQuery.isPending;
  const serverProjects = useMemo(
    () => asArray<SubmissionProject>(entriesQuery.data),
    [entriesQuery.data],
  );

  // Shared, cached user list; only active users can be budget owners.
  const usersQuery = useApiQuery<UsersData[]>("/users/");
  const budgetOwnerOptions = useMemo<BudgetOwnerOption[]>(
    () =>
      asArray<UsersData>(usersQuery.data)
        .filter((user) => user.is_active)
        .map((owner) => ({
          value: owner.username,
          label:
            [owner.first_name, owner.last_name].filter(Boolean).join(" ").trim() ||
            owner.username,
        })),
    [usersQuery.data],
  );

  // ---- Draft -----------------------------------------------------------------
  // Draft identity: local edits belong to one week and one parent refresh
  // generation (the parent bumps `refreshKey` after submit/assign/remove,
  // which previously discarded local edits by refetching).
  const draftKey = `${weekStart}:${refreshKey}`;
  // Server rows come from the cache; edits live in a draft layered on top.
  // The draft is kept while hours are unsaved; otherwise a fresh server
  // response (e.g. after Save Draft or a budget-owner change) replaces it.
  const [draft, setDraft] = useState<{
    key: string;
    basis: unknown;
    projects: SubmissionProject[];
  } | null>(null);
  const [unsavedKey, setUnsavedKey] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const hasUnsavedHourChanges = unsavedKey === draftKey;
  const setHasUnsavedHourChanges = (value: boolean) => setUnsavedKey(value ? draftKey : null);

  const isCurrentDraft = (candidate: typeof draft): candidate is NonNullable<typeof draft> =>
    Boolean(
      candidate &&
        candidate.key === draftKey &&
        (hasUnsavedHourChanges || candidate.basis === entriesQuery.data),
    );
  const projects = isCurrentDraft(draft) ? draft.projects : serverProjects;
  const setProjects = (update: (current: SubmissionProject[]) => SubmissionProject[]) =>
    setDraft((previous) => ({
      key: draftKey,
      basis: entriesQuery.data,
      projects: update(isCurrentDraft(previous) ? previous.projects : serverProjects),
    }));

  // ---- View state --------------------------------------------------------------
  const [expandedProjects, setExpandedProjects] = useState<number[]>([1]);
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([1]);
  const [savingDraft, setSavingDraft] = useState(false);
  // Day picked on the phone layout, remembered per week; defaults to today.
  const [pickedDay, setPickedDay] = useState<{ week: string; index: number } | null>(null);
  const todayIndex = weekDays.findIndex((day) => day.date === formatLocalDate(new Date()));
  const activeDayIndex = pickedDay?.week === weekStart ? pickedDay.index : Math.max(todayIndex, 0);

  // ---- Derived values ------------------------------------------------------------
  const weekDayTotals = useMemo(() => getWeekDayTotals(projects, weekDays), [projects, weekDays]);
  const weekTotal = useMemo(
    () => weekDayTotals.reduce((total, day) => total + day.hours, 0),
    [weekDayTotals],
  );
  const estimatedWeekHours = useMemo(() => getEstimatedWeekHours(weekStart), [weekStart]);
  const weeklyHoursValidation = useMemo(
    () => getWeeklyHoursValidation(weekTotal, estimatedWeekHours),
    [estimatedWeekHours, weekTotal],
  );
  const dailyHoursValidation = useMemo(
    () => getExceededDays(weekDayTotals, weekDays),
    [weekDayTotals, weekDays],
  );
  const submitEntries = useMemo(() => buildSubmitEntries(projects, weekDays), [projects, weekDays]);
  const missingBudgetOwnerTaskNames = useMemo(
    () => findTasksMissingBudgetOwner(projects, weekDays),
    [projects, weekDays],
  );

  const lock = getWeekLockState(weeklyStatus);
  const editableDates = getEditableDates(new Date());
  const canEditDate = (date: string, project: SubmissionProject) =>
    canEditDateFor(date, project, lock, editableDates);

  // ---- Report state to the Time Sheet page ---------------------------------------
  useEffect(() => {
    onUnsavedHourChangesChange?.(hasUnsavedHourChanges);
  }, [hasUnsavedHourChanges, onUnsavedHourChangesChange]);

  useEffect(() => {
    onPreviewDaysChange?.(
      weekDays.map((_, index) => ({
        day: FULL_DAY_LABELS[index],
        hours: secondsToDecimalHours(weekDayTotals[index]?.hours ?? 0),
      })),
    );
  }, [onPreviewDaysChange, weekDayTotals, weekDays]);

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

  // ---- Actions --------------------------------------------------------------------
  const updateHours = (ref: TaskRef, date: string, rawValue: string) => {
    const value = rawValue.replace(":", ".");
    // Same rules HoursInput explains to the user (h.mm, minutes 00–59, ≤ 14 h).
    if (hoursInputError(value)) return;
    const stored = value === "" ? 0 : value;
    if (isEntryChange(projects, ref, date, stored)) setHasUnsavedHourChanges(true);
    setProjects((current) => setTaskEntry(current, ref, date, stored));
  };

  const updateBudgetOwner = async (ref: TaskRef, owner: string) => {
    if (lock.isLockedSubmitted) {
      showNotification({
        type: "warning",
        message: "Budget owner cannot be changed after submission.",
      });
      return;
    }

    const previousOwner = findTask(projects, ref)?.assign_by ?? null;
    setProjects((current) => setTaskBudgetOwner(current, ref, owner));

    try {
      await api.patch(`/assigned-tasks/${ref.taskId}/`, { assign_by: owner || null });
      showNotification({ type: "success", message: "Budget owner updated." });
    } catch {
      setProjects((current) => setTaskBudgetOwner(current, ref, previousOwner));
    }
  };

  const saveDraft = async () => {
    if (dailyHoursValidation.exceededDays.length > 0) {
      showNotification({
        type: "error",
        message: dailyLimitMessage(dailyHoursValidation.exceededDays, "saving draft"),
      });
      return;
    }
    if (missingBudgetOwnerTaskNames.length > 0) {
      showNotification({
        type: "error",
        message: budgetOwnerMessage(missingBudgetOwnerTaskNames, "saving draft"),
      });
      return;
    }

    setSavingDraft(true);
    try {
      const response = await api.post<SaveDraftResponse>("/timesheet-entries/save-draft/", {
        entries: submitEntries,
      });
      setProjects((current) => applySavedDraft(current, response.data ?? {}));
      showNotification({ type: "success", message: "Timesheet draft saved successfully." });
      setLastSavedAt(new Date());
      setHasUnsavedHourChanges(false);
    } catch {
      // Global axios error handling shows API failures.
    } finally {
      setSavingDraft(false);
    }
  };

  // ---- Render -----------------------------------------------------------------------
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
      {loading && projects.length === 0 ? (
        <Stack spacing={1} role="status" aria-label="Loading timesheet" sx={{ flex: 1, p: 1 }}>
          <Skeleton variant="rounded" height={44} />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={isPhone ? 96 : 40} />
          ))}
        </Stack>
      ) : isPhone ? (
        <MobileDayEntry
          projects={projects}
          weekDays={weekDays}
          dayTotals={weekDayTotals.map((day) => day.hours)}
          weekTotalLabel={formatHoursMinutes(weekTotal)}
          activeIndex={activeDayIndex}
          onActiveIndexChange={(index) => setPickedDay({ week: weekStart, index })}
          formatHours={formatHoursMinutes}
          taskWeekTotal={(task) => getTaskTotal(task, weekDays)}
          canEditDate={canEditDate}
          isOthersProject={isOthersProject}
          budgetOwnerOptions={budgetOwnerOptions}
          budgetOwnerDisabled={lock.budgetOwnerDisabled}
          onHoursChange={(projectId, milestoneId, taskId, date, value) =>
            updateHours({ projectId, milestoneId, taskId }, date, value)
          }
          onBudgetOwnerChange={(projectId, milestoneId, taskId, owner) =>
            void updateBudgetOwner({ projectId, milestoneId, taskId }, owner)
          }
          selectedAssignedTaskIds={selectedAssignedTaskIds}
          onAssignedTaskSelectionChange={onAssignedTaskSelectionChange}
        />
      ) : (
        <SubmissionGrid
          projects={projects}
          weekDays={weekDays}
          weekDayTotals={weekDayTotals}
          weekTotal={weekTotal}
          expandedProjects={expandedProjects}
          expandedMilestones={expandedMilestones}
          onToggleProject={(id) => setExpandedProjects((current) => toggleId(current, id))}
          onToggleMilestone={(id) => setExpandedMilestones((current) => toggleId(current, id))}
          selectedAssignedTaskIds={selectedAssignedTaskIds}
          onAssignedTaskSelectionChange={onAssignedTaskSelectionChange}
          canEditDate={canEditDate}
          budgetOwnerOptions={budgetOwnerOptions}
          budgetOwnerDisabled={lock.budgetOwnerDisabled}
          onHoursChange={updateHours}
          onBudgetOwnerChange={(ref, owner) => void updateBudgetOwner(ref, owner)}
        />
      )}

      <SubmissionActionBar
        estimatedWeekHours={estimatedWeekHours}
        weekTotal={weekTotal}
        targetMet={weeklyHoursValidation.isSatisfied}
        hasUnsavedChanges={hasUnsavedHourChanges}
        lastSavedAt={lastSavedAt}
        weeklyStatus={weeklyStatus}
        weeklyStatusLoading={weeklyStatusLoading}
        isRejected={lock.isRejected}
        isSubmitted={lock.isSubmitted}
        saveDisabled={savingDraft || lock.isLockedSubmitted || weeklyStatusLoading}
        saving={savingDraft}
        onSave={() => void saveDraft()}
      />
    </Box>
  );
}

export default React.memo(Submission);
