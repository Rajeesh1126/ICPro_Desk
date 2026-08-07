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
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import api from "../../api/axios";
import { showNotification } from "../../api/NotificationService";
import type {
  SelfTicketData,
  SelfTicketFormData,
} from "../../types/TicketData";
import {
  compactFieldSx,
  marginTopSmallSx,
  modalActionButtonSx,
  modalFormActionsSx,
  modalFormContentSx,
  modalFormHeaderSx,
  modalFormPaperSx,
  selfTicketsCreateModelBoxSx1,
  selfTicketsCreateModelBoxSx2,
  selfTicketsCreateModelBoxSx3,
  selfTicketsCreateModelBoxSx4,
  selfTicketsCreateModelBoxSx5,
  selfTicketsCreateModelBoxSx6,
  selfTicketsCreateModelChipSx1,
  selfTicketsCreateModelDynamicDynamicPopperSx1,
  selfTicketsCreateModelFormControlLabelSx1,
  selfTicketsCreateModelIconButtonSx1,
  selfTicketsCreateModelInfoOutlinedSx1,
  selfTicketsCreateModelInfoOutlinedSx2,
  selfTicketsCreateModelPaperSx1,
  selfTicketsCreateModelStackSx1,
  selfTicketsCreateModelStackSx3,
  selfTicketsCreateModelTypographySx1,
  selfTicketsCreateModelTypographySx3,
  selfTicketsCreateModelTypographySx6,
  selfTicketsCreateModelTypographySx7,
  selfTicketsCreateModelTypographySx8,
} from "../../styles/common";


type Props = {
  open: boolean;
  handleClose: () => void;
  Data: SelfTicketData | null;
};

type Priority = "high" | "medium" | "low" | "";


const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
};

const EMPTY_FORM: SelfTicketFormData = {
  task: "",
  description: "",
  current_status: "open",
  est_hours: 0,
  priority: "",
  target_date: getTomorrowDate(),
  creator: "",
  type: "",
  ticket_number: "",
  reminder_interval: 0,
};



