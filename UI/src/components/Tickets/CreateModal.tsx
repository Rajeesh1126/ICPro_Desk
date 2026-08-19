import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import ClearIcon from "@mui/icons-material/Clear";
import api from "../../api/axios";
import type { SelectChangeEvent } from "@mui/material";
import type {
  TicketData,
  TicketFormData,
  groupData
} from "../../types/dataTypes";
import {
  modalActionButtonSx,
  modalFormActionsSx,
  modalFormContentSx,
  modalFormHeaderSx,
  modalFormPaperSx,
  ticketsCreateModalBoxSx1,
  ticketsCreateModalBoxSx2,
  ticketsCreateModalBoxSx3,
  ticketsCreateModalButtonSx1,
  ticketsCreateModalIconButtonSx1,
  ticketsCreateModalTypographySx1,
} from "../../styles/common";
import { showNotification } from "../../api/NotificationService";

type CreateTicketModalProps = {
  open: boolean;
  handleClose: () => void;
  Data: TicketData | null;
};
type Priority = "high" | "medium" | "low" | "";

type ValidationErrorResponse = {
  response?: {
    status?: number;
    data?: Partial<Record<keyof TicketFormData, string | string[]>>;
  };
};

function isValidationErrorResponse(error: unknown): error is ValidationErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
};

const EMPTY_FORM: TicketFormData = {
  task: "",
  description: "",
  department: "",
  current_status: "open",
  est_hours: 0,
  assigned_to: "",
  priority: "",
  target_date: getTomorrowDate(),
  files: [],
  newAttachments: [],
  deletedFileIds: [],
};

function loggedUser(): number | null {
	const value = localStorage.getItem("user");
	const id = value ? Number(value) : NaN;

	return Number.isInteger(id) ? id : null;
}

