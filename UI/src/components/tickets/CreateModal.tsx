import { useEffect, useMemo, useState, type ChangeEvent } from "react";
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
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";

import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import api from "../../api/axios";
import type { SelectChangeEvent } from "@mui/material";
import type {
  TicketData,
  TicketFormData,
  groupData,
} from "../../types/dataTypes";
import {
  ticketsCreateModalBoxSx1,
  ticketsCreateModalBoxSx2,
  ticketsCreateModalBoxSx3,
  ticketsCreateModalButtonSx1,
  ticketsCreateModalIconButtonSx1,
  ticketsCreateModalTypographySx1,
} from "../../styles/common";
import { showNotification } from "../../api/notificationService";

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

function isValidationErrorResponse(
  error: unknown,
): error is ValidationErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const emptyForm: TicketFormData = {
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

const getAttachmentName = (pathOrName?: string) =>
  (pathOrName?.split("/").pop() ?? "").trim();

const getAttachmentKey = (pathOrName?: string) =>
  getAttachmentName(pathOrName).toLowerCase();

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
  const [formData, setFormData] = useState<TicketFormData>(emptyForm);
  const [formErrorData, setFormErrorData] = useState<
    Partial<Record<keyof TicketFormData, string | string[]>>
  >({});
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
        : emptyForm,
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
          source.filter((dept) => dept.manager && dept.manager.id !== userId),
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

  const handleAttachmentChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);

    if (!selectedFiles.length) {
      event.currentTarget.value = "";
      return;
    }

    setFormData((current) => {
      const existingAttachmentKeys = new Set([
        ...current.files.map((file) => getAttachmentKey(file.file)),
        ...current.newAttachments.map((file) => getAttachmentKey(file.name)),
      ]);

      const uniqueFiles: File[] = [];
      let duplicateCount = 0;

      selectedFiles.forEach((file) => {
        const key = getAttachmentKey(file.name);

        if (!key || existingAttachmentKeys.has(key)) {
          duplicateCount += 1;
          return;
        }

        existingAttachmentKeys.add(key);
        uniqueFiles.push(file);
      });

      if (duplicateCount > 0) {
        showNotification({
          type: "warning",
          message:
            duplicateCount === 1
              ? "Duplicate attachment skipped."
              : `${duplicateCount} duplicate attachments skipped.`,
        });
      }

      if (!uniqueFiles.length) {
        return current;
      }

      return {
        ...current,
        newAttachments: [...current.newAttachments, ...uniqueFiles],
      };
    });

    event.currentTarget.value = "";
  };

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
        message: Data
          ? "Ticket updated successfully."
          : "Ticket created successfully.",
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
    !formData.description.trim() ||
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
    >
      <DialogTitle component="div">
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
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
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
              required
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
                  <MenuItem key={item.id} value={item.id}>
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
          <Grid size={{ xs: 6, sm: 4 }}>
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
          <Grid size={{ xs: 6, sm: 4 }}>
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
                startIcon={<AttachFileOutlinedIcon />}
                sx={ticketsCreateModalButtonSx1}
              >
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleAttachmentChange}
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
                      <ClearOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<CancelOutlinedIcon />}
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={Data ? <UpdateOutlinedIcon /> : <SendOutlinedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
        >
          {loading ? "Saving…" : Data ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
