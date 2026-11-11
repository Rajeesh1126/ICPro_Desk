import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import api from "@/api/axios";
import { showNotification } from "@/api/notificationService";
import type {
  SelfTicketData,
  SelfTicketFormData,
} from "@/types/dataTypes";
import {
  compactFieldSx,
  reminderHelpIconBadgeSx,
  reminderExampleTextSx,
  reminderExampleDaysSx,
  reminderExampleLabelSx,
  requiredNoteIconBadgeSx,
  requiredMarkSx,
  reminderExampleChipSx,
  doListFormTooltipPopperSx,
  formSwitchLabelSx,
  reminderHelpIconSx,
  requiredNoteIconSx,
  reminderHelpPopoverSx,
  reminderHelpHeaderSx,
  requiredNoteRowSx,
  formDialogActionsSx,
  doListFormSectionTitleSx,
  reminderHelpIntroSx,
  reminderHelpExampleSx,
  requiredNoteTextSx,
} from "@/styles/common";
import DialogHeader from "@/components/common/DialogHeader";
import { useDiscardGuard } from "@/components/common/useDiscardGuard";
import ScheduleFields from "@/components/selfTickets/ScheduleFields";
import { reminderAnchorLabel } from "@/components/selfTickets/schedule";

type Props = {
  open: boolean;
  handleClose: () => void;
  Data: SelfTicketData | null;
  initialTargetDate?: string | null;
};

type Priority = "high" | "medium" | "low" | "";


const formatLocalInputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const getTodayDate = () => formatLocalInputDate(new Date());

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatLocalInputDate(tomorrow);
};

const emptyForm: SelfTicketFormData = {
  task: "",
  description: "",
  current_status: "open",
  est_hours: 0,
  priority: "",
  target_date: getTomorrowDate(),
  creator: "",
  ticket_number: "",
  reminder_interval: 0,
  schedule_type: "static",
  start_date: null,
  repeat_frequency: "monthly",
  repeat_interval: 1,
  repeat_weekdays: null,
  monthly_day_mode: "specific",
  repeat_day_of_month: null,
  repeat_until: null,
  is_active: true,
  reminder_mode: "before_due",
  reminder_days_before: null,
};



const reminderExamples = [
  { days: 0, label: "No reminder" },
  { days: 1, label: "Daily" },
  { days: 2, label: "Every Other Day" },
  { days: 7, label: "Weekly" },
  { days: 14, label: "Every Two Weeks (Bi-weekly)" },
  { days: 30, label: "Monthly" },
];

