import {
  Box,
  ButtonBase,
  Checkbox,
  Chip,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { SelfTicketFormData } from "@/types/dataTypes";
import AnimatedToggleGroup from "@/animations/AnimatedToggleGroup";
import { ContentSwap } from "@/animations/MotionPrimitives";
import PageNotice from "@/components/common/PageNotice";
import { formatDate, formatDueDate } from "@/components/common/formatDate";
import { sentenceCase } from "@/components/common/tableCell";
import { ScheduleIcon } from "@/components/selfTickets/ScheduleCell";
import {
  REPEAT_FREQUENCIES,
  SCHEDULE_TYPES,
  WEEKDAYS,
  anchorDayOfMonth,
  anchorWeekday,
  frequencyUnit,
  periodDays,
  scheduleSummary,
  shiftInputDate,
  toInputDate,
  type ScheduleType,
} from "@/components/selfTickets/schedule";
import {
  dateFieldSx,
  formHintTextSx,
  quickDateRowSx,
  scheduleActiveLabelSx,
  scheduleFieldHeadSx,
  scheduleFieldLabelSx,
  scheduleSummaryNoticeSx,
  scheduleTypeCardSx,
  scheduleTypeGroupSx,
} from "@/styles/common";

type Props = {
  value: SelfTicketFormData;
  update: <K extends keyof SelfTicketFormData>(
    key: K,
    value: SelfTicketFormData[K],
  ) => void;
  /** Saved occurrences lock the schedule type (history would be orphaned). */
  hasOccurrences: boolean;
  /** Editing an existing task (shows the pause control for recurring tasks). */
  editing?: boolean;
  /** Earliest date a new task may start or be due on. */
  minDate?: string;
  /** Server-side validation messages, keyed by field. */
  errors?: Partial<Record<keyof SelfTicketFormData, unknown>>;
};

const errorText = (value: unknown) =>
  Array.isArray(value)
    ? value.join(" ")
    : typeof value === "string"
      ? value
      : undefined;

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

/** Quick picks for a one-time target date (days from today). */
const TARGET_PICKS = [
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 },
  { label: "In 2 weeks", days: 14 },
];

/** Quick picks for a period's length (end date counted from the start date). */
const PERIOD_PICKS = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "30 days", days: 30 },
];

const MONTHLY_MODES: {
  value: NonNullable<SelfTicketFormData["monthly_day_mode"]>;
  label: string;
}[] = [
  { value: "first", label: "First day" },
  { value: "specific", label: "Specific day" },
  { value: "last", label: "Last day" },
];

/**
 * Schedule section of the Do List form. The type is picked from three cards;
 * each type then shows only its own fields, with quick picks for common
 * dates and a live summary of what will happen.
 */
export default function ScheduleFields({
  value,
  update,
  hasOccurrences,
  editing,
  minDate,
  errors,
}: Props) {
  const type = value.schedule_type ?? "static";
  const today = toInputDate(new Date());

  const changeType = (next: ScheduleType) => {
    if (next === type) return;
    update("schedule_type", next);
    // Interval reminders don't apply to recurring tasks: remind before each occurrence.
    if (next === "recurring" && value.reminder_mode === "legacy")
      update("reminder_mode", "before_due");
    // A new period starts on the current date field and runs a week by default.
    if (next === "period" && !value.start_date && value.target_date) {
      update("start_date", value.target_date);
      update("target_date", shiftInputDate(value.target_date, 6));
    }
    // Leaving a period: its start date becomes the single / first date again.
    if (type === "period" && value.start_date) {
      update("target_date", value.start_date);
      update("start_date", null);
    }
  };

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Box
          role="radiogroup"
          aria-label="Schedule type"
          sx={scheduleTypeGroupSx}
        >
          {SCHEDULE_TYPES.map((item) => {
            const selected = item.value === type;
            return (
              <ButtonBase
                key={item.value}
                role="radio"
                aria-checked={selected}
                disabled={hasOccurrences && !selected}
                onClick={() => changeType(item.value)}
                sx={scheduleTypeCardSx(selected)}
              >
                <ScheduleIcon type={item.value} />
                <Box minWidth={0}>
                  <Typography component="span">{item.label}</Typography>
                  <Typography component="span">{item.hint}</Typography>
                </Box>
              </ButtonBase>
            );
          })}
        </Box>
        {hasOccurrences && (
          <Typography sx={formHintTextSx} mt={0.75}>
            Occurrences already exist, so the schedule type can't change.
          </Typography>
        )}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ContentSwap swapKey={type}>
          <Grid container spacing={1.5}>
            {type === "static" && (
              <OneTimeFields
                value={value}
                update={update}
                minDate={minDate}
                today={today}
                errors={errors}
              />
            )}
            {type === "period" && (
              <PeriodFields
                value={value}
                update={update}
                minDate={minDate}
                errors={errors}
              />
            )}
            {type === "recurring" && (
              <RecurringFields
                value={value}
                update={update}
                minDate={minDate}
                editing={editing}
                errors={errors}
              />
            )}

            <Grid size={{ xs: 12 }}>
              <PageNotice sx={scheduleSummaryNoticeSx}>
                <Box component="span">{summaryText(value)}</Box>
              </PageNotice>
            </Grid>
          </Grid>
        </ContentSwap>
      </Grid>
    </>
  );
}

