import { useState } from "react";
import { Box, CircularProgress, IconButton, ToggleButton, Tooltip, Typography } from "@mui/material";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import api from "@/api/axios";
import { showNotification } from "@/api/notificationService";
import type { SelfTicketData, SelfTicketOccurrence } from "@/types/dataTypes";
import { formatDate, formatDueDate, formatOverdueLabel } from "@/components/common/formatDate";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { DetailPanel } from "@/components/common/DetailDialogParts";
import PageNotice from "@/components/common/PageNotice";
import AnimatedToggleGroup from "@/animations/AnimatedToggleGroup";
import {
  occurrenceActionsSx,
  occurrenceDateTileSx,
  occurrenceDayNameSx,
  occurrenceEmptySx,
  occurrenceFooterNoteSx,
  occurrenceGridSx,
  occurrenceMonthHeadingSx,
  occurrenceProgressSx,
  occurrenceSkipButtonSx,
  occurrenceStatusLineSx,
  occurrenceSummaryCardSx,
  occurrenceSummaryCountSx,
  occurrenceTileSx,
  type OccurrenceTone,
} from "@/styles/detailDialog";

type PendingChange = { item: SelfTicketOccurrence; status: "closed" | "cancelled" };

const toDate = (value: string) => new Date(`${value}T00:00:00`);
const monthKey = (value: string) => value.slice(0, 7);
const monthHeading = (value: string) =>
  toDate(value).toLocaleDateString(undefined, { month: "long", year: "numeric" });

/**
 * A recurring task's occurrences as a side panel beside Status & comments:
 * a progress summary, an All / Open switch, then the occurrences grouped by
 * month as date tiles. A due occurrence (today or earlier) can be completed
 * or skipped, after a confirm like every other Do List action.
 */