const reminderExamples = [
  { days: 0, label: "NIL" },
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
}: Props) {
  const [formData, setFormData] = useState<SelfTicketFormData>(EMPTY_FORM);
  const [formErrorData, setFormErrorData] = useState<Partial<SelfTicketFormData>>();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
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
        type: Data.type || "",
        ticket_number: Data.ticket_number || "",
        reminder_interval: Data.reminder_interval ?? 0,
      }
      : EMPTY_FORM;

    setFormData(data);
    setChecked(!!data.ticket_number);
  }, [Data, open]);

  const update = <K extends keyof SelfTicketFormData>(
    field: K,
    value: SelfTicketFormData[K],
  ) => setFormData((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "id") {
          payload.append(key, String(value));
        }
      });
      await api[Data ? "patch" : "post"](
        Data ? `/self-tickets/${Data.id}/` : "/self-tickets/",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      handleClose();
      showNotification({
        type: "success",
        message: Data ? "Do List task updated successfully." : "Do List task created successfully.",
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        setFormErrorData(error.response.data);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const invalid =
    !formData.task.trim() ||
    !formData.priority ||
    !formData.target_date ||
    !formData.type;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: modalFormPaperSx }}
    >
      <DialogTitle component="div" sx={modalFormHeaderSx}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
        >
          <Box minWidth={0}>
            <Typography variant="h6" sx={selfTicketsCreateModelTypographySx1}>
              {Data ? "Edit self task" : "Create self task"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={marginTopSmallSx}
            >
              Plan an action or follow-up with reminders.
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            disabled={loading}
            sx={selfTicketsCreateModelIconButtonSx1}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={modalFormContentSx}>
        <Stack spacing={2.25}>
          <Box>
            <Typography sx={selfTicketsCreateModelTypographySx3} gutterBottom>
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

              <Grid size={{ xs: 12, sm: 4 }}>
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

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl required fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
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

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl required fullWidth>
                  <InputLabel>Task type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Task type"
                    onChange={(event) => update("type", event.target.value)}
                  >
                    <MenuItem value="action">Action</MenuItem>
                    <MenuItem value="follow-up">Follow-up</MenuItem>
                    <MenuItem value="Info">Info</MenuItem>
                    <MenuItem value="Review">Review</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography sx={selfTicketsCreateModelTypographySx3} gutterBottom>
              Schedule and Reminders
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  label="Target completion"
                  type="date"
                  fullWidth
                  value={formData.target_date}
                  onChange={(event) =>
                    update("target_date", event.target.value)
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: tomorrow },
                  }}
                // sx={compactFieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Reminder interval (days)"
                  type="number"
                  fullWidth
                  value={formData.reminder_interval}
                  onChange={(event) =>
                    // update("reminder_interval", event.target.value)
                    update(
                      "reminder_interval",
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value),
                    )
                  }
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  // sx={compactFieldSx}
                  onFocus={(event) => setReminderAnchor(event.currentTarget)}
                  onBlur={() => setReminderAnchor(null)}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography sx={selfTicketsCreateModelTypographySx3} gutterBottom>
              Related task
            </Typography>
            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 12, sm: 8 }}>
                <FormControlLabel
                  label="Is this task linked to any other task?"
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
                  sx={selfTicketsCreateModelFormControlLabelSx1}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Related task number"
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
          sx={selfTicketsCreateModelDynamicDynamicPopperSx1({})}
        >
          <Paper elevation={8} sx={selfTicketsCreateModelPaperSx1}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={selfTicketsCreateModelStackSx1}
            >
              <Box sx={selfTicketsCreateModelBoxSx1}>
                <InfoOutlined sx={selfTicketsCreateModelInfoOutlinedSx1} />
              </Box>
              <Typography
                variant="subtitle2"
                fontWeight={900}
                lineHeight={1.1}
                color="text.primary"
              >
                Reminder Interval Guidelines
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={selfTicketsCreateModelTypographySx6}
            >
              Enter the reminder interval as the number of days between each
              notification. Reminder notifications will be sent automatically
              based on the selected interval.
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.75}
              sx={selfTicketsCreateModelStackSx1}
            >
              {reminderExamples.map(({ days, label }) => (
                <Chip
                  key={days}
                  label={
                    <Box component="span" sx={selfTicketsCreateModelBoxSx2}>
                      <Box component="span" sx={selfTicketsCreateModelBoxSx3}>
                        {days} {days === 0 || days === 1 ? "day" : "days"}
                      </Box>
                      <Box component="span" sx={selfTicketsCreateModelBoxSx4}>
                        {" - "}
                        {label}
                      </Box>
                    </Box>
                  }
                  size="small"
                  sx={selfTicketsCreateModelChipSx1}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              sx={selfTicketsCreateModelTypographySx7}
            >
              Example: Enter <strong>7</strong> to send a reminder once every
              week.
            </Typography>
          </Paper>
        </Popper>
      </DialogContent>

      <DialogActions sx={modalFormActionsSx}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={selfTicketsCreateModelStackSx3}
        >
          <Box sx={selfTicketsCreateModelBoxSx5}>
            <InfoOutlined sx={selfTicketsCreateModelInfoOutlinedSx2} />
          </Box>
          <Typography
            variant="caption"
            sx={selfTicketsCreateModelTypographySx8}
          >
            Fields marked with{" "}
            <Box component="span" sx={selfTicketsCreateModelBoxSx6}>
              *
            </Box>{" "}
            are required.
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<CloseRoundedIcon />}
          onClick={handleClose}
          disabled={loading}
          sx={modalActionButtonSx}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={Data ? <SaveRoundedIcon /> : <AddTaskRoundedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
          sx={modalActionButtonSx}
        >
          {loading ? "Saving..." : Data ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

