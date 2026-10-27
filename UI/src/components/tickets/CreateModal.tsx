import { useDiscardGuard } from "@/components/common/useDiscardGuard";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import api from "@/api/axios";
import { sanitizeUserMessage } from "@/utils/errorUtils";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import type { SelectChangeEvent } from "@mui/material";
import type {
  TicketData,
  TicketFormData,
  groupData,
  UserSummary,
} from "@/types/dataTypes";
import {
  dateFieldSx,
  attachmentDropZoneSx,
  ticketAttachmentListSx,
  attachmentChipSx,
  attachmentButtonSx,
  attachmentRemoveButtonSx,
  ticketAttachmentNameSx,
  attachmentHintSx,
  topSpacingSx,
} from "@/styles/common";
import { showNotification } from "@/api/notificationService";
import DialogHeader from "@/components/common/DialogHeader";

type CreateTicketModalProps = {
  open: boolean;
  handleClose: () => void;
  Data: TicketData | null;
  internalMode?: boolean;
  departmentsOverride?: groupData[];
  assignableUsers?: UserSummary[];
  initialTargetDate?: string | null;
};
type Priority = "high" | "medium" | "low" | "";

const emptyAssignableUsers: UserSummary[] = [];

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

const emptyForm: TicketFormData = {
  task: "",
  description: "",
  department: "",
  current_status: "open",
  is_internal: false,
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

const getUserId = (user?: UserSummary) => user?.id ?? user?.users_id ?? "";

function loggedUser(): number | null {
  const value = localStorage.getItem("user");
  const id = value ? Number(value) : NaN;

  return Number.isInteger(id) ? id : null;
}

export default function CreateTicketModal({
  open,
  handleClose,
  Data,
  internalMode = false,
  departmentsOverride,
  assignableUsers = emptyAssignableUsers,
  initialTargetDate = null,
}: CreateTicketModalProps) {
  const [formData, setFormData] = useState<TicketFormData>(emptyForm);
  const [formErrorData, setFormErrorData] = useState<
    Partial<Record<keyof TicketFormData, string | string[]>>
  >({});
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
          current_status: Data.current_status === "open" ? "open" : "revised",
          is_internal: Boolean(Data.is_internal),
          est_hours: Data.est_hours,
          assigned_to: Data.assigned_to ?? (internalMode ? getUserId(assignableUsers[0]) : ""),
          priority: (Data.priority?.toLowerCase() as Priority) || "",
          target_date: Data.target_date === "" || new Date(Data.target_date) < new Date(getTomorrowDate()) ? getTomorrowDate() : Data.target_date,
          files: Data.files || [],
          newAttachments: [],
          deletedFileIds: [],
        }
        : {
          ...emptyForm,
          target_date: initialTargetDate || getTomorrowDate(),
          is_internal: internalMode,
          department: internalMode ? departmentsOverride?.[0]?.id ?? "" : "",
          assigned_to: internalMode ? getUserId(assignableUsers[0]) : "",
        },
    );
    setFormErrorData({});
  }, [Data, open, internalMode, departmentsOverride, assignableUsers, initialTargetDate]);

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

  // Cached department list shared with the Users page; fetched only while
  // the dialog is open and no override is supplied.
  const departmentsQuery = useApiQuery<groupData[]>("/departments/", undefined, {
    enabled: open && !departmentsOverride,
  });
  const departments = useMemo(
    () =>
      departmentsOverride ??
      asArray<groupData>(departmentsQuery.data).filter(
        (dept) => dept.manager && dept.manager.id !== userId,
      ),
    [departmentsOverride, departmentsQuery.data, userId],
  );

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(open, handleClose);

  const update = <K extends keyof TicketFormData>(
    field: K,
    value: TicketFormData[K],
  ) => {
    discard.markDirty();
    setFormData((current) => ({ ...current, [field]: value }));
  };

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
    discard.markDirty();
    const selectedDepartment = departments.find(
      (item) => item.id === Number(event.target.value),
    );
    setFormData((current) => ({
      ...current,
      department: selectedDepartment?.id ?? "",
      assigned_to: internalMode
        ? current.assigned_to || getUserId(assignableUsers[0])
        : selectedDepartment?.manager?.id ?? "",
    }));
  };

  const selectedDepartment = useMemo(
    () => departments.find((item) => item.id === Number(formData.department)),
    [departments, formData.department],
  );

  const assignedToName =
    (internalMode
      ? assignableUsers.find((user) => (user.id ?? user.users_id) === formData.assigned_to)?.first_name
      : selectedDepartment?.manager?.name) ||
    selectedDepartment?.manager?.username ||
    Data?.assigned_to_name ||
    "";

  const errorText = (field: keyof TicketFormData) => {
    const error = formErrorData?.[field];
    if (Array.isArray(error)) {
      return sanitizeUserMessage(error.join(" "));
    }
    if (typeof error === "string") {
      return sanitizeUserMessage(error);
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
        formData.assigned_to ||
        (internalMode ? getUserId(assignableUsers[0]) : selectedDepartmentForSubmit?.manager?.id) ||
        "";
      const payloadData: TicketFormData = {
        ...formData,
        assigned_to: resolvedAssignedTo,
        department: formData.department ? Number(formData.department) : "",
        current_status: formData.current_status,
        // ? formData.current_status || Data.current_status
        // : formData.current_status,
        is_internal: Data ? Boolean(Data.is_internal) : internalMode,
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
          suppressGlobalError: true,
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
      }
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = getTomorrowDate();
  const targetDateMinimum = initialTargetDate ? getTodayDate() : tomorrow;
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
      onClose={loading ? undefined : discard.requestClose}
      onChangeCapture={discard.markDirty}
      fullWidth
      maxWidth="md"
    >
      <DialogHeader
        title={
          Data
            ? internalMode
              ? "Edit internal ticket"
              : "Edit ticket"
            : internalMode
              ? "New internal ticket"
              : "New ticket"
        }
        subtitle={
          internalMode
            ? "Work Let: assign internal work to one of your immediate reportees."
            : "Add clear ownership, priority, and timing."
        }
        onClose={discard.requestClose}
        closeDisabled={loading}
      />
      <DialogContent>
        <Grid container spacing={1.5} sx={topSpacingSx}>
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
              <InputLabel>Team</InputLabel>
              <Select
                value={formData.department}
                label="Team"
                onChange={handleGroupChange}
                disabled={internalMode}
              >
                {departments.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              {internalMode && (
                <FormHelperText>
                  Set to the team you manage: internal tickets stay within your team.
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl required fullWidth>
              <InputLabel>Assigned to</InputLabel>
              <Select
                value={formData.assigned_to}
                label="Assigned to"
                disabled={!internalMode}
                onChange={(event) =>
                  update("assigned_to", Number(event.target.value))
                }
              >
                {internalMode
                  ? assignableUsers.map((user) => {
                    const userId = user.id ?? user.users_id;
                    const userName =
                      [user.first_name, user.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      user.username ||
                      `User ${userId}`;

                    return (
                      <MenuItem key={userId} value={userId}>
                        {userName}
                      </MenuItem>
                    );
                  })
                  : formData.assigned_to && (
                    <MenuItem value={formData.assigned_to}>
                      {assignedToName}
                    </MenuItem>
                  )}
              </Select>
              <FormHelperText>
                {internalMode
                  ? Data
                    ? "One of your immediate reportees."
                    : "Pre-filled with your first reportee. Check it's the right person."
                  : selectedDepartment
                    ? "Assigned to the selected team’s manager."
                    : "Select a team first."}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label="Estimated hours"
              type="number"
              helperText="Enter decimal hours (for example, 1.5 hours)."
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
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: targetDateMinimum },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={attachmentDropZoneSx}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileOutlinedIcon />}
                sx={attachmentButtonSx}
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
              <Typography variant="caption" color="text.secondary" sx={attachmentHintSx}>
                Select one or more files. Duplicate file names are skipped.
              </Typography>

              <Box sx={ticketAttachmentListSx}>
                {allAttachments.map((attachment) => (
                  <Box
                    key={`${attachment.type}-${attachment.index}`}
                    sx={attachmentChipSx}
                  >
                    <Typography
                      variant="caption"
                      sx={ticketAttachmentNameSx}
                    >
                      {attachment.name}
                    </Typography>

                    <IconButton aria-label={`Remove attachment ${attachment.name}`}
                      color="error"
                      sx={attachmentRemoveButtonSx}
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
          variant="contained"
          startIcon={Data ? <SaveOutlinedIcon /> : <AddOutlinedIcon />}
          onClick={() => void submit()}
          disabled={loading || invalid}
        >
          {loading
            ? "Saving…"
            : Data
              ? "Save changes"
              : internalMode
                ? "Create internal ticket"
                : "Create ticket"}
        </Button>
      </DialogActions>
      {discard.dialog}
    </Dialog>
  );
}
