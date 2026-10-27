import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
// import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import type { TicketData } from "@/types/dataTypes";
import TableLoadingState from "@/components/common/TableLoadingState";
import { PriorityPill, StatusPill } from "@/components/common/StatusPill";
import {
  calendarKey,
  groupByTargetDate,
  isOverdueTicket,
  monthGrid,
  monthKeys,
  parseCalendarDate,
  shiftDay,
  shiftMonth,
  todayCalendarDay,
  type CalendarDay,
} from "@/utils/ticketDue";
import {
  CALENDAR_WEEKDAYS,
  formatDayHeading,
  formatDayLong,
  formatMonthYear,
} from "@/utils/dateRange";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { formatDate } from "@/components/common/formatDate";
import { VIEW_META, type BaseView, type PageView } from "@/components/common/viewMeta";
import {
  dueDateCellSx,
  overdueTagSx,
  recordNumberCellSx,
  recordNumberTextSx,
  toggleButton,
  buttonLabelFull,
  boardCardIndicatorsSx,
  boardCardTagSx,
  calendarAgendaMetaSx,
  calendarAgendaRowSx,
  calendarAgendaTitleSx,
  calendarBodySx,
  calendarCellSx,
  calendarCellHeaderSx,
  calendarCellActionsSx,
  calendarCreateButtonSx,
  calendarAgendaNumberSx,
  calendarChipDotSx,
  calendarChipSx,
  calendarChipTextSx,
  calendarCompactCountSx,
  calendarCountSx,
  calendarDayNumberSx,
  // calendarEmptySx,
  calendarGridSx,
  calendarGroupHeadingSx,
  calendarHeadingSx,
  calendarMoreSx,
  calendarNavSx,
  calendarPanelHeaderSx,
  calendarPanelSx,
  calendarPanelTitleSx,
  calendarPanelTitleBlockSx,
  calendarPanelCreateSx,
  calendarOverdueButtonSx,
  calendarShellSx,
  calendarStateSx,
  calendarToolbarSx,
  calendarToolbarActionsSx,
  calendarNavControlsSx,
  calendarTitleBlockSx,
  calendarSelectedDayEmptySx,
  calendarWeekRowSx,
  calendarWeekdaySx,
  columnPickerButtonSx,
  columnPickerHeadingSx,
  formatStatusLabel,
  getStatusColor,
} from "@/styles/common";

/* Pieces shared by the Do List, Tickets and Work Let pages. */

export type { BaseView, PageView } from "@/components/common/viewMeta";

/**
 * Segmented view switch in the page header. Pages list the views they
 * support, so Do List / Work Let never show a non-functional Calendar.
 */