/** The live summary under the fields, e.g. "Due Friday, 6 Nov 2026 · in 6 days". */
function summaryText(value: SelfTicketFormData) {
  const type = value.schedule_type ?? "static";
  if (!value.target_date) return "Pick a date to see the schedule.";

  if (type === "static") {
    const due = formatDueDate(value.target_date);
    const weekday = new Date(
      `${value.target_date}T00:00:00`,
    ).toLocaleDateString(undefined, { weekday: "long" });
    return `Due ${weekday}, ${formatDate(value.target_date)}${
      due.label !== formatDate(value.target_date)
        ? ` · ${due.label.toLowerCase()}`
        : ""
    }. One task, completed once.`;
  }
  if (type === "period") {
    const days = periodDays(value.start_date, value.target_date);
    return days
      ? `Runs ${scheduleSummary(value, value.target_date)} (${plural(days, "day")}). Shown on every day of the period; completed once at the end.`
      : "Pick a start date on or before the end date.";
  }
  const weekdays = value.repeat_weekdays?.length
    ? value.repeat_weekdays
    : [anchorWeekday(value.target_date)];
  return `Repeats ${scheduleSummary(
    { ...value, repeat_weekdays: weekdays },
    value.target_date,
  ).replace(/^Every/, "every")}. Each occurrence is completed separately.`;
}

type SectionProps = Pick<Props, "value" | "update" | "minDate" | "errors">;

/** Chips that set a date; the one matching the current value is highlighted. */
function QuickPicks({
  picks,
  current,
  onPick,
  label,
  caption,
}: {
  picks: { label: string; date: string; disabled?: boolean }[];
  current: string | null | undefined;
  onPick: (date: string) => void;
  /** Accessible name for the group. */
  label: string;
  /** Short visible lead-in, e.g. "Length", when the chips need one. */
  caption?: string;
}) {
  // Picks outside the allowed range are left out rather than greyed.
  const available = picks.filter((pick) => !pick.disabled);
  if (!available.length) return null;
  return (
    <Box sx={quickDateRowSx} role="group" aria-label={label}>
      {caption && (
        <Typography component="span" sx={formHintTextSx}>
          {caption}
        </Typography>
      )}
      {available.map((pick) => (
        <Chip
          key={pick.label}
          size="small"
          label={pick.label}
          clickable
          color={pick.date === current ? "primary" : "default"}
          variant={pick.date === current ? "filled" : "outlined"}
          onClick={() => onPick(pick.date)}
        />
      ))}
    </Box>
  );
}

