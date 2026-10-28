import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { DOCUMENT_UPLOAD_RULES } from "@/components/common/FileUploadField";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { showNotification } from "@/api/notificationService";
import { getStoredPermissions } from "@/utils/permissions";
import {
  TicketCalendar,
  type CalendarItem,
} from "@/components/common/TicketPageParts";
import DialogHeader from "@/components/common/DialogHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useDiscardGuard } from "@/components/common/useDiscardGuard";
import { StatusPill } from "@/components/common/StatusPill";
import {
  page,
  contentPanel,
  pageContent,
  calendarDetailWhenSx,
  calendarDetailWhenIconSx,
  calendarDetailContentSx,
  calendarDetailSummarySx,
  calendarDetailLabelSx,
  calendarDetailValueSx,
  calendarDetailSectionSx,
  calendarDetailSectionHeadingSx,
  calendarDetailActionsSx,
  calendarDetailRoutineActionsSx,
  calendarFileButtonSx,
  calendarEntryFormSx,
  calendarFormFullRowSx,
  calendarFileNameSx,
  alignStartSx,
  preWrapTextSx,
  minWidthZero,
} from "@/styles/common";
import { dateFieldSx } from "@/styles/filters";
import PageHeader from "@/components/common/PageHeader";

type Attachment = { id: number; name: string; file: string };
type EntryType = "event" | "celebration" | "holiday" | "others";
type Entry = {
  id: number;
  title: string;
  description: string;
  entry_type: EntryType;
  status: "scheduled" | "completed" | "cancelled";
  start_at: string;
  end_at: string;
  all_day: boolean;
  /** Calendar date, date only (YYYY-MM-DD). Entries are shown on this day. */
  event_date: string | null;
  location: string;
  participants: number[];
  created_by: number | null;
  created_by_name: string;
  files: Attachment[];
};
type Form = Omit<
  Entry,
  | "id"
  | "created_by"
  | "created_by_name"
  | "files"
  | "status"
  | "all_day"
  | "participants"
  | "start_at"
  | "end_at"
  | "event_date"
> & { event_date: string };
type Item = CalendarItem & { entry: Entry };
const endpoint = "/calendar/entries/";
const ENTRY_TYPE_COLORS: Record<EntryType, string> = {
  event: "#2563eb",
  celebration: "#9333ea",
  holiday: "#16a34a",
  others: "#64748b",
};
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
/** The day an entry belongs on: its calendar date, else an older entry's start day. */
const entryDate = (entry: Entry) =>
  entry.event_date
    ? dayjs(entry.event_date)
    : dayjs(entry.start_at).startOf("day");
const initialForm = (eventDate = dayjs().format("YYYY-MM-DD")): Form => ({
  title: "",
  description: "",
  entry_type: "event",
  event_date: eventDate,
  location: "",
});
const formsMatch = (left: Form, right: Form) =>
  left.title === right.title &&
  left.description === right.description &&
  left.entry_type === right.entry_type &&
  left.event_date === right.event_date &&
  left.location === right.location;