export function ViewToggle<V extends PageView = BaseView>({
  value,
  onChange,
  views = ["table", "card"] as unknown as readonly V[],
}: {
  value: V;
  onChange: (next: V) => void;
  views?: readonly V[];
}) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, next: V | null) => next && onChange(next)}
      aria-label="View"
      sx={toggleButton}
    >
      {views.map((view) => (
        <ToggleButton
          key={view}
          value={view}
          aria-label={`${VIEW_META[view].label} view`}
        >
          {VIEW_META[view].icon}
          {/* Visible text when there is room; the aria-label covers phones. */}
          <Box component="span" sx={buttonLabelFull}>
            {VIEW_META[view].label}
          </Box>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/**
 * "Columns" menu for a table's secondary columns. `hidden` is the list of
 * hidden labels; desktop only (phone cards already show every field).
 */
export function ColumnPicker({
  options,
  hidden,
  onChange,
}: {
  options: readonly string[];
  hidden: readonly string[];
  onChange: (hidden: string[]) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const shown = options.filter((option) => !hidden.includes(option)).length;
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ViewColumnOutlinedIcon />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={columnPickerButtonSx}
      >
        Columns{shown ? ` (+${shown})` : ""}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <Typography component="li" sx={columnPickerHeadingSx}>
          More columns
        </Typography>
        {options.map((option) => {
          const checked = !hidden.includes(option);
          return (
            <MenuItem
              key={option}
              role="menuitemcheckbox"
              aria-checked={checked}
              onClick={() =>
                onChange(
                  checked
                    ? [...hidden, option]
                    : hidden.filter((label) => label !== option),
                )
              }
              dense
            >
              <Checkbox
                size="small"
                checked={checked}
                tabIndex={-1}
                disableRipple
              />
              {option}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

/** Number column: view + edit buttons, the record number, then any extras. */
export function RecordNumberCell({
  number,
  editTitle,
  editDisabled,
  onView,
  onEdit,
  children,
}: {
  number: string;
  editTitle: string;
  editDisabled: boolean;
  onView: () => void;
  onEdit: () => void;
  children?: ReactNode;
}) {
  return (
    <Box sx={recordNumberCellSx}>
      <Tooltip title="View details">
        <IconButton aria-label={`View ${number}`} onClick={onView}>
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={editTitle}>
        <span>
          <IconButton
            aria-label={`Edit ${number}`}
            onClick={onEdit}
            disabled={editDisabled}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Typography variant="body2" sx={recordNumberTextSx}>
        {number}
      </Typography>
      {children}
    </Box>
  );
}

/** Due / target date with an "Overdue" tag when it has passed. */
export function DueDateCell({
  date,
  overdue,
}: {
  date?: string | null;
  overdue: boolean;
}) {
  return (
    <Box sx={dueDateCellSx}>
      <Typography variant="body2">{formatDate(date)}</Typography>
      {overdue && (
        <Typography component="span" variant="caption" sx={overdueTagSx}>
          <EventBusyOutlinedIcon aria-hidden="true" />
          Overdue
        </Typography>
      )}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Tickets target-date calendar (read-only)                                    */
/* -------------------------------------------------------------------------- */

/** Anything with a number, subject and target date: tickets or Do List tasks. */
export type CalendarItem = {
  id?: number;
  number: string;
  task: string;
  target_date?: string | null;
  current_status?: string;
  priority?: string;
  alarm?: boolean;
};
type CalendarTicket = CalendarItem;

/** Per-page wording and rules (Tickets / Work Let defaults; Do List overrides). */
type CalendarMeta = {
  /** Singular noun used for counts and calendar instructions. */
  noun: string;
  /** Optional item-specific accessible name (for example, event type + title). */
  itemLabelOf: (item: CalendarItem) => string;
  /** Optional replacement for the default assignee + target date line. */
  agendaMetaOf?: (item: CalendarItem) => string | null | undefined;
  /** Wording for dated items, e.g. "due" or "scheduled". */
  dateVerb: string;
  /** Date context announced by the grid, e.g. "target date" or "date". */
  dateLabel: string;
  /** Whether priority is meaningful for this calendar's items. */
  showPriority: boolean;
  /** Who is shown in lists, e.g. the assignee or the task owner. */
  personOf: (item: CalendarItem) => string | null | undefined;
  /** The page's own overdue rule (reused unchanged). */
  isOverdue: (item: CalendarItem) => boolean;
};

const TICKET_META: CalendarMeta = {
  noun: "ticket",
  itemLabelOf: (item) => `Ticket ${item.number}`,
  dateVerb: "due",
  dateLabel: "target date",
  showPriority: true,
  personOf: (item) => (item as TicketData).assigned_to_name,
  isOverdue: (item) => isOverdueTicket(item as TicketData),
};

const CalendarMetaContext = createContext<CalendarMeta>(TICKET_META);

const capitalise = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

/** Preview rows per day cell; a busy day shows one less plus "+N more". */
const MAX_DAY_CHIPS = 2;

/**
 * Overdue styling only for a real target date: the app's overdue rule is
 * reused unchanged, but a missing / impossible date is never "overdue".
 */
const isCalendarOverdue = (ticket: CalendarTicket, meta: CalendarMeta) =>
  parseCalendarDate(ticket.target_date) !== null && meta.isOverdue(ticket);

/** Target date text for lists; invalid values are labelled, not reinterpreted. */
const targetDateText = (ticket: CalendarTicket) =>
  parseCalendarDate(ticket.target_date)
    ? formatDate(ticket.target_date)
    : ticket.target_date
      ? "Invalid date"
      : "No target date";

const pluralNoun = (word: string) =>
  word.endsWith("y") ? `${word.slice(0, -1)}ies` : `${word}s`;
const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : pluralNoun(word)}`;

/** Accessible one-line summary of a ticket's state (never colour alone). */
function ticketStateText(ticket: CalendarTicket, meta: CalendarMeta) {
  const parts = [
    `status ${formatStatusLabel(ticket.current_status) || "unknown"}`,
  ];
  if (meta.showPriority) {
    parts.push(`${ticket.priority || "Normal"} priority`);
  }
  if (isCalendarOverdue(ticket, meta)) parts.push("overdue");
  if (ticket.alarm === true) parts.push("reminder active");
  return parts.join(", ");
}

/** Month cells prioritize the subject; full ticket identifiers stay in the agenda. */
function CalendarTicketChip({
  ticket,
  onOpen,
}: {
  ticket: CalendarTicket;
  onOpen: (ticket: CalendarTicket) => void;
}) {
  const meta = useContext(CalendarMetaContext);
  const color = getStatusColor(ticket.current_status);
  const overdue = isCalendarOverdue(ticket, meta);
  return (
    <ButtonBase
      onClick={(event) => {
        event.stopPropagation();
        onOpen(ticket);
      }}
      // Keys on a chip act on the chip, not on the day grid.
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={`${meta.itemLabelOf(ticket)}: ${ticket.task}. ${ticketStateText(ticket, meta)}. Open details`}
      sx={calendarChipSx(color)}
    >
      {overdue ? (
        <EventBusyOutlinedIcon aria-hidden="true" color="error" />
      ) : ticket.alarm === true ? (
        <NotificationsActiveOutlinedIcon aria-hidden="true" color="warning" />
      ) : (
        <Box
          component="span"
          aria-hidden="true"
          sx={calendarChipDotSx(color)}
        />
      )}
      <Box component="span" sx={calendarChipTextSx}>
        {ticket.task}
      </Box>
    </ButtonBase>
  );
}

/** A ticket row for the day agenda, the Agenda view and "+N more" lists. */
function CalendarAgendaRow({
  ticket,
  onOpen,
}: {
  ticket: CalendarTicket;
  onOpen: (ticket: CalendarTicket) => void;
}) {
  const meta = useContext(CalendarMetaContext);
  return (
    <ButtonBase
      onClick={() => onOpen(ticket)}
      aria-label={`${meta.itemLabelOf(ticket)}: ${ticket.task}. ${ticketStateText(ticket, meta)}. Open details`}
      sx={calendarAgendaRowSx}
    >
      <Box sx={calendarAgendaTitleSx}>
        <Box component="span" sx={calendarAgendaNumberSx}>
          {ticket.number}
        </Box>
        <Box component="span">{ticket.task}</Box>
      </Box>
      <Typography component="span" sx={calendarAgendaMetaSx}>
        {meta.agendaMetaOf
          ? meta.agendaMetaOf(ticket)
          : `${meta.personOf(ticket) || "Unassigned"} · Target ${targetDateText(ticket)}`}
      </Typography>
      <Box sx={boardCardIndicatorsSx}>
        <StatusPill status={ticket.current_status} />
        {meta.showPriority && (
          <PriorityPill priority={ticket.priority || "Normal"} />
        )}
        {isCalendarOverdue(ticket, meta) && (
          <Box component="span" sx={boardCardTagSx("overdue")}>
            <EventBusyOutlinedIcon aria-hidden="true" />
            Overdue
          </Box>
        )}
        {ticket.alarm === true && (
          <Box component="span" sx={boardCardTagSx("reminder")}>
            <NotificationsActiveOutlinedIcon aria-hidden="true" />
            Reminder active
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
}

/** Tickets with a missing / invalid target date: always listed, never dropped. */
function UndatedSection({
  tickets,
  onOpen,
}: {
  tickets: CalendarTicket[];
  onOpen: (ticket: CalendarTicket) => void;
}) {
  const meta = useContext(CalendarMetaContext);
  if (!tickets.length) return null;
  return (
    <Box
      component="section"
      aria-label={`No target date, ${plural(tickets.length, meta.noun)}`}
    >
      <Box sx={calendarGroupHeadingSx}>
        <span>No target date</span>
        <span>{plural(tickets.length, meta.noun)}</span>
      </Box>
      {tickets.map((ticket) => (
        <CalendarAgendaRow
          key={ticket.id ?? ticket.number}
          ticket={ticket}
          onOpen={onOpen}
        />
      ))}
    </Box>
  );
}

/**
 * Target-date calendar for the Tickets page. Each ticket sits on its
 * `target_date` only (no created / actual dates, no spans, no invented
 * times). Navigation and selection are read-only: nothing is created,
 * rescheduled or edited here; a ticket opens the existing details dialog.
 */
export function TicketCalendar<T extends CalendarItem>({
  tickets,
  loading = false,
  error = false,
  onOpen: onOpenItem,
  onCreate,
  onMonthChange,
  noun = TICKET_META.noun,
  personOf,
  isOverdue,
  itemLabelOf,
  agendaMetaOf,
  dateVerb = "due",
  dateLabel = "target date",
  showPriority = true,
}: {
  tickets: T[];
  loading?: boolean;
  error?: boolean;
  onOpen: (ticket: T) => void;
  /** Opens the page's existing create dialog from eligible calendar dates. */
  onCreate?: (targetDate: string) => void;
  /** Notifies data-owning pages when the displayed month changes. */
  onMonthChange?: (year: number, monthIndex: number) => void;
  /** Singular item name for counts and calendar instructions. */
  noun?: string;
  /** Person shown in lists; defaults to the ticket assignee. */
  personOf?: (item: T) => string | null | undefined;
  /** The page's overdue rule; defaults to the ticket rule (isOverdueTicket). */
  isOverdue?: (item: T) => boolean;
  /** Name an item for assistive technology. Defaults to its noun and number. */
  itemLabelOf?: (item: T) => string;
  /** Replaces the default assignee and target date text in agenda rows. */
  agendaMetaOf?: (item: T) => string | null | undefined;
  /** Wording used for entries on dates; defaults to "due". */
  dateVerb?: string;
  /** Date description announced by the calendar grid. */
  dateLabel?: string;
  /** Whether to show a priority pill and include it in accessible labels. */
  showPriority?: boolean;
}) {
  const onOpen = (item: CalendarTicket) => onOpenItem(item as T);
  const meta = useMemo<CalendarMeta>(
    () => ({
      noun,
      itemLabelOf: itemLabelOf
        ? (item) => itemLabelOf(item as T)
        : (item) => `${capitalise(noun)} ${item.number}`,
      agendaMetaOf: agendaMetaOf
        ? (item) => agendaMetaOf(item as T)
        : undefined,
      dateVerb,
      dateLabel,
      showPriority,
      personOf: personOf ? (item) => personOf(item as T) : TICKET_META.personOf,
      isOverdue: isOverdue
        ? (item) => isOverdue(item as T)
        : TICKET_META.isOverdue,
    }),
    [
      noun,
      personOf,
      isOverdue,
      itemLabelOf,
      agendaMetaOf,
      dateVerb,
      dateLabel,
      showPriority,
    ],
  );
  const theme = useTheme();
  // Phones: a compact month (counts only) or the Agenda — never tiny chips.
  const compact = useMediaQuery(theme.breakpoints.down("sm"));
  const today = todayCalendarDay();
  const todayKey = calendarKey(today);

  const [cursor, setCursor] = useState({
    year: today.year,
    month: today.month,
  });
  const [selected, setSelected] = useState<CalendarDay>(today);
  // const [mode, setMode] = useState<"month" | "agenda">(compact ? "agenda" : "month");
  const [more, setMore] = useState<{
    anchor: HTMLElement;
    key: string;
    day: CalendarDay;
  } | null>(null);
  // Day to focus after the next render (keyboard moves may change month).
  const pendingFocus = useRef<string | null>(null);
  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const moreTitleId = useId();

  useEffect(() => {
    onMonthChange?.(cursor.year, cursor.month);
  }, [cursor.month, cursor.year, onMonthChange]);

  // Derived once per data change; changing month re-uses it (no refetch).
  const { byDate, undated } = useMemo(
    () => groupByTargetDate(tickets),
    [tickets],
  );
  const days = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const keys = useMemo(() => monthKeys(cursor.year, cursor.month), [cursor]);
  const monthCount = useMemo(
    () =>
      keys.reduce((total, key) => total + (byDate.get(key)?.length ?? 0), 0),
    [byDate, keys],
  );
  const monthLabel = formatMonthYear(cursor.year, cursor.month);
  const selectedKey = calendarKey(selected);
  const selectedTickets = byDate.get(selectedKey) ?? [];
  const overdueTickets = useMemo(
    () =>
      [...byDate.values()]
        .flat()
        .filter(
          (ticket) =>
            meta.isOverdue(ticket as T) &&
            parseCalendarDate(ticket.target_date),
        )
        .sort((a, b) =>
          String(a.target_date).localeCompare(String(b.target_date)),
        ),
    [byDate, meta],
  );

  // Keyboard moves can cross into another month: focus the new cell once
  // the grid for that month has rendered.
  useEffect(() => {
    if (!pendingFocus.current) return;
    cellRefs.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  const selectDay = (day: CalendarDay, focus = false) => {
    setSelected(day);
    if (day.year !== cursor.year || day.month !== cursor.month) {
      setCursor({ year: day.year, month: day.month });
    }
    if (focus) pendingFocus.current = calendarKey(day);
  };

  const goToMonth = (delta: number) => {
    const next = shiftMonth(cursor.year, cursor.month, delta);
    setCursor(next);
    const last = new Date(next.year, next.month + 1, 0).getDate();
    setSelected((current) => ({ ...next, day: Math.min(current.day, last) }));
  };

  const goToday = () => {
    setCursor({ year: today.year, month: today.month });
    setSelected(today);
  };

  const sameDayInMonth = (day: CalendarDay, delta: number): CalendarDay => {
    const target = shiftMonth(day.year, day.month, delta);
    const last = new Date(target.year, target.month + 1, 0).getDate();
    return { ...target, day: Math.min(day.day, last) };
  };

  const onCellKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    day: CalendarDay,
  ) => {
    const weekday = (new Date(day.year, day.month, day.day).getDay() + 6) % 7; // Mon = 0
    const moves: Record<string, () => CalendarDay> = {
      ArrowLeft: () => shiftDay(day, -1),
      ArrowRight: () => shiftDay(day, 1),
      ArrowUp: () => shiftDay(day, -7),
      ArrowDown: () => shiftDay(day, 7),
      Home: () => shiftDay(day, -weekday),
      End: () => shiftDay(day, 6 - weekday),
      PageUp: () => sameDayInMonth(day, -1),
      PageDown: () => sameDayInMonth(day, 1),
    };
    if (moves[event.key]) {
      event.preventDefault();
      selectDay(moves[event.key](), true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDay(day);
    }
  };

  const weeks = Array.from({ length: 6 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
  const countText =
    `${plural(monthCount, noun)} ${dateVerb} in ${monthLabel}` +
    (undated.length ? ` · ${undated.length} without a target date` : "");

  // Phones get one short toolbar row so the grid and day panel stay in view.
  const shortMonthLabel = `${monthLabel.slice(0, 3)} ${cursor.year}`;
  const shortCountText =
    `${monthCount} ${dateVerb}` +
    (undated.length ? ` · ${undated.length} undated` : "");

  const toolbar = (
    <Box sx={calendarToolbarSx}>
      <Box sx={calendarNavSx}>
        <Box sx={calendarNavControlsSx}>
          <IconButton aria-label="Previous month" onClick={() => goToMonth(-1)}>
            <ChevronLeftOutlinedIcon />
          </IconButton>
          <IconButton aria-label="Next month" onClick={() => goToMonth(1)}>
            <ChevronRightOutlinedIcon />
          </IconButton>
        </Box>
        <Box sx={calendarTitleBlockSx}>
          <Typography
            component="h2"
            sx={calendarHeadingSx}
            aria-live="polite"
            aria-label={monthLabel}
          >
            {compact ? shortMonthLabel : monthLabel}
          </Typography>
          <Typography
            component="span"
            sx={calendarCountSx}
            aria-label={loading ? undefined : countText}
          >
            {loading ? "Loading…" : compact ? shortCountText : countText}
          </Typography>
        </Box>
      </Box>
      <Box sx={calendarToolbarActionsSx}>
        <Button size="small" variant="outlined" onClick={goToday}>
          Today
        </Button>
        {/* <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(_, next: "month" | "agenda" | null) => next && setMode(next)}
          aria-label="Calendar display"
          sx={toggleButton}
        >
          <ToggleButton value="month" aria-label="Month">
            <CalendarMonthOutlinedIcon />
            <Box component="span" sx={buttonLabelFull}>
              Month
            </Box>
          </ToggleButton>
          <ToggleButton value="agenda" aria-label="Agenda">
            <ViewAgendaOutlinedIcon />
            <Box component="span" sx={buttonLabelFull}>
              Agenda
            </Box>
          </ToggleButton>
        </ToggleButtonGroup> */}
        {overdueTickets.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<EventBusyOutlinedIcon />}
            aria-label={`Go to the earliest overdue ${noun} (${overdueTickets.length} overdue)`}
            onClick={() => {
              const target = parseCalendarDate(overdueTickets[0].target_date)!;
              setCursor({ year: target.year, month: target.month });
              setSelected(target);
            }}
            sx={calendarOverdueButtonSx}
          >
            {compact
              ? overdueTickets.length
              : `Overdue (${overdueTickets.length})`}
          </Button>
        )}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <CalendarMetaContext.Provider value={meta}>
        <Box sx={calendarShellSx}>
          {toolbar}
          <TableLoadingState
            variant="table"
            label={`Loading ${pluralNoun(noun)}`}
          />
        </Box>
      </CalendarMetaContext.Provider>
    );
  }

  if (error) {
    return (
      <CalendarMetaContext.Provider value={meta}>
        <Box sx={calendarShellSx}>
          {toolbar}
          <Box role="alert" sx={calendarStateSx}>
            <ErrorOutlineOutlinedIcon color="error" aria-hidden="true" />
            {capitalise(pluralNoun(noun))} couldn't be loaded, so nothing can be
            shown on the calendar. Try again in a moment.
          </Box>
        </Box>
      </CalendarMetaContext.Provider>
    );
  }

  // const datedKeys = keys.filter((key) => byDate.has(key));
  // const agenda = (
  //   <Box sx={calendarPanelSx}>
  //     {datedKeys.length ? (
  //       datedKeys.map((key) => {
  //         const [year, month, day] = key.split("-").map(Number);
  //         const list = byDate.get(key) ?? [];
  //         return (
  //           <Box key={key} component="section" aria-label={formatDayLong(year, month - 1, day)}>
  //             <Box sx={calendarGroupHeadingSx}>
  //               <span>
  //                 {formatDayHeading(year, month - 1, day)}
  //                 {key === todayKey ? " · Today" : ""}
  //               </span>
  //               <span>{plural(list.length, noun)}</span>
  //             </Box>
  //             {list.map((ticket) => (
  //               <CalendarAgendaRow key={ticket.id ?? ticket.number} ticket={ticket} onOpen={onOpen} />
  //             ))}
  //           </Box>
  //         );
  //       })
  //     ) : (
  //       <Typography sx={calendarEmptySx}>No {noun}s are due in {monthLabel}.</Typography>
  //     )}
  //     <UndatedSection tickets={undated} onOpen={onOpen} />
  //   </Box>
  // );

  return (
    <CalendarMetaContext.Provider value={meta}>
      <Box sx={calendarShellSx}>
        {toolbar}

        {/* {mode === "agenda" ? (
        agenda
      ) : ( */}
        <Box sx={calendarBodySx}>
          <Box
            role="grid"
            aria-label={`${capitalise(pluralNoun(noun))} by ${dateLabel}, ${monthLabel}`}
            sx={calendarGridSx}
          >
            <Box role="row" sx={calendarWeekRowSx}>
              {CALENDAR_WEEKDAYS.map((weekday) => (
                <Box
                  key={weekday}
                  role="columnheader"
                  aria-label={weekday}
                  sx={calendarWeekdaySx}
                >
                  {compact ? weekday.charAt(0) : weekday}
                </Box>
              ))}
            </Box>
            {weeks.map((week) => (
              <Box key={week[0].key} role="row" sx={calendarWeekRowSx}>
                {week.map((day) => {
                  const list = byDate.get(day.key) ?? [];
                  // Two preview rows at most: two tickets, or one plus "+N more".
                  const previews =
                    list.length > MAX_DAY_CHIPS
                      ? list.slice(0, MAX_DAY_CHIPS - 1)
                      : list;
                  const isSelected = day.key === selectedKey;
                  const isToday = day.key === todayKey;
                  return (
                    <Box
                      key={day.key}
                      ref={(node: HTMLDivElement | null) => {
                        if (node) cellRefs.current.set(day.key, node);
                        else cellRefs.current.delete(day.key);
                      }}
                      role="gridcell"
                      tabIndex={isSelected ? 0 : -1}
                      aria-selected={isSelected}
                      aria-label={`${formatDayLong(day.year, day.month, day.day)}${
                        isToday ? ", today" : ""
                      }, ${list.length ? `${plural(list.length, noun)} ${dateVerb}` : `no ${pluralNoun(noun)}`}`}
                      onClick={() => selectDay(day)}
                      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
                        onCellKeyDown(event, day)
                      }
                      sx={calendarCellSx({
                        inMonth: day.inMonth,
                        selected: isSelected,
                        compact,
                        isToday,
                      })}
                    >
                      {/* Top row: day number and add action only; previews and
                          the "+N more" link sit below in a fixed order. */}
                      <Box sx={calendarCellHeaderSx}>
                        <Box
                          component="span"
                          aria-hidden="true"
                          sx={calendarDayNumberSx({
                            inMonth: day.inMonth,
                            isToday,
                          })}
                        >
                          {day.day}
                        </Box>
                        <Box sx={calendarCellActionsSx}>
                          {onCreate && !compact && day.key >= todayKey && (
                            <Tooltip title={`Create ${noun}`}>
                              <IconButton
                                size="small"
                                aria-label={`Create ${noun} from ${formatDayLong(
                                  day.year,
                                  day.month,
                                  day.day,
                                )}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onCreate(day.key);
                                }}
                                onKeyDown={(event) => event.stopPropagation()}
                                sx={calendarCreateButtonSx}
                              >
                                <AddCircleOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      {compact ? (
                        list.length > 0 && (
                          <Box
                            component="span"
                            aria-hidden="true"
                            sx={calendarCompactCountSx}
                          >
                            {list.length}
                          </Box>
                        )
                      ) : (
                        <>
                          {previews.map((ticket) => (
                            <CalendarTicketChip
                              key={ticket.id ?? ticket.number}
                              ticket={ticket}
                              onOpen={onOpen}
                            />
                          ))}
                          {list.length > previews.length && (
                            <ButtonBase
                              aria-haspopup="dialog"
                              aria-label={`Show all ${plural(list.length, noun)} ${dateVerb} ${formatDayLong(
                                day.year,
                                day.month,
                                day.day,
                              )}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                selectDay(day);
                                setMore({
                                  anchor: event.currentTarget,
                                  key: day.key,
                                  day,
                                });
                              }}
                              onKeyDown={(event) => event.stopPropagation()}
                              sx={calendarMoreSx}
                            >
                              +{list.length - previews.length} more
                            </ButtonBase>
                          )}
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>

          {/* Selected day's agenda, plus tickets without a target date. */}
          <Box
            component="section"
            aria-label={`${capitalise(pluralNoun(noun))} ${dateVerb} ${formatDayLong(selected.year, selected.month, selected.day)}`}
            sx={calendarPanelSx}
          >
            <Box sx={calendarPanelHeaderSx}>
              <Box sx={calendarPanelTitleBlockSx}>
                <Typography component="h3" sx={calendarPanelTitleSx}>
                  {formatDayHeading(
                    selected.year,
                    selected.month,
                    selected.day,
                  )}
                  {selectedKey === todayKey ? " · Today" : ""}
                </Typography>
                <Typography component="span" sx={calendarCountSx}>
                  {plural(selectedTickets.length, noun)}
                </Typography>
              </Box>
              {onCreate && selectedKey >= todayKey && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() => onCreate(selectedKey)}
                  aria-label={`Create ${noun} ${dateVerb} ${formatDayLong(selected.year, selected.month, selected.day)}`}
                  sx={calendarPanelCreateSx}
                >
                  Add {noun}
                </Button>
              )}
            </Box>
            {selectedTickets.length ? (
              selectedTickets.map((ticket) => (
                <CalendarAgendaRow
                  key={ticket.id ?? ticket.number}
                  ticket={ticket}
                  onOpen={onOpen}
                />
              ))
            ) : (
              <Box sx={calendarSelectedDayEmptySx}>
                <CalendarMonthOutlinedIcon aria-hidden="true" />
                <Typography>
                  No {pluralNoun(noun)} are {dateVerb} on this day.
                </Typography>
                <Typography component="span">
                  Select another date to review its schedule.
                </Typography>
              </Box>
            )}
            <UndatedSection tickets={undated} onOpen={onOpen} />
          </Box>
        </Box>
        {/* )} */}

        {/* "+N more": every ticket for that date. Escape closes; focus returns. */}
        <Popover
          open={Boolean(more)}
          anchorEl={more?.anchor}
          onClose={() => setMore(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          slotProps={{
            paper: {
              role: "dialog",
              "aria-labelledby": moreTitleId,
              sx: {
                width: 380,
                maxWidth: "calc(100vw - 32px)",
                maxHeight: 420,
              },
            },
          }}
        >
          {more && (
            <>
              <Box sx={calendarPanelHeaderSx}>
                <Typography
                  id={moreTitleId}
                  component="h3"
                  sx={calendarPanelTitleSx}
                >
                  {formatDayHeading(
                    more.day.year,
                    more.day.month,
                    more.day.day,
                  )}
                </Typography>
                <Typography component="span" sx={calendarCountSx}>
                  {plural(byDate.get(more.key)?.length ?? 0, noun)}
                </Typography>
              </Box>
              {(byDate.get(more.key) ?? []).map((ticket) => (
                <CalendarAgendaRow
                  key={ticket.id ?? ticket.number}
                  ticket={ticket}
                  onOpen={(item) => {
                    setMore(null);
                    onOpen(item);
                  }}
                />
              ))}
            </>
          )}
        </Popover>
      </Box>
    </CalendarMetaContext.Provider>
  );
}