export default function OccurrenceList({ task, canComplete, onChange }: {
  task: SelfTicketData;
  canComplete: boolean;
  onChange: (task: SelfTicketData) => void;
}) {
  const [saving, setSaving] = useState<boolean>(false);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [filter, setFilter] = useState<"all" | "open">("all");

  const occurrences = task.occurrences ?? [];
  const open = occurrences.filter((item) => item.current_status === "open");
  const doneCount = occurrences.length - open.length;
  const progress = occurrences.length ? Math.round((doneCount / occurrences.length) * 100) : 0;
  const visible = filter === "all" ? occurrences : open;
  // The first open occurrence that isn't overdue is "next".
  const next = open.find((item) => formatDueDate(item.scheduled_date).tone !== "overdue");
  const overdueCount = open.filter((item) => formatDueDate(item.scheduled_date).tone === "overdue").length;

  const months = [...new Set(occurrences.map((item) => monthKey(item.scheduled_date)))];
  const spanText =
    months.length === 1
      ? `in ${toDate(occurrences[0].scheduled_date).toLocaleDateString(undefined, { month: "long" })}`
      : `across ${months.length} months`;

  const groups = visible.reduce<{ key: string; items: SelfTicketOccurrence[] }[]>((list, item) => {
    const key = monthKey(item.scheduled_date);
    const group = list.find((entry) => entry.key === key);
    if (group) group.items.push(item);
    else list.push({ key, items: [item] });
    return list;
  }, []);

  // Due: scheduled today or earlier. Only a due occurrence can be completed;
  // any open one, future dates included, can be skipped.
  const isDue = (item: SelfTicketOccurrence) => {
    const tone = formatDueDate(item.scheduled_date).tone;
    return tone === "overdue" || tone === "today";
  };

  const toneOf = (item: SelfTicketOccurrence): OccurrenceTone => {
    if (item.current_status !== "open") return "done";
    if (formatDueDate(item.scheduled_date).tone === "overdue") return "overdue";
    return item.id === next?.id ? "next" : "open";
  };

  const statusLine = (item: SelfTicketOccurrence, tone: OccurrenceTone) => {
    if (item.current_status === "closed") return { icon: <CheckOutlinedIcon />, text: "Completed", tone: "success" as const };
    if (item.current_status === "cancelled") return { icon: <BlockOutlinedIcon />, text: "Skipped", tone: "muted" as const };
    if (tone === "overdue") return { icon: null, text: formatOverdueLabel(item.scheduled_date) ?? "Overdue", tone: "error" as const };
    if (formatDueDate(item.scheduled_date).tone === "today") return { icon: null, text: "Due today", tone: "warning" as const };
    if (tone === "next") return { icon: null, text: "Next up", tone: "primary" as const };
    return { icon: null, text: "Scheduled", tone: "muted" as const };
  };

  const confirmChange = async () => {
    if (!pending) return;
    setSaving(true);
    try {
      const response = await api.post<SelfTicketOccurrence>(`/self-tickets/${task.id}/occurrence-status/`, {
        occurrence_id: pending.item.id,
        current_status: pending.status,
      });
      const updated = occurrences.map((row) => (row.id === pending.item.id ? response.data : row));
      onChange({
        ...task,
        occurrences: updated,
        alarm: updated.some((row) => row.alarm && row.current_status === "open"),
      });
      showNotification({
        type: "success",
        message: `Occurrence on ${formatDate(pending.item.scheduled_date)} ${
          pending.status === "closed" ? "completed" : "skipped"
        }.`,
      });
      setPending(null);
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DetailPanel
        icon={<EventRepeatOutlinedIcon />}
        title="Occurrences"
        badge={occurrences.length}
        intro={
          <>
            {/* Progress at a glance: share done, what the schedule covers, done / open. */}
            <Box sx={occurrenceSummaryCardSx}>
              <Box sx={occurrenceProgressSx}>
                <CircularProgress variant="determinate" value={100} size={52} thickness={4} />
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={52}
                  thickness={4}
                  aria-label={`${progress}% of occurrences done`}
                />
                <Typography component="span">{progress}%</Typography>
              </Box>
              <Box minWidth={0} flex={1}>
                <Typography fontWeight={600} fontSize={14} noWrap>
                  Recurring schedule
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="p">
                  {occurrences.length} occurrence{occurrences.length === 1 ? "" : "s"} {occurrences.length ? spanText : ""}
                </Typography>
              </Box>
              <Box sx={occurrenceSummaryCountSx("success")}>
                <span>{doneCount}</span>
                <span>Done</span>
              </Box>
              <Box sx={occurrenceSummaryCountSx("default")}>
                <span>{open.length}</span>
                <span>Open</span>
              </Box>
            </Box>
            {task.is_active === false && (
              <PageNotice sx={{ mt: 0 }}>Schedule paused: reminders are off.</PageNotice>
            )}
            <AnimatedToggleGroup
              exclusive
              fullWidth
              value={filter}
              onChange={(_, value) => value && setFilter(value)}
              aria-label="Occurrences to show"
            >
              <ToggleButton value="all">All occurrences ({occurrences.length})</ToggleButton>
              <ToggleButton value="open">Open ({open.length})</ToggleButton>
            </AnimatedToggleGroup>
          </>
        }
        footer={
          <Box sx={occurrenceFooterNoteSx}>
            <InfoOutlinedIcon aria-hidden="true" />
            <Typography component="span" variant="caption">
              {overdueCount > 0 ? (
                <>
                  <strong>{overdueCount}</strong> overdue occurrence{overdueCount === 1 ? " needs" : "s need"} attention.
                </>
              ) : next ? (
                <>
                  <strong>{formatDate(next.scheduled_date)}</strong> is the next open occurrence.
                </>
              ) : (
                "No open occurrences left in this schedule."
              )}
            </Typography>
          </Box>
        }
      >
        {groups.length ? (
          groups.map((group) => (
            <Box key={group.key} component="section" aria-label={monthHeading(group.items[0].scheduled_date)}>
              <Typography component="h4" sx={occurrenceMonthHeadingSx}>
                {monthHeading(group.items[0].scheduled_date)}
              </Typography>
              <Box sx={occurrenceGridSx}>
                {group.items.map((item) => {
                  const tone = toneOf(item);
                  const date = toDate(item.scheduled_date);
                  const status = statusLine(item, tone);
                  const actionable = canComplete && item.current_status === "open";
                  const completable = actionable && isDue(item);
                  return (
                    <Box key={item.id} sx={occurrenceTileSx(tone)}>
                      <Box sx={occurrenceDateTileSx(tone)} aria-hidden="true">
                        <span>{date.toLocaleDateString(undefined, { month: "short" })}</span>
                        <span>{String(date.getDate()).padStart(2, "0")}</span>
                      </Box>
                      <Box minWidth={0}>
                        <Typography sx={occurrenceDayNameSx} noWrap>
                          {date.toLocaleDateString(undefined, { weekday: "long" })}
                        </Typography>
                        <Typography component="span" sx={occurrenceStatusLineSx(status.tone)}>
                          {status.icon ?? <Box component="span" className="dot" />}
                          {status.text}
                        </Typography>
                      </Box>
                      {/* Complete once due; Skip at any time while open. */}
                      {actionable && (
                        <Box sx={occurrenceActionsSx}>
                          {completable && (
                            <Tooltip title="Mark completed">
                              <IconButton
                                size="small"
                                color="success"
                                disabled={saving}
                                aria-label={`Complete the ${formatDate(item.scheduled_date)} occurrence`}
                                onClick={() => setPending({ item, status: "closed" })}
                              >
                                <TaskAltOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Skip this occurrence">
                            <IconButton
                              size="small"
                              disabled={saving}
                              aria-label={`Skip the ${formatDate(item.scheduled_date)} occurrence`}
                              onClick={() => setPending({ item, status: "cancelled" })}
                              sx={occurrenceSkipButtonSx}
                            >
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))
        ) : (
          <Typography sx={occurrenceEmptySx}>
            {occurrences.length ? "All caught up: no open occurrences." : "No occurrences scheduled yet."}
          </Typography>
        )}
      </DetailPanel>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.status === "closed" ? "Complete Occurrence" : "Skip Occurrence"}
        description={
          pending
            ? pending.status === "closed"
              ? `Mark the ${formatDate(pending.item.scheduled_date)} occurrence as completed? Later occurrences stay open.`
              : `Skip the ${formatDate(pending.item.scheduled_date)} occurrence? The rest of the schedule continues.`
            : ""
        }
        confirmLabel={saving ? "Saving..." : pending?.status === "closed" ? "Complete" : "Skip occurrence"}
        confirmColor={pending?.status === "closed" ? "success" : "error"}
        confirmIcon={pending?.status === "closed" ? <TaskAltOutlinedIcon /> : <CancelOutlinedIcon />}
        confirmDisabled={saving}
        onClose={() => !saving && setPending(null)}
        onConfirm={() => void confirmChange()}
      />
    </>
  );
}