function loggedUser(): number | null {
  const value = localStorage.getItem("user");
  const id = value ? Number(value) : NaN;

  return Number.isInteger(id) ? id : null;
}
export default function ICProCalendar() {
  const userId = useMemo(() => loggedUser(), []);
  const permissions = getStoredPermissions();
  const canAddCalendarEntry = permissions.has("add_calendarentry");
  const canChangeCalendarEntry = permissions.has("change_calendarentry");
  const canDeleteCalendarEntry = permissions.has("delete_calendarentry");
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const monthChanged = useCallback((year: number, monthIndex: number) => {
    setMonth((previous) =>
      previous.year() === year && previous.month() === monthIndex
        ? previous
        : dayjs(new Date(year, monthIndex, 1)),
    );
  }, []);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState<Form>(initialForm);
  const [initialEditorForm, setInitialEditorForm] = useState<Form>(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState<File[]>([]);
  const [removedFiles, setRemovedFiles] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  // Include adjoining grid days while keeping multi-day expansion bounded.
  const rangeStart = useMemo(() => month.subtract(7, "day"), [month]);
  const rangeEnd = useMemo(() => month.add(1, "month").add(14, "day"), [month]);
  const query = useApiQuery<Entry[]>(endpoint, {
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
  });
  const items = useMemo(() => {
    const result: Item[] = [];
    // One item per entry, on its target date.
    for (const entry of asArray<Entry>(query.data)) {
      const date = entryDate(entry);
      if (!date.isValid()) continue;
      result.push({
        id: entry.id,
        number: label(entry.entry_type),
        task: entry.title,
        target_date: date.format("YYYY-MM-DD"),
        current_status: label(entry.status),
        calendar_color: ENTRY_TYPE_COLORS[entry.entry_type],
        entry,
      });
    }
    return result;
  }, [query.data]);
  const closeEditor = () => {
    if (!saving) setEditorOpen(false);
  };
  const editorDirty =
    !formsMatch(form, initialEditorForm) ||
    uploads.length > 0 ||
    removedFiles.length > 0;
  const discard = useDiscardGuard(editorOpen, closeEditor, editorDirty);
  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };
  const openEditor = (entry?: Entry, targetDate?: string) => {
    const nextForm = entry
      ? {
        title: entry.title,
        description: entry.description,
        entry_type: entry.entry_type,
        location: entry.location,
        event_date: entryDate(entry).format("YYYY-MM-DD"),
      }
      : initialForm(targetDate);
    setUploads([]);
    setRemovedFiles([]);
    setEditing(entry ?? null);
    setForm(nextForm);
    setInitialEditorForm(nextForm);
    setError("");
    setSelected(null);
    setEditorOpen(true);
  };
  const save = async () => {
    const eventDate = dayjs(form.event_date);
    if (!form.title.trim() || !form.event_date || !eventDate.isValid()) {
      setError("Enter a title and a calendar date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        entry_type: form.entry_type,
        status: editing?.status ?? "scheduled",
        // Date only; no time is stored for the target date.
        event_date: eventDate.format("YYYY-MM-DD"),
        // Start/end are no longer entered. They are sent as the all-day span
        // of the target date so range filters keep working.
        start_at: eventDate.startOf("day").toISOString(),
        end_at: eventDate.add(1, "day").startOf("day").toISOString(),
        all_day: true,
        location: form.location,
        participants: [],
        remove_attachment_ids: removedFiles,
      };
      let body: typeof payload | FormData = payload;
      if (uploads.length) {
        body = new FormData();
        body.append("payload", JSON.stringify(payload));
        uploads.forEach((file) =>
          (body as FormData).append("attachments", file),
        );
      }
      const config = uploads.length
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
      if (editing) await api.patch(`${endpoint}${editing.id}/`, body, config);
      else await api.post(endpoint, body, config);
      setEditorOpen(false);
      showNotification({
        type: "success",
        message: editing
          ? "Calendar entry updated."
          : "Calendar entry created.",
      });
      void query.refetch();
    } catch {
      setError(
        "The entry could not be saved. Please check the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete(`${endpoint}${selected.id}/`);
      setDeleting(false);
      setSelected(null);
      showNotification({ type: "success", message: "Calendar entry deleted." });
      void query.refetch();
    } catch {
      showNotification({
        type: "error",
        message: "The entry could not be deleted.",
      });
    } finally {
      setSaving(false);
    }
  };
  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="ICPro Calendar"
          subtitle="Plan and review events, celebrations, holidays, and other important dates."
          actions={[
            {
              key: "refresh",
              priority: "medium",
              node: (
                <Tooltip title="Refresh calendar">
                  <span>
                    <IconButton
                      aria-label="Refresh calendar"
                      disabled={query.isFetching}
                      onClick={() => void query.refetch()}
                    >
                      <RefreshOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              ),
              menuItems: [
                {
                  key: "refresh",
                  label: "Refresh calendar",
                  icon: <RefreshOutlinedIcon fontSize="small" />,
                  onClick: () => void query.refetch(),
                  disabled: query.isFetching,
                },
              ],
            },
            canAddCalendarEntry && {
              key: "new",
              priority: "high",
              node: (
                <Button
                  variant="contained"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() => openEditor()}
                >
                  New calendar entry
                </Button>
              ),
              mobileNode: (
                <Button
                  variant="contained"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() => openEditor()}
                >
                  New entry
                </Button>
              ),
            },
          ]}
        />
        {/* <Box sx={calendarFilterBarSx}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={calendarFilterFieldsSx}>
            <TextField
              select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={calendarFilterFieldSx}
            >
              <MenuItem value="">All types</MenuItem>
              {["event", "meeting", "task"].map((value) => (
                <MenuItem key={value} value={value}>
                  {label(value)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={calendarFilterFieldSx}
            >
              <MenuItem value="">All statuses</MenuItem>
              {["scheduled", "completed", "cancelled"].map((value) => (
                <MenuItem key={value} value={value}>
                  {label(value)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            flexWrap="wrap"
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={calendarLegendLabelSx}
            >
              Status colors
            </Typography>
            {["scheduled", "completed", "cancelled"].map((value) => (
              <StatusPill key={value} status={value} />
            ))}
          </Stack>
        </Box> */}

        <Box sx={contentPanel}>
          <TicketCalendar
            tickets={items}
            loading={query.isPending}
            error={query.isError}
            noun="entry"
            dateVerb="scheduled"
            dateLabel="calendar date"
            showPriority={false}
            itemLabelOf={(item) => label(item.entry.entry_type)}
            agendaMetaOf={(item) =>
              `Date ${entryDate(item.entry).format("DD MMM YYYY")}`
            }
            onMonthChange={monthChanged}
            onOpen={(item) => setSelected(item.entry)}
            onCreate={
              canAddCalendarEntry
                ? (targetDate) => openEditor(undefined, targetDate)
                : undefined
            }
            isOverdue={() => false}
          />
        </Box>

      </Box>

      <Dialog
        open={selected !== null && !deleting}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="calendar-detail-title"
      >
        <DialogHeader
          id="calendar-detail-title"
          title={selected?.title}
          subtitle={
            selected
              ? `${label(selected.entry_type)} · ${selected.created_by_name || "Organizer unavailable"}`
              : undefined
          }
          actions={
            selected ? <StatusPill status={selected.status} /> : undefined
          }
          onClose={() => setSelected(null)}
        />
        {selected && (
          <DialogContent>
            <Box sx={calendarDetailContentSx}>
              <Box sx={calendarDetailSummarySx}>
                <Box sx={calendarDetailWhenSx}>
                  <Box sx={calendarDetailWhenIconSx}>
                    <EventOutlinedIcon />
                  </Box>
                  <Box sx={minWidthZero}>
                    <Typography sx={calendarDetailLabelSx}>Calendar date</Typography>
                    <Typography sx={calendarDetailValueSx}>
                      {entryDate(selected).format("dddd, DD MMM YYYY")}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={calendarDetailWhenSx}>
                  <Box sx={calendarDetailWhenIconSx}>
                    <PlaceOutlinedIcon />
                  </Box>
                  <Box sx={minWidthZero}>
                    <Typography sx={calendarDetailLabelSx}>Location</Typography>
                    <Typography sx={calendarDetailValueSx}>
                      {selected.location || "No location specified"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={calendarDetailSectionSx}>
                <Box sx={calendarDetailSectionHeadingSx}>
                  <NotesOutlinedIcon />
                  <Typography component="h3" variant="subtitle2">
                    Description
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={preWrapTextSx}>
                  {selected.description || "No description provided."}
                </Typography>
              </Box>
              {!!selected.files?.length && (
                <Box sx={calendarDetailSectionSx}>
                  <Box sx={calendarDetailSectionHeadingSx}>
                    <FolderOpenOutlinedIcon />
                    <Typography component="h3" variant="subtitle2">
                      Reference files ({selected.files.length})
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {selected.files.map((file) => (
                      <Button
                        key={file.id}
                        component="a"
                        href={file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<AttachFileOutlinedIcon />}
                        sx={calendarFileButtonSx}
                      >
                        {file.name}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </DialogContent>
        )}
        {(canChangeCalendarEntry || canDeleteCalendarEntry) && selected?.created_by === userId && (
          <DialogActions sx={calendarDetailActionsSx}>
            <Box sx={calendarDetailRoutineActionsSx}>
              {canChangeCalendarEntry && (
                <Button
                  variant="contained"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => selected && openEditor(selected)}
                >
                  Edit
                </Button>
              )}
              {canDeleteCalendarEntry && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlinedIcon />}
                  onClick={() => setDeleting(true)}
                >
                  Delete
                </Button>
              )}
            </Box>
          </DialogActions>
        )}
      </Dialog>

      <Dialog
        open={editorOpen}
        onClose={saving ? undefined : discard.requestClose}
        fullWidth
        maxWidth="md"
        aria-labelledby="calendar-editor-title"
      >
        <DialogHeader
          id="calendar-editor-title"
          title={editing ? "Edit calendar entry" : "New calendar entry"}
          subtitle={
            editing
              ? `Update the details for this ${editing.entry_type}.`
              : "Add a title, choose a type, and set the calendar date."
          }
          onClose={discard.requestClose}
          closeDisabled={saving}
        />
        <DialogContent>
          <Box
            component="form"
            id="calendar-entry-form"
            sx={calendarEntryFormSx}
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            {error && (
              <Alert severity="error" sx={calendarFormFullRowSx}>
                {error}
              </Alert>
            )}
            <TextField
              required
              label="Title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={form.entry_type}
              onChange={(e) =>
                update("entry_type", e.target.value as Form["entry_type"])
              }
            >
              {["event", "celebration", "holiday", "others"].map((v) => (
                <MenuItem key={v} value={v}>
                  {label(v)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              sx={calendarFormFullRowSx}
              multiline
              minRows={3}
              label="Description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
            <TextField
              required
              type="date"
              label="Calendar date"
              value={form.event_date}
              onChange={(e) => update("event_date", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={dateFieldSx}
            />
            <Stack spacing={1} sx={calendarFormFullRowSx}>
              <Typography variant="subtitle2">Reference files</Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileOutlinedIcon />}
                disabled={saving}
                sx={alignStartSx}
              >
                Attach files
                <input
                  type="file"
                  hidden
                  multiple
                  accept={DOCUMENT_UPLOAD_RULES.accept}
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = "";
                    if (!files.length) return;
                    if (
                      files.some(
                        (file) =>
                          file.size >
                          DOCUMENT_UPLOAD_RULES.maxSizeMb * 1024 * 1024,
                      )
                    ) {
                      setError("Each reference file must be 25 MB or smaller.");
                      return;
                    }
                    const allowed = DOCUMENT_UPLOAD_RULES.accept.split(",");
                    if (
                      files.some(
                        (file) =>
                          !allowed.includes(
                            `.${file.name.split(".").pop()?.toLowerCase()}`,
                          ),
                      )
                    ) {
                      setError(
                        "Choose a supported document, image, or ZIP file.",
                      );
                      return;
                    }
                    if (
                      (editing?.files?.length ?? 0) -
                      removedFiles.length +
                      uploads.length +
                      files.length >
                      10
                    ) {
                      setError("An entry can have at most 10 reference files.");
                      return;
                    }
                    setError("");
                    setUploads((previous) => [...previous, ...files]);
                  }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                {DOCUMENT_UPLOAD_RULES.acceptLabel}. Up to 10 files, 25 MB each.
              </Typography>
              {(editing?.files ?? [])
                .filter((file) => !removedFiles.includes(file.id))
                .map((file) => (
                  <Stack
                    key={file.id}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      variant="body2"
                      sx={calendarFileNameSx}
                    >
                      {file.name}
                    </Typography>
                    <Tooltip title="Remove attachment">
                      <IconButton
                        aria-label={`Remove ${file.name}`}
                        disabled={saving}
                        onClick={() => {
                          setRemovedFiles((previous) => [...previous, file.id]);
                        }}
                      >
                        <CloseOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              {uploads.map((file, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography
                    variant="body2"
                    sx={calendarFileNameSx}
                  >
                    {file.name}
                  </Typography>
                  <Tooltip title="Remove selected file">
                    <IconButton
                      aria-label={`Remove ${file.name}`}
                      disabled={saving}
                      onClick={() => {
                        setUploads((previous) =>
                          previous.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <CloseOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            form="calendar-entry-form"
            variant="contained"
            startIcon={editing ? <SaveOutlinedIcon /> : <AddOutlinedIcon />}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editing
                ? "Save changes"
                : "Create entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {discard.dialog}

      <ConfirmDialog
        open={deleting}
        title="Delete calendar entry?"
        description={selected?.title}
        confirmLabel={saving ? "Deleting..." : "Delete"}
        confirmColor="error"
        confirmDisabled={saving}
        onClose={() => {
          if (!saving) setDeleting(false);
        }}
        onConfirm={remove}
      />

    </Box>
  );
}