export default function CreateTicketModal({
  open,
  handleClose,
  Data,
}: CreateTicketModalProps) {
  const [formData, setFormData] = useState<TicketFormData>(EMPTY_FORM);
  const [formErrorData, setFormErrorData] = useState<Partial<Record<keyof TicketFormData, string | string[]>>>({});
  const [departments, setDepartments] = useState<groupData[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = useMemo(() => loggedUser(), []);

  useEffect(() => {
    if (!open) return;
    setFormData(
      Data
        ? {
          task: Data.task || "",
          description: Data.description || "",
          department: Data.department || "",
          current_status: Data.current_status || "open",
          est_hours: Data.est_hours,
          assigned_to: Data.assigned_to ?? "",
          priority: (Data.priority?.toLowerCase() as Priority) || "",
          target_date: Data.target_date || "",
          files: Data.files || [],
          newAttachments: [],
          deletedFileIds: [],
        }
        : EMPTY_FORM,
    );
    setFormErrorData({});
  }, [Data, open]);

  // Combine existing and newly selected attachments
  const allAttachments = [
    ...formData.files.map((file, index) => ({
      type: "existing" as const,
      index,
      name: file.file?.split("/").pop() ?? "",
    })),
    ...formData.newAttachments.map((file, index) => ({
      type: "new" as const,
      index,
      name: file.name,
    })),
  ];

  useEffect(() => {
    if (!open) return;
    let active = true;
    void api
      .get("/departments/")
      .then((response) => {
        if (!active) return;
        const source = (
          Array.isArray(response.data) ? response.data : []
        ) as groupData[];
        setDepartments(
          source.filter(
            (dept) => dept.manager && dept.manager.id !== userId,
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [open, userId]);

  const update = <K extends keyof TicketFormData>(
    field: K,
    value: TicketFormData[K],
  ) => setFormData((current) => ({ ...current, [field]: value }));

  const handleGroupChange = (event: SelectChangeEvent<number | string>) => {
    const selectedDepartment = departments.find(
      (item) => item.id === Number(event.target.value),
    );
    setFormData((current) => ({
      ...current,
      department: selectedDepartment?.id ?? "",
      assigned_to: selectedDepartment?.manager?.id ?? "",
    }));
  };

  const selectedDepartment = useMemo(
    () => departments.find((item) => item.id === Number(formData.department)),
    [departments, formData.department],
  );

  const assignedToName =
    selectedDepartment?.manager?.name ||
    selectedDepartment?.manager?.username ||
    Data?.assigned_to_name ||
    "";

  const errorText = (field: keyof TicketFormData) => {
    const error = formErrorData?.[field];
    if (Array.isArray(error)) {
      return error.join(" ");
    }
    if (typeof error === "string") {
      return error;
    }
    return undefined;
  };

  const submit = async () => {
    setLoading(true);

    try {
      const payload = new FormData();
      const selectedDepartmentForSubmit = departments.find(
        (item) => item.id === Number(formData.department),
      );
      const resolvedAssignedTo =
        formData.assigned_to || selectedDepartmentForSubmit?.manager?.id || "";
      const payloadData: TicketFormData = {
        ...formData,
        assigned_to: resolvedAssignedTo,
        department: formData.department ? Number(formData.department) : "",
        current_status: Data ? "open" : formData.current_status,
      };

      Object.entries(payloadData).forEach(([key, value]) => {
        if (
          key !== "id" &&
          key !== "files" &&
          key !== "newAttachments" &&
          key !== "deletedFileIds" &&
          value !== "" &&
          value != null
        ) {
          payload.append(key, String(value));
        }
      });

      formData.newAttachments.forEach((file) => {
        payload.append("attachments", file);
      });
      payload.append(
        "deleted_file_ids",
        JSON.stringify(formData.deletedFileIds),
      );

      await api[Data ? "patch" : "post"](
        Data ? `/tickets/${Data.id}/` : "/tickets/",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      handleClose();
      showNotification({
        type: "success",
        message:Data ? "Ticket updated successfully." : "Ticket created successfully.",
      });
    } catch (error: unknown) {
      if (isValidationErrorResponse(error) && error.response?.status === 400) {
        setFormErrorData(error.response.data ?? {});
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
    !formData.department ||
    !formData.assigned_to ||
    !formData.priority ||
    !formData.target_date;

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
        >
          <Box>
            <Typography variant="h6">
              {Data ? "Edit Ticket" : "Create Ticket"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add clear ownership, priority, and timing.
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            disabled={loading}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={modalFormContentSx}>
        <Grid container spacing={1.5} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              label="Subject"
              fullWidth
              value={formData.task}
              onChange={(event) => update("task", event.target.value)}
              error={!!formErrorData?.task}
              helperText={errorText("task")}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              multiline
              minRows={5}
              fullWidth
              value={formData.description}
              onChange={(event) => update("description", event.target.value)}
              error={!!formErrorData?.description}
              helperText={errorText("description")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl required fullWidth>
              <InputLabel>Teams</InputLabel>
              <Select
                value={formData.department}
                label="Teams"
                onChange={handleGroupChange}
              >
                {departments.map((item) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl required fullWidth>
              <InputLabel>Assigned to</InputLabel>
              <Select value={formData.assigned_to} label="Assigned to" disabled>
                {formData.assigned_to && (
                  <MenuItem value={formData.assigned_to}>
                    {assignedToName}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
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
                  event.target.value ? Number(event.target.value) : undefined,
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
            <TextField
              required
              label="Target completion"
              type="date"
              fullWidth
              value={formData.target_date}
              onChange={(event) => update("target_date", event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: tomorrow },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={ticketsCreateModalBoxSx1}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileRoundedIcon />}
                sx={ticketsCreateModalButtonSx1}
              >
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(event) => {
                    const files = Array.from(event.currentTarget.files ?? []);

                    update("newAttachments", [
                      ...formData.newAttachments,
                      ...files,
                    ]);

                    event.currentTarget.value = "";
                  }}
                />

                {formData.newAttachments.length > 0
                  ? "Add More"
                  : "Add Attachments"}
              </Button>

              <Box sx={ticketsCreateModalBoxSx2}>
                {allAttachments.map((attachment) => (
                  <Box
                    key={`${attachment.type}-${attachment.index}`}
                    sx={ticketsCreateModalBoxSx3}
                  >
                    <Typography
                      variant="caption"
                      sx={ticketsCreateModalTypographySx1}
                    >
                      {attachment.name}
                    </Typography>

                    <IconButton
                      size="small"
                      color="error"
                      sx={ticketsCreateModalIconButtonSx1}
                      onClick={() => {
                        if (attachment.type === "existing") {
                          const fileToDelete = formData.files[attachment.index];

                          setFormData((prev) => ({
                            ...prev,
                            deletedFileIds: [
                              ...prev.deletedFileIds,
                              fileToDelete.id!,
                            ],
                            files: prev.files.filter(
                              (_, i) => i !== attachment.index,
                            ),
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            newAttachments: prev.newAttachments.filter(
                              (_, i) => i !== attachment.index,
                            ),
                          }));
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={modalFormActionsSx}>
        <Button
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
          startIcon={Data ? <SaveRoundedIcon /> : <AddTaskRoundedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
          sx={modalActionButtonSx}
        >
          {loading ? "Saving…" : Data ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