function OneTimeFields({
  value,
  update,
  minDate,
  today,
  errors,
}: SectionProps & { today: string }) {
  const targetError = errorText(errors?.target_date);
  const now = new Date();
  const endOfMonth = toInputDate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  );
  // Same date next month; a shorter month uses its last day (31 Jan → 28 Feb).
  const nextMonth = toInputDate(
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      Math.min(
        now.getDate(),
        new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate(),
      ),
    ),
  );
  const picks = [
    ...TARGET_PICKS.map((pick) => ({
      label: pick.label,
      date: shiftInputDate(today, pick.days),
    })),
    { label: "End of month", date: endOfMonth },
    { label: "Next month", date: nextMonth },
  ]
    // End of month can repeat another pick (or be today): keep unique, allowed dates.
    .filter(
      (pick, index, all) =>
        all.findIndex((other) => other.date === pick.date) === index,
    )
    .map((pick) => ({
      ...pick,
      disabled: Boolean(minDate && pick.date < minDate),
    }));

  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          required
          fullWidth
          type="date"
          label="Target completion"
          value={value.target_date}
          onChange={(event) => update("target_date", event.target.value)}
          error={Boolean(targetError)}
          helperText={targetError}
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: minDate },
          }}
        />
      </Grid>
      {/* Beside the date on wide screens (same row, centred on the field); under it on phones. */}
      <Grid size={{ xs: 12, sm: 6 }} display="flex" alignItems="center">
        <QuickPicks
          label="Target date quick picks"
          picks={picks}
          current={value.target_date}
          onPick={(date) => update("target_date", date)}
        />
      </Grid>
    </>
  );
}

function PeriodFields({ value, update, minDate, errors }: SectionProps) {
  const invalid = Boolean(
    value.start_date &&
    value.target_date &&
    value.start_date > value.target_date,
  );
  const targetError = errorText(errors?.target_date);
  const days = periodDays(value.start_date, value.target_date);
  const start = value.start_date ?? "";

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          required
          fullWidth
          type="date"
          label="Start date"
          value={start}
          onChange={(event) => {
            const next = event.target.value || null;
            update("start_date", next);
            // Keep the period valid: an end before the new start moves with it.
            if (next && value.target_date && value.target_date < next)
              update("target_date", next);
          }}
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: minDate },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          required
          fullWidth
          type="date"
          label="End date"
          value={value.target_date}
          onChange={(event) => update("target_date", event.target.value)}
          error={invalid || Boolean(targetError)}
          helperText={
            invalid
              ? "End date can't be before the start date."
              : (targetError ??
                (days ? `${plural(days, "day")} in total` : undefined))
          }
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: start || minDate },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        {/* Length picks set the end date, so they sit right under it. */}
        <Box mt={1}>
          <QuickPicks
            label="Period length quick picks"
            caption="Length"
            picks={PERIOD_PICKS.map((pick) => ({
              label: pick.label,
              date: start ? shiftInputDate(start, pick.days - 1) : "",
              disabled: !start,
            }))}
            current={value.target_date}
            onPick={(date) => update("target_date", date)}
          />
        </Box>
      </Grid>
    </>
  );
}

