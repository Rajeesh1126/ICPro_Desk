import { Box, Typography } from "@mui/material";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import type { SelfTicketSchedule } from "@/types/dataTypes";
import { formatDate } from "@/components/common/formatDate";
import { sentenceCase } from "@/components/common/tableCell";
import {
  WEEKDAYS,
  anchorDayOfMonth,
  anchorWeekday,
  frequencyUnit,
  periodDays,
} from "@/components/selfTickets/schedule";
import {
  scheduleCardDayChipSx,
  scheduleCardDaysSx,
  scheduleCardHeadSx,
  scheduleCardIconSx,
  scheduleCardPausedSx,
  scheduleCardRangeSx,
  scheduleCardSx,
} from "@/styles/detailDialog";

/** "Monday and Thursday", "Monday, Wednesday and Friday". */
const joinWords = (words: string[]) =>
  words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;

const ordinal = (day: number) => {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10] ?? "th"}`;
};

/**
 * How a recurring or period task is scheduled, at a glance: the rule in
 * words, the weekdays it falls on (weekly), and the date range it covers.
 * `anchor` is the schedule's start (recurring) or end date (period).
 */
export default function ScheduleCard({ schedule, anchor }: { schedule: SelfTicketSchedule; anchor: string }) {
  const type = schedule.schedule_type;
  if (type !== "recurring" && type !== "period") return null;

  const paused = type === "recurring" && schedule.is_active === false;
  let title: string;
  let subtitle: string;
  let start: string | null | undefined;
  let end: string | null | undefined;
  let weekdays: number[] | null = null;

  if (type === "period") {
    const days = periodDays(schedule.start_date, anchor);
    title = "Continuous period";
    subtitle = days ? `Runs every day for ${days} day${days === 1 ? "" : "s"}` : "Runs every day of the period";
    start = schedule.start_date;
    end = anchor;
  } else {
    const frequency = schedule.repeat_frequency ?? "monthly";
    const interval = schedule.repeat_interval || 1;
    const every = interval === 1 ? "" : `every ${interval} ${frequencyUnit(frequency, interval)} `;
    title = interval === 1 ? `${sentenceCase(frequency)} recurrence` : `Every ${interval} ${frequencyUnit(frequency, interval)}`;
    start = anchor;
    end = schedule.repeat_until;

    if (frequency === "weekly") {
      weekdays = schedule.repeat_weekdays?.length ? schedule.repeat_weekdays : [anchorWeekday(anchor)];
      subtitle = `Repeats ${every}on ${joinWords([...weekdays].sort((a, b) => a - b).map((day) => WEEKDAYS[day]))}`;
    } else if (frequency === "monthly") {
      const mode = schedule.monthly_day_mode ?? "specific";
      const day =
        mode === "first" ? "the first day" : mode === "last" ? "the last day" : `the ${ordinal(schedule.repeat_day_of_month ?? anchorDayOfMonth(anchor))}`;
      subtitle = `Repeats ${every}on ${day} of the month`;
    } else if (frequency === "yearly") {
      const date = new Date(`${anchor}T00:00:00`);
      subtitle = `Repeats ${every}on ${date.toLocaleDateString(undefined, { day: "numeric", month: "long" })}`;
    } else {
      subtitle = interval === 1 ? "Repeats every day" : `Repeats ${every.trim()}`;
    }
  }

  return (
    <Box component="section" aria-label="Schedule" sx={scheduleCardSx}>
      <Box sx={scheduleCardHeadSx}>
        <Box sx={scheduleCardIconSx} aria-hidden="true">
          {type === "period" ? <DateRangeOutlinedIcon /> : <EventRepeatOutlinedIcon />}
        </Box>
        <Box minWidth={0} flex={1}>
          <Typography fontWeight={600} fontSize={14}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p">
            {subtitle}
          </Typography>
        </Box>
        {paused && (
          <Box component="span" sx={scheduleCardPausedSx}>
            <PauseCircleOutlineOutlinedIcon aria-hidden="true" />
            Paused
          </Box>
        )}
      </Box>

      {weekdays && (
        <Box sx={scheduleCardDaysSx} aria-label="Repeats on">
          {WEEKDAYS.map((day, index) => {
            const on = weekdays.includes(index);
            return (
              <Box
                key={day}
                component="span"
                aria-label={`${day}${on ? ", selected" : ""}`}
                sx={scheduleCardDayChipSx(on)}
              >
                {day.slice(0, 3)}
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={scheduleCardRangeSx}>
        <CalendarTodayOutlinedIcon aria-hidden="true" />
        <span>{start ? formatDate(start) : "Not set"}</span>
        <ArrowForwardOutlinedIcon aria-label="to" />
        <span>{end ? formatDate(end) : "No end date"}</span>
      </Box>
    </Box>
  );
}