export default function CreateSelfTicketModel({
  open,
  handleClose,
  Data,
  initialTargetDate = null,
}: Props) {
  const [formData, setFormData] = useState<SelfTicketFormData>(emptyForm);
  const [formErrorData, setFormErrorData] = useState<Partial<SelfTicketFormData>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const [reminderAnchor, setReminderAnchor] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;

    const data = Data
      ? {
        task: Data.task || "",
        description: Data.description || "",
        current_status: Data.current_status || "open",
        est_hours: Data.est_hours,
        priority: (Data.priority?.toLowerCase() as Priority) || "",
        target_date: Data.target_date || "",
        creator: Data.creator ?? "",
        ticket_number: Data.ticket_number || "",
        reminder_interval: Data.reminder_interval ?? 0,
        schedule_type: Data.schedule_type ?? "static",
        start_date: Data.start_date ?? null,
        repeat_frequency: Data.repeat_frequency ?? "monthly",
        repeat_interval: Data.repeat_interval ?? 1,
        repeat_weekdays: Data.repeat_weekdays ?? null,
        monthly_day_mode: Data.monthly_day_mode ?? "specific",
        repeat_day_of_month: Data.repeat_day_of_month ?? null,
        repeat_until: Data.repeat_until ?? null,
        is_active: Data.is_active !== false,
        // Recurring tasks only support "before each occurrence" reminders.
        reminder_mode: Data.schedule_type === "recurring" ? "before_due" : Data.reminder_mode ?? "legacy",
        reminder_days_before: Data.reminder_days_before ?? null,
      }
      : {
          ...emptyForm,
          target_date: initialTargetDate || getTomorrowDate(),
        };

    setFormData(data);
    setChecked(!!data.ticket_number);
  }, [Data, open, initialTargetDate]);

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(open, handleClose);

  const update = <K extends keyof SelfTicketFormData>(
    field: K,
    value: SelfTicketFormData[K],
  ) => {
    discard.markDirty();
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api[Data ? "patch" : "post"](
        Data ? `/self-tickets/${Data.id}/` : "/self-tickets/",
        formData,
      );
      handleClose();
      showNotification({
        type: "success",
        message: Data ? "Do List task updated successfully." : "Do List task created successfully.",
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        error.response.status === 400 &&
        "data" in error.response
      ) {
        setFormErrorData(error.response.data as Partial<SelfTicketFormData>);
      }
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = getTomorrowDate();
  const targetDateMinimum = initialTargetDate ? getTodayDate() : tomorrow;
  const invalid =
    !formData.task.trim() ||
    !formData.priority ||
    !formData.target_date ||
    (formData.schedule_type === "period" &&
      (!formData.start_date || formData.start_date > formData.target_date)) ||
    (formData.schedule_type === "recurring" &&
      (!((formData.repeat_interval ?? 1) >= 1) ||
        Boolean(formData.repeat_until && formData.repeat_until < formData.target_date)));

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : discard.requestClose}
      onChangeCapture={discard.markDirty}
      fullWidth
      maxWidth="md"
    >
      <DialogHeader
        title={Data ? "Edit Task" : "New Task"}
        subtitle="Plan an action or follow-up with reminders."
        onClose={discard.requestClose}
        closeDisabled={loading}
      />

      <DialogContent >
        <Stack spacing={1.5}>
          <Box>
            <Typography sx={doListFormSectionTitleSx} gutterBottom>
              Task details
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  label="Subject"
                  fullWidth
                  value={formData.task}
                  onChange={(event) => update("task", event.target.value)}
                  error={!!formErrorData?.task}
                  helperText={formErrorData?.task}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  label="Description"
                  multiline
                  minRows={5}
                  fullWidth
                  value={formData.description}
                  onChange={(event) =>  update("description", event.target.value)}
                  error={!!formErrorData?.description}
                  helperText={formErrorData?.description} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Estimated hours"
                  type="number"
                  fullWidth
                  value={formData.est_hours ?? ""}
                  onChange={(event) =>
                    update(
                      "est_hours",
                      event.target.value
                        ? Number(event.target.value)
                        : 0,
                    )
                  }
                  slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl required fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    inputProps={{ "aria-label": "Priority" }}
                    value={formData.priority}
                    label="Priority"
                    onChange={(event) => update("priority", event.target.value)}
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography sx={doListFormSectionTitleSx} gutterBottom>
              Schedule
            </Typography>
            <Grid container spacing={1.5}>
              <ScheduleFields
                value={formData}
                update={update}
                hasOccurrences={Boolean(Data?.occurrences?.length)}
                editing={Boolean(Data)}
                minDate={Data ? undefined : targetDateMinimum}
                errors={formErrorData}
              />
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography sx={doListFormSectionTitleSx} gutterBottom>
              Reminders
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Remind me"
                  value={formData.reminder_mode ?? "before_due"}
                  onChange={(event) =>
                    update("reminder_mode", event.target.value as SelfTicketFormData["reminder_mode"])
                  }
                >
                  <MenuItem value="before_due">
                    Before {reminderAnchorLabel(formData.schedule_type)}
                  </MenuItem>
                  {/* Recurring tasks remind before each occurrence only. */}
                  {formData.schedule_type !== "recurring" && (
                    <MenuItem value="legacy">On a repeating interval</MenuItem>
                  )}
                </TextField>
              </Grid>

              {formData.reminder_mode === "legacy" ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Reminder interval (days)"
                    type="number"
                    fullWidth
                    value={formData.reminder_interval}
                    onChange={(event) =>
                      update(
                        "reminder_interval",
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                      )
                    }
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    helperText={
                      formData.reminder_interval
                        ? `A reminder every ${formData.reminder_interval} day${
                            formData.reminder_interval === 1 ? "" : "s"
                          }.`
                        : "0 means no reminder."
                    }
                    onFocus={(event) => setReminderAnchor(event.currentTarget)}
                    onBlur={() => setReminderAnchor(null)}
                  />
                </Grid>
              ) : (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Days before due"
                    type="number"
                    fullWidth
                    value={formData.reminder_days_before ?? ""}
                    onChange={(event) =>
                      update(
                        "reminder_days_before",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
                    helperText={
                      formData.reminder_days_before
                        ? `One reminder ${formData.reminder_days_before} day${
                            formData.reminder_days_before === 1 ? "" : "s"
                          } before ${reminderAnchorLabel(formData.schedule_type)}.`
                        : "Leave empty for no reminder."
                    }
                  />
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography sx={doListFormSectionTitleSx} gutterBottom>
              Related Ticket
            </Typography>
            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 12, sm: 8 }}>
                <FormControlLabel
                  label="Is this task linked to any other ticket?"
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(event) => {
                        const isChecked = event.target.checked;
                        setChecked(isChecked);

                        if (!isChecked) {
                          update("ticket_number", ""); // or "" depending on your API
                        }
                      }}
                    />
                  }
                  sx={formSwitchLabelSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Related ticket number"
                  fullWidth
                  value={formData.ticket_number}
                  disabled={!checked}
                  onChange={(event) =>
                    update("ticket_number", event.target.value)
                  }
                  sx={compactFieldSx}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>

        <Popper
          open={Boolean(reminderAnchor)}
          anchorEl={reminderAnchor}
          placement="bottom-start"
          sx={doListFormTooltipPopperSx()}
        >
          <Paper elevation={8} sx={reminderHelpPopoverSx}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={reminderHelpHeaderSx}
            >
              <Box sx={reminderHelpIconBadgeSx}>
                <InfoOutlinedIcon sx={reminderHelpIconSx} />
              </Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                lineHeight={1.1}
                color="text.primary"
              >
                Reminder Interval Guidelines
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={reminderHelpIntroSx}
            >
              Enter the reminder interval as the number of days between each
              notification. Reminder notifications will be sent automatically
              based on the selected interval.
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.75}
              sx={reminderHelpHeaderSx}
            >
              {reminderExamples.map(({ days, label }) => (
                <Chip
                  key={days}
                  label={
                    <Box component="span" sx={reminderExampleTextSx}>
                      <Box component="span" sx={reminderExampleDaysSx}>
                        {days} {days === 0 || days === 1 ? "day" : "days"}
                      </Box>
                      <Box component="span" sx={reminderExampleLabelSx}>
                        {" - "}
                        {label}
                      </Box>
                    </Box>
                  }
                  sx={reminderExampleChipSx}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              sx={reminderHelpExampleSx}
            >
              Example: Enter <strong>7</strong> to send a reminder once every
              week.
            </Typography>
          </Paper>
        </Popper>
      </DialogContent>

      <DialogActions sx={formDialogActionsSx}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={requiredNoteRowSx}
        >
          <Box sx={requiredNoteIconBadgeSx}>
            <InfoOutlinedIcon sx={requiredNoteIconSx} />
          </Box>
          <Typography
            variant="caption"
            sx={requiredNoteTextSx}
          >
            Fields marked with{" "}
            <Box component="span" sx={requiredMarkSx}>
              *
            </Box>{" "}
            are required.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          startIcon={Data ? <SaveOutlinedIcon /> : <AddOutlinedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
        >
          {loading ? "Saving..." : Data ? "Save changes" : "Create task"}
        </Button>
      </DialogActions>
      {discard.dialog}
    </Dialog>
  );
}