function RecurringFields({
  value,
  update,
  minDate,
  editing,
  errors,
}: SectionProps & { editing?: boolean }) {
  const frequency = value.repeat_frequency ?? "monthly";
  const interval = value.repeat_interval ?? 1;
  const weekdays = value.repeat_weekdays?.length
    ? value.repeat_weekdays
    : [anchorWeekday(value.target_date)];
  const monthlyMode = value.monthly_day_mode ?? "specific";
  const monthlyDay =
    value.repeat_day_of_month ?? anchorDayOfMonth(value.target_date);
  const untilInvalid = Boolean(
    value.repeat_until && value.repeat_until < value.target_date,
  );
  const intervalInvalid = !(interval >= 1);
  const targetError = errorText(errors?.target_date);

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Box sx={scheduleFieldHeadSx}>
          <FormLabel id="repeats-label" sx={scheduleFieldLabelSx}>
            Repeats
          </FormLabel>
        </Box>
        <AnimatedToggleGroup
          exclusive
          fullWidth
          value={frequency}
          aria-labelledby="repeats-label"
          onChange={(_, next) => next && update("repeat_frequency", next)}
        >
          {REPEAT_FREQUENCIES.map((item) => (
            <ToggleButton key={item} value={item}>
              {sentenceCase(item)}
            </ToggleButton>
          ))}
        </AnimatedToggleGroup>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          type="number"
          label="Every"
          value={value.repeat_interval ?? ""}
          onChange={(event) =>
            update(
              "repeat_interval",
              event.target.value === "" ? 0 : Number(event.target.value),
            )
          }
          error={intervalInvalid}
          helperText={intervalInvalid ? "Enter 1 or more." : undefined}
          slotProps={{
            htmlInput: { min: 1, max: 100, step: 1 },
            input: {
              endAdornment: (
                <Typography component="span" sx={formHintTextSx}>
                  {frequencyUnit(frequency, interval)}
                </Typography>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          required
          fullWidth
          type="date"
          label="Starts on"
          value={value.target_date}
          onChange={(event) => update("target_date", event.target.value)}
          error={Boolean(targetError)}
          helperText={targetError}
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: minDate },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          type="date"
          label="Ends on (optional)"
          value={value.repeat_until ?? ""}
          onChange={(event) =>
            update("repeat_until", event.target.value || null)
          }
          error={untilInvalid}
          helperText={
            untilInvalid
              ? "Must be on or after the start date."
              : "Leave empty to keep repeating."
          }
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: value.target_date },
          }}
        />
      </Grid>

      {frequency === "weekly" && (
        <Grid size={{ xs: 12 }}>
          <Box sx={scheduleFieldHeadSx}>
            <FormLabel id="repeat-on-label" sx={scheduleFieldLabelSx}>
              Repeat on
            </FormLabel>
            <Typography component="span" sx={formHintTextSx}>
              {plural(weekdays.length, "day")} a week
            </Typography>
          </Box>
          {/* Multi-select, so the plain segmented control (no gliding pill). */}
          <ToggleButtonGroup
            fullWidth
            value={weekdays}
            aria-labelledby="repeat-on-label"
            // At least one weekday stays selected.
            onChange={(_, next: number[]) =>
              next.length &&
              update(
                "repeat_weekdays",
                [...next].sort((a, b) => a - b),
              )
            }
          >
            {WEEKDAYS.map((day, index) => (
              <ToggleButton key={day} value={index} aria-label={day}>
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  {day.slice(0, 3)}
                </Box>
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{ display: { xs: "inline", sm: "none" } }}
                >
                  {day.charAt(0)}
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
      )}

      {frequency === "monthly" && (
        <>
          <Grid size={{ xs: 12, sm: monthlyMode === "specific" ? 8 : 12 }}>
            <Box sx={scheduleFieldHeadSx}>
              <FormLabel id="month-day-label" sx={scheduleFieldLabelSx}>
                Day of the month
              </FormLabel>
            </Box>
            <AnimatedToggleGroup
              exclusive
              fullWidth
              value={monthlyMode}
              aria-labelledby="month-day-label"
              onChange={(_, next) => next && update("monthly_day_mode", next)}
            >
              {MONTHLY_MODES.map((mode) => (
                <ToggleButton key={mode.value} value={mode.value}>
                  {mode.label}
                </ToggleButton>
              ))}
            </AnimatedToggleGroup>
          </Grid>
          {monthlyMode === "specific" && (
            <Grid size={{ xs: 12, sm: 4 }} alignSelf="flex-end">
              <TextField
                select
                fullWidth
                label="Day"
                value={monthlyDay}
                onChange={(event) =>
                  update("repeat_day_of_month", Number(event.target.value))
                }
              >
                {Array.from({ length: 31 }, (_, index) => index + 1).map(
                  (day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>
          )}
          {monthlyMode === "specific" && monthlyDay > 28 && (
            <Grid size={{ xs: 12 }}>
              <Typography sx={formHintTextSx}>
                Months without day {monthlyDay} use their last day.
              </Typography>
            </Grid>
          )}
        </>
      )}

      {editing && (
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            label={
              <>
                <Box component="span" display="block">
                  Schedule active
                </Box>
                <Typography component="span" sx={formHintTextSx}>
                  Pausing stops reminders; existing occurrences stay available.
                </Typography>
              </>
            }
            control={
              <Checkbox
                checked={value.is_active !== false}
                onChange={(event) => update("is_active", event.target.checked)}
              />
            }
            sx={scheduleActiveLabelSx}
          />
        </Grid>
      )}
    </>
  );
}
